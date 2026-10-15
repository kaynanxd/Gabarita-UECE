# /// script
# requires-python = ">=3.11"
# dependencies = ["pymupdf==1.28.2"]
# ///

"""Extrai um intervalo de questoes de um caderno digital da UECE.

O extrator e deliberadamente conservador: somente grava questoes com quatro
alternativas detectadas e resposta localizada no gabarito. Registros incompletos
sao reportados, nunca preenchidos por inferencia.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path

import pymupdf


QUESTION_RE = re.compile(r"^(\d{2})\.\s*(.*)")
OPTION_RE = re.compile(r"^([A-D])\)\s*(.*)")
ANSWER_HEADING_RE = re.compile(
    r"LÍNGUA\s+(ESPANHOLA|FRANCESA|INGLESA)\s*[-–—]\s*GABARITO\s+(?:DEFINITIVO|PRELIMINAR)\s+([1-4])",
    re.IGNORECASE,
)
LABELS = ("A", "B", "C", "D")
SECTION_HEADERS = {
    "lingua portuguesa", "matematica", "historia", "geografia", "fisica",
    "quimica", "biologia", "filosofia", "sociologia", "educacao fisica",
    "lingua espanhola", "lingua francesa", "lingua inglesa",
}
SECTION_SLUGS = {
    "lingua portuguesa": "portuguese",
    "matematica": "mathematics",
    "historia": "history",
    "geografia": "geography",
    "fisica": "physics",
    "quimica": "chemistry",
    "biologia": "biology",
    "filosofia": "philosophy",
    "sociologia": "sociology",
    "educacao fisica": "physical-education",
    "lingua espanhola": "spanish",
    "lingua francesa": "french",
    "lingua inglesa": "english",
}


@dataclass
class Line:
    page: int
    column: int
    bounds: tuple[float, float, float, float]
    text: str


@dataclass
class Segment:
    number: int
    section: str | None = None
    lines: list[Line] = field(default_factory=list)


def slug(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", ascii_value.lower()).strip("-")


def plain_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    return normalized.encode("ascii", "ignore").decode("ascii").lower().strip()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_jsonl(path: Path, records: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    contents = "".join(json.dumps(record, ensure_ascii=False) + "\n" for record in records)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(contents, encoding="utf-8")
    temporary.replace(path)


def upsert_many(path: Path, new_records: list[dict], owned_prefix: str) -> None:
    current = [record for record in read_jsonl(path) if not record.get("id", "").startswith(owned_prefix)]
    write_jsonl(path, sorted(current + new_records, key=lambda record: record["id"]))


def document_id_for(manifest_path: Path, pdf_path: Path, source_root: Path) -> str:
    relative = pdf_path.resolve().relative_to(source_root.resolve()).as_posix()
    for document in read_jsonl(manifest_path):
        if document["relativePath"] == relative:
            return document["id"]
    raise ValueError(f"Documento nao encontrado no inventario: {relative}")


def extract_lines(document: pymupdf.Document) -> list[Line]:
    result: list[Line] = []
    for page_index, page in enumerate(document):
        midpoint = page.rect.width / 2
        for block in page.get_text("dict", sort=True)["blocks"]:
            if "lines" not in block:
                continue
            for raw_line in block["lines"]:
                spans = raw_line.get("spans", [])
                span_groups: dict[int, list[dict]] = {0: [], 1: []}
                for span in spans:
                    sx0, _, sx1, _ = span["bbox"]
                    column = 0 if (sx0 + sx1) / 2 < midpoint else 1
                    span_groups[column].append(span)
                for column, group in span_groups.items():
                    if not group:
                        continue
                    group.sort(key=lambda span: span["bbox"][0])
                    text = "".join(span["text"] for span in group).strip()
                    if not text:
                        continue
                    x0 = min(span["bbox"][0] for span in group)
                    y0 = min(span["bbox"][1] for span in group)
                    x1 = max(span["bbox"][2] for span in group)
                    y1 = max(span["bbox"][3] for span in group)
                    if y0 < 55 or y1 > page.rect.height - 55:
                        continue
                    if "O número do gabarito deste caderno" in text or re.fullmatch(r"Página \d+", text):
                        continue
                    result.append(Line(page_index + 1, column, (x0, y0, x1, y1), text))
    return sorted(result, key=lambda line: (line.page, line.column, line.bounds[1], line.bounds[0]))


def segment_questions(lines: list[Line]) -> list[Segment]:
    segments: list[Segment] = []
    current: Segment | None = None
    current_section: str | None = None
    column_starts: dict[tuple[int, int], float] = {}
    for line in lines:
        key = (line.page, line.column)
        column_starts[key] = min(column_starts.get(key, line.bounds[0]), line.bounds[0])
    for index, line in enumerate(lines):
        normalized = plain_text(line.text)
        if normalized in SECTION_HEADERS:
            current_section = SECTION_SLUGS[normalized]
            continue
        match = QUESTION_RE.match(line.text)
        is_at_column_start = line.bounds[0] <= column_starts[(line.page, line.column)] + 18
        has_inline_statement = bool(match and match.group(2).strip())
        has_adjacent_statement = False
        if match and not has_inline_statement and index + 1 < len(lines):
            following = lines[index + 1]
            has_adjacent_statement = (
                following.page == line.page
                and following.column == line.column
                and abs(following.bounds[1] - line.bounds[1]) <= 5
                and following.bounds[0] > line.bounds[0]
                and not OPTION_RE.match(following.text)
                and not QUESTION_RE.match(following.text)
            )
        if match and (has_inline_statement or (is_at_column_start and has_adjacent_statement)):
            current = Segment(number=int(match.group(1)), section=current_section)
            segments.append(current)
            line = Line(line.page, line.column, line.bounds, match.group(2))
        if current is not None:
            current.lines.append(line)
    return segments


def parse_content(segment: Segment) -> tuple[str, list[dict]]:
    statement_parts: list[str] = []
    alternatives: dict[str, list[str]] = {}
    active_label: str | None = None
    for line in segment.lines:
        match = OPTION_RE.match(line.text)
        if match:
            active_label = match.group(1)
            alternatives[active_label] = [match.group(2)]
        elif active_label:
            alternatives[active_label].append(line.text)
        else:
            statement_parts.append(line.text)
    parsed = [
        {"id": f"alt-{label.lower()}", "text": " ".join(alternatives.get(label, [])).strip()}
        for label in LABELS
    ]
    return " ".join(statement_parts).strip(), parsed


def regions_for(segment: Segment, page_widths: dict[int, float]) -> list[dict]:
    grouped: dict[tuple[int, int], list[Line]] = {}
    for line in segment.lines:
        grouped.setdefault((line.page, line.column), []).append(line)
    regions = []
    for (page, column), lines in grouped.items():
        width = page_widths[page]
        x0 = 28 if column == 0 else width / 2 + 5
        x1 = width / 2 - 5 if column == 0 else width - 28
        y0 = max(55, min(line.bounds[1] for line in lines) - 5)
        y1 = max(line.bounds[3] for line in lines) + 5
        regions.append({"page": page, "bounds": [round(x0, 2), round(y0, 2), round(x1, 2), round(y1, 2)]})
    return regions


def parse_answer_key(document: pymupdf.Document, language: str | None, booklet: str) -> dict[int, str]:
    # Comunicados podem anexar centenas de páginas de resultados após o
    # gabarito. A CEV o publica no início; limitar a busca evita reler toda a
    # lista nominal uma vez por disciplina, sem ampliar a origem aceita.
    answer_pages = list(document[:10])
    text = "\n".join(page.get_text("text", sort=True) for page in answer_pages)
    sections = list(ANSWER_HEADING_RE.finditer(text))
    wanted_language = language.upper() if language else "ESPANHOLA"
    wanted_booklet = booklet.removeprefix("G")
    if not sections:
        answers = {}
        for page in answer_pages:
            midpoint = page.rect.width / 2
            rows: dict[tuple[int, int], list[tuple]] = {}
            for word in page.get_text("words", sort=True):
                row = round(word[1] / 3) * 3
                half = 0 if word[0] < midpoint else 1
                rows.setdefault((row, half), []).append(word)
            for words in rows.values():
                tokens = [word[4] for word in sorted(words, key=lambda item: item[0])]
                if len(tokens) < 6 or not tokens[0].isdigit():
                    continue
                values = tokens[-4:]
                if not all(value in "ABCDX" for value in values):
                    continue
                number = int(tokens[0])
                discipline = plain_text(" ".join(tokens[1:-4]))
                if number >= 78:
                    expected = plain_text(f"Lingua {wanted_language}")
                    if discipline != expected:
                        continue
                answers[number] = values[int(wanted_booklet) - 1]
        if set(answers) >= set(range(1, 86)):
            return answers

        # Alguns gabaritos mais antigos organizam cada idioma em uma página e
        # usam apenas "GABARITO 1", sem repetir o idioma ao lado da tabela.
        # Nesse caso, preservamos a leitura sequencial das três faixas
        # (1--30, 31--60 e 61--85), que é explicitamente impressa no PDF.
        expected_language = plain_text(f"lingua {wanted_language}")
        for page in answer_pages:
            page_text = page.get_text("text", sort=True)
            if expected_language not in plain_text(page_text):
                continue
            # Em 2017.1 a nota de rodape sobre uma resposta alterada foi
            # extraida no meio da ultima linha da tabela ("A* ... 61 ...").
            # A letra marcada com asterisco ja e a resposta definitiva; a nota
            # repetida deve sair antes da leitura sequencial.
            page_text = re.sub(
                r"\*?A resposta da quest[aã]o \d+ foi oficialmente\s+alterada para a letra [A-D]\.",
                "",
                page_text,
                flags=re.IGNORECASE,
            )
            bare_sections = list(re.finditer(r"GABARITO\s+([1-4])", page_text, re.IGNORECASE))
            for index, bare_heading in enumerate(bare_sections):
                if bare_heading.group(1) != wanted_booklet:
                    continue
                end = bare_sections[index + 1].start() if index + 1 < len(bare_sections) else len(page_text)
                tokens = re.findall(r"\b(?:\d{1,2}|[A-D]|Nula)\b", page_text[bare_heading.end():end], re.IGNORECASE)
                parsed: dict[int, str] = {}
                cursor = 0
                for start, stop in ((1, 30), (31, 60), (61, 85)):
                    size = stop - start + 1
                    number_tokens = tokens[cursor:cursor + size]
                    if not all(token.isdigit() for token in number_tokens):
                        break
                    numbers = [str(int(token)) for token in number_tokens]
                    if numbers != [str(number) for number in range(start, stop + 1)]:
                        break
                    cursor += size
                    values = tokens[cursor:cursor + size]
                    if len(values) != size or not all(value.upper() in {"A", "B", "C", "D", "NULA"} for value in values):
                        break
                    parsed.update({number: ("X" if value.upper() == "NULA" else value.upper()) for number, value in zip(range(start, stop + 1), values, strict=True)})
                    cursor += size
                if set(parsed) == set(range(1, 86)):
                    return parsed

                # O vestibular 2020.1 imprime as mesmas informações em quatro
                # blocos de vinte questões (em vez de 30/30/25). Leitura por
                # blocos preserva a regra essencial: números consecutivos devem
                # ser seguidos exatamente pela mesma quantidade de respostas.
                parsed = {}
                cursor = 0
                expected = 1
                while cursor < len(tokens) and expected <= 85:
                    start = cursor
                    numbers: list[int] = []
                    while cursor < len(tokens) and tokens[cursor].isdigit() and int(tokens[cursor]) == expected + len(numbers):
                        numbers.append(int(tokens[cursor]))
                        cursor += 1
                    if not numbers:
                        break
                    # Em alguns PDFs de 2017.1, a nota "A resposta da questão
                    # 61..." é intercalada entre o cabeçalho 61--70 e seus
                    # valores. O artigo "A" e o número citado não pertencem à
                    # tabela; a sequência de alternativas começa logo depois.
                    if (
                        cursor + 1 < len(tokens)
                        and tokens[cursor].upper() == "A"
                        and tokens[cursor + 1].isdigit()
                        and int(tokens[cursor + 1]) == numbers[0]
                    ):
                        cursor += 2
                    values = tokens[cursor:cursor + len(numbers)]
                    if len(values) != len(numbers) or not all(value.upper() in {"A", "B", "C", "D", "NULA"} for value in values):
                        break
                    parsed.update({number: ("X" if value.upper() == "NULA" else value.upper()) for number, value in zip(numbers, values, strict=True)})
                    cursor += len(numbers)
                    expected += len(numbers)
                if set(parsed) in (set(range(1, 61)), set(range(1, 71)), set(range(1, 81)), set(range(1, 86))):
                    return parsed
        raise ValueError("Nenhuma tabela de gabarito reconhecida")
    for index, heading in enumerate(sections):
        if heading.group(1).upper() != wanted_language or heading.group(2) != wanted_booklet:
            continue
        end = sections[index + 1].start() if index + 1 < len(sections) else len(text)
        tokens = re.findall(r"\b(?:\d{1,2}|[A-DX])\b", text[heading.end():end])
        answers: dict[int, str] = {}
        cursor = 0
        for start, stop in ((1, 30), (31, 60), (61, 85)):
            expected_numbers = [str(number) for number in range(start, stop + 1)]
            number_count = len(expected_numbers)
            actual_numbers = [str(int(token)) for token in tokens[cursor:cursor + number_count]]
            if actual_numbers != expected_numbers:
                raise ValueError(f"Sequencia de numeros inesperada no gabarito {booklet}")
            cursor += number_count
            values = tokens[cursor:cursor + number_count]
            if len(values) != number_count or not all(value in "ABCDX" for value in values):
                raise ValueError(f"Respostas incompletas no gabarito {booklet}")
            answers.update(zip(range(start, stop + 1), values, strict=True))
            cursor += number_count
        return answers
    raise ValueError(f"Gabarito nao encontrado: {wanted_language} {booklet}")


def parse_specific_answer_key(
    document: pymupdf.Document,
    subject: str,
    booklet: str,
    first_number: int = 1,
    last_number: int = 20,
) -> dict[int, str]:
    """Lê o bloco de uma disciplina em gabaritos da segunda fase.

    Esses documentos agrupam várias disciplinas, cada uma com Gabaritos 1--4
    de vinte itens. Diferentemente da primeira fase, não há idioma como chave.
    """
    subject_labels = {
        "biology": "BIOLOGIA", "mathematics": "MATEMÁTICA", "physics": "FÍSICA",
        "chemistry": "QUÍMICA", "geography": "GEOGRAFIA", "history": "HISTÓRIA",
        "philosophy": "FILOSOFIA", "sociology": "SOCIOLOGIA", "portuguese": "LÍNGUA PORTUGUESA",
        "spanish": "LÍNGUA ESPANHOLA", "french": "LÍNGUA FRANCESA", "english": "LÍNGUA INGLESA",
    }
    # Nos cadernos combinados do segundo dia, uma unica tabela de quarenta
    # itens e titulada pelo par de disciplinas. Ambas as metades usam a mesma
    # tabela, mas serao registradas como provas independentes de vinte itens.
    combined_labels = {
        "chemistry": "FÍSICA E QUÍMICA",
        "history": "GEOGRAFIA E HISTÓRIA",
        "sociology": "FILOSOFIA E SOCIOLOGIA",
    }
    wanted_label = combined_labels.get(subject, subject_labels.get(subject, subject.upper()))
    wanted_subject = plain_text(wanted_label)
    wanted_booklet = booklet.removeprefix("G")
    subject_names = "|".join(re.escape(name) for name in (
        "BIOLOGIA", "MATEMATICA", "FISICA", "QUIMICA", "GEOGRAFIA",
        "HISTORIA", "FILOSOFIA", "SOCIOLOGIA", "LINGUA PORTUGUESA",
        "LINGUA ESPANHOLA", "LINGUA FRANCESA", "LINGUA INGLESA",
    ))
    for page in list(document[:12]):
        text = page.get_text("text", sort=True)
        normalized = plain_text(text)
        marker = re.search(rf"(?im)^\s*{re.escape(wanted_label)}\b.*$", text)
        if not marker or wanted_subject not in normalized:
            continue
        following_subject = re.search(rf"(?im)^\s*(?:{subject_names})\s*$", text[marker.end():])
        end = marker.end() + following_subject.start() if following_subject else len(text)
        block = text[marker.end():end]
        headings = list(re.finditer(r"GABAR(?:ITO|AITO)(?:\s+(?:DEFINITIVO|PRELIMINAR))?\s+([1-4])", block, re.IGNORECASE))
        for index, heading in enumerate(headings):
            if heading.group(1) != wanted_booklet:
                continue
            stop = headings[index + 1].start() if index + 1 < len(headings) else len(block)
            tokens = re.findall(r"\b(?:\d{1,2}|[A-D]|NULA)\b", block[heading.end():stop], re.IGNORECASE)
            # A tabela pode ter uma linha unica de 20 itens ou duas linhas
            # 1--20 / 21--40 nos cadernos combinados. Cada sequencia de
            # numeros e seguida imediatamente por sua sequencia de respostas.
            count = last_number
            cursor = 0
            expected = 1
            all_answers: dict[int, str] = {}
            while cursor < len(tokens) and expected <= count:
                numbers: list[int] = []
                while cursor < len(tokens) and tokens[cursor].isdigit() and int(tokens[cursor]) == expected + len(numbers):
                    numbers.append(int(tokens[cursor]))
                    cursor += 1
                if not numbers:
                    break
                values = tokens[cursor:cursor + len(numbers)]
                if len(values) != len(numbers) or not all(value.upper() in {"A", "B", "C", "D", "NULA"} for value in values):
                    break
                all_answers.update({
                    number: "X" if value.upper() == "NULA" else value.upper()
                    for number, value in zip(numbers, values, strict=True)
                })
                cursor += len(numbers)
                expected += len(numbers)
            if set(all_answers) != set(range(1, count + 1)):
                continue
            return {number: all_answers[number] for number in range(first_number, last_number + 1)}

    # Desde 2023.1, alguns gabaritos sao tabelas: cada linha repete a
    # disciplina, o numero e as quatro colunas Gab 1--4. A leitura por linha
    # preserva a associacao impressa, sem depender dos antigos blocos
    # "GABARITO 1".
    table_labels = {
        "biology": "biologia", "mathematics": "matematica", "physics": "fisica",
        "chemistry": "quimica", "geography": "geografia", "history": "historia",
        "philosophy": "filosofia", "sociology": "sociologia", "portuguese": "lingua portuguesa",
        "spanish": "lingua espanhola", "french": "lingua francesa", "english": "lingua inglesa",
    }
    table_label = table_labels.get(subject, plain_text(subject))
    row_pattern = re.compile(
        rf"{re.escape(table_label)}\s+(\d{{1,2}})\s+(A|B|C|D|NULA)\s+(A|B|C|D|NULA)\s+(A|B|C|D|NULA)\s+(A|B|C|D|NULA)",
        re.IGNORECASE,
    )
    table_answers: dict[int, str] = {}
    for page in list(document[:12]):
        normalized = plain_text(page.get_text("text", sort=True))
        for row in row_pattern.finditer(normalized):
            number = int(row.group(1))
            value = row.group(2 + int(wanted_booklet) - 1).upper()
            table_answers[number] = "X" if value == "NULA" else value
    if set(table_answers) >= set(range(first_number, last_number + 1)):
        return {number: table_answers[number] for number in range(first_number, last_number + 1)}
    raise ValueError(f"Gabarito especifico nao encontrado: {subject} {booklet}")


def render_regions(
    document: pymupdf.Document,
    regions: list[dict],
    destination: Path,
    asset_prefix: str,
    document_id: str,
    question_id: str,
    occurrence_id: str,
) -> list[dict]:
    destination.mkdir(parents=True, exist_ok=True)
    records = []
    for index, region in enumerate(regions, start=1):
        page = document[region["page"] - 1]
        rectangle = pymupdf.Rect(region["bounds"])
        pixmap = page.get_pixmap(matrix=pymupdf.Matrix(2, 2), clip=rectangle, alpha=False)
        file_name = f"part-{index:02}.png"
        output_path = destination / file_name
        pixmap.save(output_path)
        records.append({
            "id": f"{asset_prefix}-part-{index:02}",
            "questionId": question_id,
            "occurrenceId": occurrence_id,
            "type": "QUESTION_CROP",
            "path": output_path.as_posix(),
            "sha256": sha256(output_path),
            "documentId": document_id,
            "sourcePage": region["page"],
            "sourceBounds": region["bounds"],
            "width": pixmap.width,
            "height": pixmap.height,
            "sharedByQuestionIds": [],
        })
    return records


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True, type=Path)
    parser.add_argument("--answer-key", required=True, type=Path)
    parser.add_argument("--source-root", default=Path("UECE/VESTIBULAR UECE_/1 PROVAS E GABARITOS"), type=Path)
    parser.add_argument("--data-root", default=Path("question-bank/data"), type=Path)
    parser.add_argument("--exam", required=True, help="Ex.: 2023.2")
    parser.add_argument("--phase", required=True, type=int, choices=(1, 2))
    parser.add_argument("--subject", required=True)
    parser.add_argument("--area", required=True)
    parser.add_argument("--first", required=True, type=int)
    parser.add_argument("--last", required=True, type=int)
    parser.add_argument("--answer-first", type=int, help="Primeiro numero correspondente no gabarito; padrao: --first.")
    parser.add_argument("--number-offset", default=0, type=int, help="Deslocamento para numerar a questao no banco.")
    parser.add_argument("--booklet", default="G1", choices=("G1", "G2", "G3", "G4"))
    parser.add_argument("--points", required=True, type=float)
    parser.add_argument("--language", choices=("ESPANHOLA", "FRANCESA", "INGLESA"))
    parser.add_argument("--answer-status", default="OFFICIAL", choices=("PRELIMINARY", "OFFICIAL"))
    return parser.parse_args()


def main() -> None:
    args = arguments()
    year, semester = map(int, args.exam.split("."))
    subject = slug(args.subject)
    exam_id = f"uece-{year}-{semester}"
    paper_id = f"{exam_id}-f{args.phase}-{subject}"
    owned_prefix = f"{paper_id}-"
    manifest = args.data_root / "manifests" / "documents.jsonl"
    pdf_document_id = document_id_for(manifest, args.pdf, args.source_root)
    answer_document_id = document_id_for(manifest, args.answer_key, args.source_root)

    document = pymupdf.open(args.pdf)
    answer_document = pymupdf.open(args.answer_key)
    answers = (
        parse_specific_answer_key(
            answer_document, subject, args.booklet,
            args.answer_first if args.answer_first is not None else args.first,
            args.answer_first + (args.last - args.first) if args.answer_first is not None else args.last,
        )
        if args.phase == 2
        else parse_answer_key(answer_document, args.language, args.booklet)
    )
    selected = {
        segment.number: segment
        for segment in segment_questions(extract_lines(document))
        if args.first <= segment.number <= args.last and (args.phase == 2 or segment.section == subject)
    }
    expected = set(range(args.first, args.last + 1))
    if set(selected) != expected:
        missing = sorted(expected - set(selected))
        raise ValueError(f"Questoes ausentes na segmentacao: {missing}")

    page_widths = {index + 1: page.rect.width for index, page in enumerate(document)}
    questions = []
    occurrences = []
    answer_events = []
    assets = []
    asset_root = args.data_root / "assets" / str(year) / paper_id
    if asset_root.exists():
        shutil.rmtree(asset_root)

    for number in sorted(selected):
        segment = selected[number]
        statement, alternatives = parse_content(segment)
        answer_number = (args.answer_first if args.answer_first is not None else args.first) + (number - args.first)
        output_number = number + args.number_offset
        answer = answers[answer_number]
        question_id = f"{paper_id}-q{output_number:02}"
        occurrence_id = f"{question_id}-{args.booklet.lower()}"
        correct_id = None if answer == "X" else f"alt-{answer.lower()}"
        status = "ANNULLED" if answer == "X" else args.answer_status
        pages = sorted({line.page for line in segment.lines})
        regions = regions_for(segment, page_widths)
        extracted_text = " ".join([statement, *(item["text"] for item in alternatives)])
        extraction_warnings = []
        if len(regions) > 1:
            extraction_warnings.append("SPANS_MULTIPLE_REGIONS")
        if "�" in extracted_text:
            extraction_warnings.append("TEXT_HAS_REPLACEMENT_CHARACTER")
        if any(not alternative["text"] for alternative in alternatives):
            extraction_warnings.append("ALTERNATIVES_REQUIRE_VISUAL")
        questions.append({
            "id": question_id,
            "paperId": paper_id,
            "subject": subject,
            "statement": statement,
            "alternatives": alternatives,
            "correctAlternativeId": correct_id,
            "answerStatus": status,
            "reviewStatus": "PENDING_REVIEW",
            "source": {"documentId": pdf_document_id, "pages": pages},
            "extraction": {
                "method": "NATIVE_TEXT",
                "confidence": 0.5 if "ALTERNATIVES_REQUIRE_VISUAL" in extraction_warnings else (
                    0.7 if "TEXT_HAS_REPLACEMENT_CHARACTER" in extraction_warnings else 1.0
                ),
                "warnings": extraction_warnings,
            },
        })
        occurrences.append({
            "id": occurrence_id,
            "questionId": question_id,
            "documentId": pdf_document_id,
            "booklet": args.booklet,
            "number": output_number,
            "optionOrder": {label: f"alt-{label.lower()}" for label in LABELS},
            "correctLabel": None if answer == "X" else answer,
            "sourceRegions": regions,
        })
        answer_events.append({
            "id": f"{question_id}-answer-{args.answer_status.lower()}",
            "questionId": question_id,
            "status": status,
            "correctAlternativeId": correct_id,
            "documentId": answer_document_id,
            "publishedOrder": 1,
            "awardsPointsToAll": answer == "X",
        })
        assets.extend(render_regions(
            document,
            regions,
            asset_root / f"q{number:02}",
            f"asset-{question_id}",
            pdf_document_id,
            question_id,
            occurrence_id,
        ))

    exams = [{
        "id": exam_id,
        "institution": "UECE",
        "year": year,
        "semester": semester,
        "formatId": None,
    }]
    papers = [{
        "id": paper_id,
        "examId": exam_id,
        "phase": args.phase,
        "component": "GENERAL_KNOWLEDGE" if args.phase == 1 else "SPECIFIC_KNOWLEDGE",
        "subject": subject,
        "area": slug(args.area),
        "questionCount": len(expected),
        "optionLabels": list(LABELS),
        "pointsPerQuestion": args.points,
        "courseGroups": [],
    }]

    upsert_many(args.data_root / "exams.jsonl", exams, exam_id)
    upsert_many(args.data_root / "papers.jsonl", papers, paper_id)
    upsert_many(args.data_root / "questions.jsonl", questions, owned_prefix)
    upsert_many(args.data_root / "occurrences.jsonl", occurrences, owned_prefix)
    upsert_many(args.data_root / "answer-keys.jsonl", answer_events, owned_prefix)
    upsert_many(args.data_root / "assets.jsonl", assets, f"asset-{owned_prefix}")
    print(f"Extraidas {len(questions)} questoes de {args.subject} ({args.first}-{args.last}).")
    print(f"Gerados {len(assets)} recortes em {asset_root}.")


if __name__ == "__main__":
    main()

