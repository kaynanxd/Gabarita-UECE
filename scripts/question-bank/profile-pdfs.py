"""Cria um perfil tecnico dos PDFs para rotear extracao nativa, OCR ou revisao."""

from __future__ import annotations

import json
import re
from pathlib import Path

import pymupdf


SOURCE_ROOT = Path("UECE/VESTIBULAR UECE_/1 PROVAS E GABARITOS")
DATA_ROOT = Path("question-bank/data")
MANIFEST = DATA_ROOT / "manifests/documents.jsonl"
OUTPUT = DATA_ROOT / "manifests/pdf-profiles.jsonl"
QUESTION_RE = re.compile(r"(?m)^\s*\d{1,3}[.)]\s+")
ANSWER_RE = re.compile(r"(?i)gabarito|respostas?\s+oficiais?")


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def main() -> None:
    documents = [document for document in read_jsonl(MANIFEST) if document.get("inScope", False)]
    profiles = []
    for index, item in enumerate(documents, start=1):
        pdf_path = SOURCE_ROOT / item["relativePath"]
        profile = {
            "documentId": item["id"],
            "contentId": item["contentId"],
            "relativePath": item["relativePath"],
            "status": "OK",
        }
        try:
            document = pymupdf.open(pdf_path)
            page_texts = [page.get_text("text", sort=True) for page in document]
            text_lengths = [len(text.strip()) for text in page_texts]
            joined = "\n".join(page_texts)
            text_pages = sum(length >= 50 for length in text_lengths)
            profile.update({
                "pageCount": len(document),
                "textPageCount": text_pages,
                "textCoverage": round(text_pages / len(document), 4) if document else 0,
                "characterCount": sum(text_lengths),
                "replacementCharacterCount": joined.count("�"),
                "questionMarkerCount": len(QUESTION_RE.findall(joined)),
                "mentionsAnswerKey": bool(ANSWER_RE.search(joined)),
                "imageCount": sum(len(page.get_images(full=True)) for page in document),
                "route": "NATIVE_TEXT" if text_pages >= max(1, len(document) * 0.7) else "OCR",
            })
        except Exception as error:  # arquivo corrompido ou recurso PDF nao suportado
            profile.update({"status": "ERROR", "error": str(error), "route": "MANUAL_REVIEW"})
        profiles.append(profile)
        if index % 100 == 0:
            print(f"Analisados {index}/{len(documents)} PDFs")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    temporary = OUTPUT.with_suffix(".jsonl.tmp")
    temporary.write_text(
        "".join(json.dumps(profile, ensure_ascii=False) + "\n" for profile in profiles),
        encoding="utf-8",
    )
    temporary.replace(OUTPUT)

    routes: dict[str, int] = {}
    for profile in profiles:
        routes[profile["route"]] = routes.get(profile["route"], 0) + 1
    print(f"Perfis gerados: {len(profiles)}")
    for route, count in sorted(routes.items()):
        print(f"{route}: {count}")


if __name__ == "__main__":
    main()

