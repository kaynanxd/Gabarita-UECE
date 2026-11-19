# /// script
# requires-python = ">=3.11"
# dependencies = ["pymupdf==1.28.2"]
# ///

"""Extrai os textos-base compartilhados das provas de Linguas (136 provas)
em fluxo linear continuo (atravessando colunas e paginas), preservando a
numeracao exata de linhas e vinculando 1 -> N questoes em
public/question-assets/texts/.
"""

from __future__ import annotations

import json
import re
import shutil
import unicodedata
from pathlib import Path

import pymupdf

DATA_ROOT = Path("question-bank/data")
PDF_ROOT = Path("UECE/VESTIBULAR UECE_/1 PROVAS E GABARITOS")
OUTPUT_ROOT = Path("public/question-assets/texts")

SUBJECT_HEADERS = {
    "portuguese": {"lingua portuguesa", "prova ii - lingua portuguesa", "prova ii: lingua portuguesa", "prova ii lingua portuguesa", "prova ii - lingua poruguesa", "lingua poruguesa"},
    "english": {"lingua inglesa", "prova ii - lingua inglesa", "prova ii: lingua inglesa"},
    "spanish": {"lingua espanhola", "prova ii - lingua espanhola", "prova ii: lingua espanhola"},
    "french": {"lingua francesa", "prova ii - lingua francesa", "prova ii: lingua francesa"},
}

ALL_SECTION_HEADERS = {
    "lingua portuguesa", "prova ii - lingua portuguesa", "prova ii: lingua portuguesa", "prova ii - lingua poruguesa", "lingua poruguesa",
    "matematica", "historia", "geografia", "fisica",
    "quimica", "biologia", "filosofia", "sociologia", "educacao fisica",
    "lingua espanhola", "prova ii - lingua espanhola", "prova ii: lingua espanhola",
    "lingua francesa", "prova ii - lingua francesa", "prova ii: lingua francesa",
    "lingua inglesa", "prova ii - lingua inglesa", "prova ii: lingua inglesa",
    "redacao", "prova de redacao", "prova i: redacao", "prova i - redacao",
}

TEXT_LABEL_RE = re.compile(r"^(?:TEXTO|TEXT|TEXTE)\s*(I{1,3}|IV|\d+)?\s*$", re.IGNORECASE)
QUESTION_START_RE = re.compile(r"^(\d{2})\.\s+(.*)")
OPTION_RE = re.compile(r"^([A-D])\)\s*(.*)")
LINE_NUM_TOKEN_RE = re.compile(r"^\d{1,3}$")
INLINE_LINE_NUM_RE = re.compile(r"^(\d{1,3})\s+(\S.*)$")
LINE_REF_RE = re.compile(r"\b(?:linha|linhas|l[íi]nea|l[íi]neas|ligne|lignes|line|lines)\s+(\d+)(?:\s*[-–a]\s*(\d+))?", re.IGNORECASE)
TEXT_REF_RE = re.compile(r"\b(?:texto|text|texte)\s+(\d+|I{1,3}|IV)\b", re.IGNORECASE)


def plain_text(value: str) -> str:
    replaced = value.replace("–", "-").replace("—", "-").replace("−", "-")
    normalized = unicodedata.normalize("NFKD", replaced)
    ascii_txt = normalized.encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"\s+", " ", ascii_txt).strip()


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(l) for l in path.read_text(encoding="utf-8").splitlines() if l.strip()]


def extract_linear_lines(doc: pymupdf.Document, pages: list[int], subject: str) -> list[dict]:
    """Extrai linhas ordenadas por (page, col, y0), pareando numeros de linha
    da coluna estreita a esquerda com a linha de texto correspondente."""
    wanted_headers = SUBJECT_HEADERS[subject]
    raw_lines: list[dict] = []

    for p in pages:
        if p < 2 or p > len(doc):
            continue
        page = doc[p - 1]
        mid = page.rect.width / 2
        for b in page.get_text("dict")["blocks"]:
            if b["type"] != 0:
                continue
            for line in b["lines"]:
                spans = line.get("spans", [])
                groups = {0: [], 1: []}
                for sp in spans:
                    sx0, _, sx1, _ = sp["bbox"]
                    col = 0 if (sx0 + sx1) / 2 < mid else 1
                    groups[col].append(sp)
                for col, grp in groups.items():
                    if not grp:
                        continue
                    grp.sort(key=lambda s: s["bbox"][0])
                    txt = "".join(s["text"] for s in grp).strip()
                    if not txt:
                        continue
                    x0 = min(s["bbox"][0] for s in grp)
                    y0 = min(s["bbox"][1] for s in grp)
                    x1 = max(s["bbox"][2] for s in grp)
                    y1 = max(s["bbox"][3] for s in grp)
                    if y0 < 52 or y1 > page.rect.height - 32:
                        continue
                    if "O número do gabarito" in txt or txt.startswith("Página ") or "UNIVERSIDADE ESTADUAL DO CEARÁ" in txt:
                        continue
                    raw_lines.append({
                        "page": p, "col": col, "x0": x0, "y0": y0, "x1": x1, "y1": y1,
                        "text": txt,
                        "col_left": 28.0 if col == 0 else mid,
                    })

    # Sort all lines in natural reading flow
    raw_lines.sort(key=lambda l: (l["page"], l["col"], l["y0"], l["x0"]))

    # Find subject start header (if present in pages) and next subject header
    start_idx = 0
    end_idx = len(raw_lines)
    for idx, l in enumerate(raw_lines):
        pt = plain_text(l["text"])
        if pt in wanted_headers:
            start_idx = idx + 1
            break

    for idx in range(start_idx, len(raw_lines)):
        pt = plain_text(raw_lines[idx]["text"])
        if pt in ALL_SECTION_HEADERS and pt not in wanted_headers:
            end_idx = idx
            break

    scoped = raw_lines[start_idx:end_idx]

    # Merge horizontally aligned spans & pair left-margin line numbers
    merged: list[dict] = []
    last_num: int | None = None
    i = 0
    while i < len(scoped):
        curr = scoped[i]
        j = i + 1
        grp = [curr]
        while j < len(scoped) and scoped[j]["page"] == curr["page"] and scoped[j]["col"] == curr["col"] and abs(scoped[j]["y0"] - curr["y0"]) <= 5.5:
            grp.append(scoped[j])
            j += 1

        if len(grp) == 1:
            # Check if this single item is just a standalone line number
            is_num_only = bool(LINE_NUM_TOKEN_RE.match(curr["text"])) and (curr["x0"] - curr["col_left"] < 30) and (curr["x1"] - curr["x0"] < 25)
            inline_m = INLINE_LINE_NUM_RE.match(curr["text"]) if not is_num_only else None
            inline_num = int(inline_m.group(1)) if inline_m else None
            if inline_num is not None and ((inline_num == 1 and curr["x0"] - curr["col_left"] < 40) or (last_num is not None and 1 <= inline_num - last_num <= 3)):
                line_num = inline_num
                text_val = inline_m.group(2).strip()
            else:
                line_num = int(curr["text"]) if is_num_only else None
                text_val = "" if is_num_only else curr["text"]
            if line_num is not None:
                last_num = line_num
            merged.append({
                "page": curr["page"], "col": curr["col"],
                "x0": curr["x0"], "y0": curr["y0"], "x1": curr["x1"], "y1": curr["y1"],
                "line_num": line_num,
                "text": text_val,
                "col_left": curr["col_left"],
            })
        else:
            grp.sort(key=lambda x: x["x0"])
            first = grp[0]
            first_is_num = (
                bool(LINE_NUM_TOKEN_RE.match(first["text"]))
                and (first["x0"] - first["col_left"] < 30)
                and (first["x1"] - first["x0"] < 25)
            )
            if first_is_num:
                rest_text = " ".join(x["text"] for x in grp[1:]).strip()
                last_num = int(first["text"])
                merged.append({
                    "page": curr["page"], "col": curr["col"],
                    "x0": grp[1]["x0"], "y0": min(x["y0"] for x in grp),
                    "x1": max(x["x1"] for x in grp), "y1": max(x["y1"] for x in grp),
                    "line_num": last_num,
                    "text": rest_text,
                    "col_left": curr["col_left"],
                })
            else:
                joined_text = " ".join(x["text"] for x in grp)
                inline_m = INLINE_LINE_NUM_RE.match(joined_text)
                inline_num = int(inline_m.group(1)) if inline_m else None
                if inline_num is not None and ((inline_num == 1 and first["x0"] - first["col_left"] < 40) or (last_num is not None and 1 <= inline_num - last_num <= 3)):
                    last_num = inline_num
                    merged.append({
                        "page": curr["page"], "col": curr["col"],
                        "x0": min(x["x0"] for x in grp), "y0": min(x["y0"] for x in grp),
                        "x1": max(x["x1"] for x in grp), "y1": max(x["y1"] for x in grp),
                        "line_num": inline_num,
                        "text": inline_m.group(2).strip(),
                        "col_left": curr["col_left"],
                    })
                else:
                    merged.append({
                        "page": curr["page"], "col": curr["col"],
                        "x0": min(x["x0"] for x in grp), "y0": min(x["y0"] for x in grp),
                        "x1": max(x["x1"] for x in grp), "y1": max(x["y1"] for x in grp),
                        "line_num": None,
                        "text": joined_text,
                        "col_left": curr["col_left"],
                    })
        i = j

    # Remove empty orphan line-number rows if any, or try pairing with adjacent y0
    cleaned: list[dict] = []
    for k, m in enumerate(merged):
        if m["line_num"] is not None and m["text"] == "":
            # Try to attach to next or prev if within 8pt
            if k + 1 < len(merged) and merged[k + 1]["page"] == m["page"] and merged[k + 1]["col"] == m["col"] and abs(merged[k + 1]["y0"] - m["y0"]) <= 8.0 and merged[k + 1]["line_num"] is None:
                merged[k + 1]["line_num"] = m["line_num"]
                continue
            continue
        cleaned.append(m)

    return cleaned


def extract_texts_for_paper(paper_id: str, subject: str, qs: list[dict], occurrences: dict, docs: dict, pdf_cache: dict) -> dict:
    qs_sorted = sorted(qs, key=lambda x: occurrences[x["id"]]["number"])
    doc_id = qs_sorted[0]["source"]["documentId"]
    if doc_id not in pdf_cache:
        pdf_cache[doc_id] = pymupdf.open(PDF_ROOT / docs[doc_id]["relativePath"])
    doc = pdf_cache[doc_id]

    q_pages = sorted({r["page"] for q in qs_sorted for r in occurrences[q["id"]]["sourceRegions"]})
    # Include up to 2 previous pages if current first page doesn't contain the exact subject header line
    first_q_lines = {plain_text(line) for line in doc[q_pages[0] - 1].get_text().splitlines()}
    if not any(h in first_q_lines for h in SUBJECT_HEADERS[subject]):
        for back in (1, 2):
            p = q_pages[0] - back
            if p >= 2:
                prev_lines = {plain_text(line) for line in doc[p - 1].get_text().splitlines()}
                if any(h in prev_lines for h in SUBJECT_HEADERS[subject]):
                    for insert_p in range(q_pages[0] - 1, p - 1, -1):
                        q_pages.insert(0, insert_p)
                    break
    # Include all consecutive pages between min and max
    pages = list(range(q_pages[0], q_pages[-1] + 1))

    lines = extract_linear_lines(doc, pages, subject)

    # State machine: OUT_OF_QUESTION vs IN_QUESTION
    state = "OUT_OF_QUESTION"
    seen_option_d = False
    context_blocks: list[dict] = []  # {"lines": [...], "before_q_num": int | None}
    current_ctx_lines: list[dict] = []

    q_num_to_id = {occurrences[q["id"]]["number"]: q["id"] for q in qs_sorted}
    expected_q_nums = set(q_num_to_id.keys())
    last_q_num = max(expected_q_nums)
    seen_q_nums = set()

    for idx, l in enumerate(lines):
        txt = l["text"].strip()
        if not txt or txt == "R A S C U N H O":
            continue

        # Check if new question starts
        m_q = QUESTION_START_RE.match(txt)
        is_q_start = False
        if m_q:
            num = int(m_q.group(1))
            if num in expected_q_nums and num not in seen_q_nums:
                is_q_start = True
                seen_q_nums.add(num)

        if is_q_start:
            if current_ctx_lines:
                context_blocks.append({"lines": current_ctx_lines, "before_q_num": int(m_q.group(1))})
                current_ctx_lines = []
            state = "IN_QUESTION"
            seen_option_d = False
            continue

        if state == "IN_QUESTION":
            if OPTION_RE.match(txt) and txt.startswith("D)"):
                seen_option_d = True
                continue
            if seen_option_d:
                # Detect exit from option D):
                # 1. Explicit text header ("Texto 2", "TEXT", "TEXTE")
                # 2. Has line number on the left margin
                # 3. Centered title/header after a gap or ends of sentence
                prev_l = lines[idx - 1]
                y_gap = (l["y0"] - prev_l["y1"]) if (l["page"] == prev_l["page"] and l["col"] == prev_l["col"]) else 999
                if l["line_num"] is not None or TEXT_LABEL_RE.match(txt) or (y_gap > 20 and prev_l["text"].strip().endswith((".", "!", "?", "”", "\""))):
                    state = "OUT_OF_QUESTION"
                    seen_option_d = False
                    # Do not collect trailing texts after the very last question of the paper
                    if len(seen_q_nums) < len(expected_q_nums):
                        current_ctx_lines.append(l)
            continue

        # state == "OUT_OF_QUESTION"
        if len(seen_q_nums) < len(expected_q_nums):
            current_ctx_lines.append(l)

    # Now split current context_blocks if a block contains explicit "Texto 2" / "Texto 3" headers inside it
    split_blocks: list[dict] = []
    for blk in context_blocks:
        sub_lines: list[dict] = []
        for l in blk["lines"]:
            if TEXT_LABEL_RE.match(l["text"].strip()) and len(sub_lines) >= 5:
                split_blocks.append({"lines": sub_lines, "before_q_num": blk["before_q_num"]})
                sub_lines = [l]
            else:
                sub_lines.append(l)
        if sub_lines:
            split_blocks.append({"lines": sub_lines, "before_q_num": blk["before_q_num"]})

    # Discard tiny noise blocks (< 4 lines) and pure instruction blocks before Texto 1
    def is_instruction_only(blk: dict) -> bool:
        if any(l["line_num"] is not None for l in blk["lines"]):
            return False
        joined = " ".join(l["text"].strip().lower() for l in blk["lines"])
        return ("caro candidato" in joined or "prezado" in joined) and len(blk["lines"]) <= 12

    filtered_blocks: list[dict] = []
    for idx, blk in enumerate(split_blocks):
        if len(blk["lines"]) < 4:
            continue
        if is_instruction_only(blk) and any(
            other is not blk and other["before_q_num"] == blk["before_q_num"] and len(other["lines"]) >= 4
            for other in split_blocks
        ):
            continue
        filtered_blocks.append(blk)
    split_blocks = filtered_blocks

    # Convert blocks to clean text objects
    texts: list[dict] = []
    for t_idx, blk in enumerate(split_blocks, start=1):
        blines = blk["lines"]

        explicit_label = None
        title = None
        body_lines = []

        for k, l in enumerate(blines):
            t = l["text"].strip()
            if l["line_num"] is None and k <= 5 and TEXT_LABEL_RE.match(t):
                explicit_label = t
                continue
            if l["line_num"] is None and k <= 6 and title is None and len(t) < 80 and not t.endswith(".") and (l["x0"] - l["col_left"] > 35):
                title = t
                continue
            body_lines.append({"number": l["line_num"], "text": t})

        while body_lines and body_lines[-1]["number"] is None and re.match(r"^\d{1,2}$", body_lines[-1]["text"]):
            body_lines.pop()

        # Determine which questions belong to this text (from before_q_num up to next strictly greater before_q_num)
        start_q = blk["before_q_num"]
        next_q = next((b["before_q_num"] for b in split_blocks[t_idx:] if b["before_q_num"] > start_q), 9999)
        linked_qids = [
            q_num_to_id[num]
            for num in sorted(q_num_to_id)
            if start_q <= num < next_q
        ]

        if not linked_qids:
            continue

        seq_num = len(texts) + 1
        label = explicit_label or f"Texto {seq_num}"

        texts.append({
            "id": f"{paper_id}-t{seq_num}",
            "label": label,
            "title": title,
            "lines": body_lines,
            "questionIds": linked_qids,
        })

    # Re-link questions that explicitly cite a single "Texto X" different from their positional block
    roman_map = {"I": "1", "II": "2", "III": "3", "IV": "4"}
    label_num_re = re.compile(r"(\d+|I{1,3}|IV)\b", re.IGNORECASE)
    text_by_norm_num: dict[str, dict] = {}
    def norm_label_num(raw_val: str) -> str:
        up = raw_val.upper()
        return roman_map[up] if up in roman_map else str(int(up))

    for t in texts:
        m = label_num_re.search(t["label"])
        if m:
            text_by_norm_num.setdefault(norm_label_num(m.group(1)), t)

    if len(text_by_norm_num) >= 2:
        for q in qs_sorted:
            refs = {norm_label_num(m) for m in TEXT_REF_RE.findall(q["statement"])}
            if len(refs) == 1:
                wanted = next(iter(refs))
                target_t = text_by_norm_num.get(wanted)
                if target_t and q["id"] not in target_t["questionIds"]:
                    for t in texts:
                        if q["id"] in t["questionIds"]:
                            t["questionIds"].remove(q["id"])
                    target_t["questionIds"].append(q["id"])
                    target_t["questionIds"].sort(key=lambda qid: occurrences[qid]["number"])

    return {"paperId": paper_id, "subject": subject, "texts": texts}


def main():
    questions = read_jsonl(DATA_ROOT / "questions.jsonl")
    occurrences = {o["questionId"]: o for o in read_jsonl(DATA_ROOT / "occurrences.jsonl")}
    docs = {d["id"]: d for d in read_jsonl(DATA_ROOT / "manifests/documents.jsonl")}
    papers = {p["id"]: p for p in read_jsonl(DATA_ROOT / "papers.jsonl")}
    exams = {e["id"]: e for e in read_jsonl(DATA_ROOT / "exams.jsonl")}

    by_paper: dict[str, list[dict]] = {}
    for q in questions:
        if q["subject"] in ("portuguese", "english", "spanish", "french"):
            by_paper.setdefault(q["paperId"], []).append(q)

    if OUTPUT_ROOT.exists():
        shutil.rmtree(OUTPUT_ROOT)
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

    pdf_cache: dict[str, pymupdf.Document] = {}
    index_map: dict[str, list[str]] = {}
    papers_without_texts = []
    line_ref_mismatches = []
    total_texts = 0
    total_numbered_texts = 0

    q_by_id = {q["id"]: q for q in questions}

    for pid, qs in sorted(by_paper.items()):
        year = exams[papers[pid]["examId"]]["year"]
        subj = qs[0]["subject"]
        result = extract_texts_for_paper(pid, subj, qs, occurrences, docs, pdf_cache)

        if not result["texts"]:
            papers_without_texts.append(pid)
            continue

        out_dir = OUTPUT_ROOT / str(year)
        out_dir.mkdir(parents=True, exist_ok=True)
        out_file = out_dir / f"{pid}.json"
        out_file.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

        for t in result["texts"]:
            total_texts += 1
            nums = [ln["number"] for ln in t["lines"] if ln["number"] is not None]
            if nums:
                total_numbered_texts += 1
            max_line = max(nums) if nums else 0

            for qid in t["questionIds"]:
                index_map.setdefault(qid, []).append(f"/question-assets/texts/{year}/{pid}.json#{t['id']}")
                # Cross-check line references in statement
                stmt = q_by_id[qid]["statement"]
                for m in LINE_REF_RE.finditer(stmt):
                    ref_line = int(m.group(2) or m.group(1))
                    if nums and ref_line > max_line:
                        line_ref_mismatches.append((qid, ref_line, max_line, t["id"]))

    (OUTPUT_ROOT / "index.json").write_text(json.dumps(index_map, ensure_ascii=False, indent=2), encoding="utf-8")

    print("=== RELATORIO DE EXTRACAO DE TEXTOS COMPARTILHADOS ===")
    print(f"Provas de Linguas processadas: {len(by_paper)}")
    print(f"Provas com textos extraidos: {len(by_paper) - len(papers_without_texts)}")
    print(f"Provas sem texto extraido: {len(papers_without_texts)}")
    if papers_without_texts:
        print("  Lista sem texto:", papers_without_texts)
    print(f"Total de textos-base extraidos: {total_texts} ({total_numbered_texts} com numeracao de linhas)")
    print(f"Total de questoes vinculadas no index.json: {len(index_map)}")
    print(f"Divergencias de 'linha X' citada vs max_line extraida: {len(line_ref_mismatches)}")
    for m in line_ref_mismatches[:20]:
        print("  [DIVERGENCIA]", m)


if __name__ == "__main__":
    main()
