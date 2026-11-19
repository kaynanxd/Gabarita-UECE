# /// script
# requires-python = ">=3.11"
# dependencies = ["pymupdf==1.28.2"]
# ///

"""Extrai imagens de apoio (figuras de enunciado, textos-base compartilhados e
recortes de alternativas visuais) para public/question-assets/ e registra
os novos assets em question-bank/data/assets.jsonl + manifest.json.
"""

from __future__ import annotations

import hashlib
import json
import re
import shutil
from pathlib import Path

import pymupdf

DATA_ROOT = Path("question-bank/data")
PDF_ROOT = Path("UECE/VESTIBULAR UECE_/1 PROVAS E GABARITOS")
PUBLIC_ASSETS_ROOT = Path("public/question-assets")

VISUAL_STMT_PATTERNS = [
    re.compile(r"\b(tirinha|tirinhas|charge|charges|cartum|cartuns|quadrinho|quadrinhos)\b", re.IGNORECASE),
    re.compile(r"\b(no|do|pelo|observe o|com base no|conforme o|analise o|segundo o)\s+mapa\b", re.IGNORECASE),
    re.compile(r"\bmapa\s+(abaixo|a seguir|ao lado|acima|\d+)\b", re.IGNORECASE),
    re.compile(r"\bo mapa\s+(mostra|representa|indica|apresenta|revela|ilustra)\b", re.IGNORECASE),
    re.compile(
        r"\b(na|da|pela|com base na|observe a|atente para a|considere a|segundo a|conforme a|de acordo com a|veja a|olhe a)\s+(figura|imagem|ilustra[çc][ãa]o|fotografia|foto|estampa)\b",
        re.IGNORECASE,
    ),
    re.compile(r"\b(figura|imagem|ilustra[çc][ãa]o|foto)\s+(\d+|[A-Z]|abaixo|a seguir|ao lado|acima)\b", re.IGNORECASE),
    re.compile(r"\b(a figura|a imagem|a ilustra[çc][ãa]o)\s+(apresenta|mostra|ilustra|representa|esquematiza|revela|retrata|exibe)\b", re.IGNORECASE),
    re.compile(r"\b(abaixo|a seguir|ao lado|acima)\s+(reproduzid|ilustrad|representad|mostrad|esquematizad)[ao]s?\b", re.IGNORECASE),
    re.compile(r"\b(reproduzid|ilustrad|representad|mostrad|esquematizad)[ao]s?\s+(abaixo|a seguir|ao lado|acima)\b", re.IGNORECASE),
    re.compile(r"\b(com base no|observe o|analise o|de acordo com o|segundo o|conforme o|pelo)\s+gr[áa]fico\b", re.IGNORECASE),
    re.compile(r"\bgr[áa]fico\s+(abaixo|a seguir|ao lado|acima|\d+)\b", re.IGNORECASE),
    re.compile(r"\bo gr[áa]fico\s+(a seguir|abaixo|mostra|representa|indica|apresenta|ilustra|relaciona)\b", re.IGNORECASE),
    re.compile(r"\b(com base na|observe a|analise a|de acordo com a|segundo a|conforme a|na|da|pela)\s+tabela\s+(abaixo|a seguir|ao lado|acima|\d+)\b", re.IGNORECASE),
    re.compile(r"\btabela\s+(abaixo|a seguir|ao lado|acima|\d+)\b", re.IGNORECASE),
    re.compile(r"\b(com base no|observe o|analise o|de acordo com o|segundo o|conforme o|no|do|pelo)\s+quadro\s+(abaixo|a seguir|ao lado|acima|\d+)\b", re.IGNORECASE),
    re.compile(r"\bquadro\s+(abaixo|a seguir|ao lado|acima|\d+)\b", re.IGNORECASE),
    re.compile(r"\bo quadro\s+(a seguir|abaixo|mostra|apresenta|cont[ée]m|compara)\b", re.IGNORECASE),
    re.compile(r"\ba tabela\s+(a seguir|abaixo|mostra|apresenta|cont[ée]m|reúne)\b", re.IGNORECASE),
    re.compile(r"\b(no|do|pelo|com base no|observe o|analise o|conforme o)\s+(esquema|diagrama)\b", re.IGNORECASE),
    re.compile(r"\b(esquema|diagrama)\s+(abaixo|a seguir|ao lado|acima|\d+)\b", re.IGNORECASE),
    re.compile(r"\bo esquema\s+(a seguir|abaixo|mostra|representa|ilustra)\b", re.IGNORECASE),
]

TEXT_HEADER_RE = re.compile(r"^(?:TEXTO|TEXT|TEXTE)\s*(I|II|III|IV|\d+)?\s*$", re.IGNORECASE)
LINE_NUM_COL_RE = re.compile(r"^(?:0?1\s+0?2\s+0?3|1\s+2\s+3)")
TEXT_REF_RE = re.compile(r"\b(?:texto|text|texte)\s+(\d+|I{1,3}|IV)\b", re.IGNORECASE)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def needs_statement_visual(statement: str) -> bool:
    if not statement:
        return False
    for pattern in VISUAL_STMT_PATTERNS:
        if pattern.search(statement):
            if re.search(r"\bfigura\s+(de linguagem|de estilo|humana|central|hist[óo]rica|paterna|materna)\b", statement, re.IGNORECASE):
                if not re.search(r"\b(abaixo|a seguir|ao lado|acima|\d+)\b", statement, re.IGNORECASE):
                    continue
            if re.search(r"\bo gr[áa]fico da fun[çc][ãa]o\b", statement, re.IGNORECASE):
                if not re.search(r"\b(abaixo|a seguir|ao lado|acima|\d+|mostra|representa|indica)\b", statement, re.IGNORECASE):
                    continue
            if re.search(r"\btabela peri[óo]dica\b", statement, re.IGNORECASE):
                if not re.search(r"\b(abaixo|a seguir|ao lado|acima|\d+)\b", statement, re.IGNORECASE):
                    continue
            return True
    return False


def rects_overlap(r1: tuple[float, float, float, float], r2: tuple[float, float, float, float], pad: float = 4.0) -> bool:
    return not (r1[2] + pad < r2[0] or r1[0] - pad > r2[2] or r1[3] + pad < r2[1] or r1[1] - pad > r2[3])


def detect_visual_bbox_in_region(page: pymupdf.Page, region_bounds: list[float]) -> pymupdf.Rect | None:
    rx0, ry0, rx1, ry1 = region_bounds
    reg_rect = (rx0, ry0, rx1, ry1)
    candidates: list[tuple[float, float, float, float]] = []

    # 1. Raster images inside or overlapping region
    d = page.get_text("dict")
    for b in d["blocks"]:
        if b["type"] == 1:
            bx0, by0, bx1, by1 = b["bbox"]
            if rects_overlap(reg_rect, (bx0, by0, bx1, by1), pad=8.0):
                if (bx1 - bx0) >= 20 and (by1 - by0) >= 20:
                    candidates.append((bx0, by0, bx1, by1))

    # 2. Vector drawings clusters inside region
    drawing_rects = []
    for dr in page.get_drawings():
        r = dr["rect"]
        # Ignore page borders or tiny underlines
        if r.width > page.rect.width * 0.85 or (r.height < 2 and r.width < 20):
            continue
        if rects_overlap(reg_rect, (r.x0, r.y0, r.x1, r.y1), pad=4.0):
            drawing_rects.append((r.x0, r.y0, r.x1, r.y1))

    if drawing_rects:
        # Cluster nearby drawings in same column
        clusters: list[list[float]] = []
        for dx0, dy0, dx1, dy1 in sorted(drawing_rects, key=lambda x: x[1]):
            placed = False
            for c in clusters:
                if rects_overlap((c[0], c[1], c[2], c[3]), (dx0, dy0, dx1, dy1), pad=18.0):
                    c[0] = min(c[0], dx0)
                    c[1] = min(c[1], dy0)
                    c[2] = max(c[2], dx1)
                    c[3] = max(c[3], dy1)
                    placed = True
                    break
            if not placed:
                clusters.append([dx0, dy0, dx1, dy1])

        for cx0, cy0, cx1, cy1 in clusters:
            if (cx1 - cx0) >= 28 and (cy1 - cy0) >= 24:
                candidates.append((cx0, cy0, cx1, cy1))

    if not candidates:
        return None

    ux0 = max(20.0, min(c[0] for c in candidates) - 6.0)
    uy0 = max(55.0, min(c[1] for c in candidates) - 6.0)
    ux1 = min(page.rect.width - 20.0, max(c[2] for c in candidates) + 6.0)
    uy1 = min(page.rect.height - 55.0, max(c[3] for c in candidates) + 6.0)
    return pymupdf.Rect(ux0, uy0, ux1, uy1)


def extract_all():
    questions = read_jsonl(DATA_ROOT / "questions.jsonl")
    occurrences = {o["questionId"]: o for o in read_jsonl(DATA_ROOT / "occurrences.jsonl")}
    docs = {d["id"]: d for d in read_jsonl(DATA_ROOT / "manifests/documents.jsonl")}
    papers = {p["id"]: p for p in read_jsonl(DATA_ROOT / "papers.jsonl")}
    exams = {e["id"]: e for e in read_jsonl(DATA_ROOT / "exams.jsonl")}
    existing_assets = read_jsonl(DATA_ROOT / "assets.jsonl")

    # Keep original QUESTION_CROP assets
    base_assets = [a for a in existing_assets if a["type"] == "QUESTION_CROP"]
    crops_by_qid: dict[str, list[dict]] = {}
    for a in base_assets:
        if a.get("questionId"):
            crops_by_qid.setdefault(a["questionId"], []).append(a)

    # Prepare output directories
    for sub in ("crops", "figures", "shared"):
        target = PUBLIC_ASSETS_ROOT / sub
        if target.exists():
            shutil.rmtree(target)
        target.mkdir(parents=True, exist_ok=True)

    new_assets: list[dict] = []
    manifest: dict[str, dict] = {}

    def ensure_manifest(qid: str) -> dict:
        if qid not in manifest:
            manifest[qid] = {"shared": [], "figures": [], "crops": []}
        return manifest[qid]

    # Cache opened PDFs
    pdf_cache: dict[str, pymupdf.Document] = {}

    def get_pdf(doc_id: str) -> pymupdf.Document:
        if doc_id not in pdf_cache:
            rel = docs[doc_id]["relativePath"]
            pdf_cache[doc_id] = pymupdf.open(PDF_ROOT / rel)
        return pdf_cache[doc_id]

    # 1. Process visual alternatives (crops/)
    print("1. Extraindo recortes para questoes com alternativas visuais...")
    crop_count = 0
    for q in questions:
        qid = q["id"]
        has_empty_alt = any(not a["text"] or not a["text"].strip() for a in q["alternatives"])
        has_warning = "ALTERNATIVES_REQUIRE_VISUAL" in q.get("extraction", {}).get("warnings", [])
        if has_empty_alt or has_warning:
            year = exams[papers[q["paperId"]]["examId"]]["year"]
            out_dir = PUBLIC_ASSETS_ROOT / "crops" / str(year)
            out_dir.mkdir(parents=True, exist_ok=True)
            for idx, asset in enumerate(sorted(crops_by_qid.get(qid, []), key=lambda x: x["id"]), start=1):
                if (asset.get("height") or 0) < 60:
                    continue
                src_path = Path(asset["path"])
                if src_path.exists():
                    dest_name = f"{qid}-part-{idx:02}.png"
                    dest_path = out_dir / dest_name
                    shutil.copy2(src_path, dest_path)
                    ensure_manifest(qid)["crops"].append({
                        "url": f"/question-assets/crops/{year}/{dest_name}",
                        "width": asset.get("width"),
                        "height": asset.get("height"),
                    })
                    crop_count += 1
    print(f"   -> {crop_count} imagens copiadas para public/question-assets/crops/")

    # 2. Process statement figures (figures/)
    print("2. Extraindo figuras, graficos, mapas e tabelas de enunciados...")
    fig_count = 0
    for q in questions:
        qid = q["id"]
        if not needs_statement_visual(q["statement"]):
            continue
        occ = occurrences.get(qid)
        if not occ:
            continue
        year = exams[papers[q["paperId"]]["examId"]]["year"]
        doc_id = q["source"]["documentId"]
        doc = get_pdf(doc_id)
        out_dir = PUBLIC_ASSETS_ROOT / "figures" / str(year)
        out_dir.mkdir(parents=True, exist_ok=True)

        extracted_any = False
        fig_idx = 1
        for reg in occ["sourceRegions"]:
            page = doc[reg["page"] - 1]
            bbox = detect_visual_bbox_in_region(page, reg["bounds"])
            if bbox is not None:
                pix = page.get_pixmap(matrix=pymupdf.Matrix(2, 2), clip=bbox, alpha=False)
                file_name = f"{qid}-fig-{fig_idx:02}.png"
                out_path = out_dir / file_name
                pix.save(out_path)
                new_assets.append({
                    "id": f"asset-{qid}-fig-{fig_idx:02}",
                    "questionId": qid,
                    "occurrenceId": occ["id"],
                    "type": "FIGURE",
                    "path": out_path.as_posix(),
                    "sha256": sha256_file(out_path),
                    "documentId": doc_id,
                    "sourcePage": reg["page"],
                    "sourceBounds": [round(bbox.x0, 2), round(bbox.y0, 2), round(bbox.x1, 2), round(bbox.y1, 2)],
                    "width": pix.width,
                    "height": pix.height,
                    "sharedByQuestionIds": [],
                })
                ensure_manifest(qid)["figures"].append({
                    "url": f"/question-assets/figures/{year}/{file_name}",
                    "width": pix.width,
                    "height": pix.height,
                })
                fig_idx += 1
                fig_count += 1
                extracted_any = True

        # Fallback: se nao isolou vetor/imagem (ex: tabela de texto puro), usa a regiao do enunciado
        if not extracted_any:
            for idx, reg in enumerate(occ["sourceRegions"], start=1):
                page = doc[reg["page"] - 1]
                rect = pymupdf.Rect(reg["bounds"])
                pix = page.get_pixmap(matrix=pymupdf.Matrix(2, 2), clip=rect, alpha=False)
                file_name = f"{qid}-fig-{idx:02}.png"
                out_path = out_dir / file_name
                pix.save(out_path)
                new_assets.append({
                    "id": f"asset-{qid}-fig-{idx:02}",
                    "questionId": qid,
                    "occurrenceId": occ["id"],
                    "type": "FIGURE",
                    "path": out_path.as_posix(),
                    "sha256": sha256_file(out_path),
                    "documentId": doc_id,
                    "sourcePage": reg["page"],
                    "sourceBounds": reg["bounds"],
                    "width": pix.width,
                    "height": pix.height,
                    "sharedByQuestionIds": [],
                })
                ensure_manifest(qid)["figures"].append({
                    "url": f"/question-assets/figures/{year}/{file_name}",
                    "width": pix.width,
                    "height": pix.height,
                })
                fig_count += 1

    print(f"   -> {fig_count} figuras extraidas para public/question-assets/figures/")

    # 3. Process shared contexts (shared/) for language papers (1 -> N)
    print("3. Extraindo textos-base compartilhados (SHARED_CONTEXT) para Linguas...")
    by_paper: dict[str, list[dict]] = {}
    for q in questions:
        if q["subject"] in ("portuguese", "english", "spanish", "french"):
            by_paper.setdefault(q["paperId"], []).append(q)

    shared_count = 0
    for pid, qs in sorted(by_paper.items()):
        qs.sort(key=lambda x: occurrences[x["id"]]["number"])
        doc_id = qs[0]["source"]["documentId"]
        year = exams[papers[pid]["examId"]]["year"]
        doc = get_pdf(doc_id)

        pages_used = sorted({r["page"] for q in qs for r in occurrences[q["id"]]["sourceRegions"]})
        first_page = pages_used[0]
        last_page = pages_used[-1]
        # Check if previous page (> 1, never cover page 1) has subject intro/text
        subject_headers = {
            "portuguese": "LINGUA PORTUGUESA",
            "english": "LINGUA INGLESA",
            "spanish": "LINGUA ESPANHOLA",
            "french": "LINGUA FRANCESA",
        }
        all_section_headers = {
            "LINGUA PORTUGUESA", "MATEMATICA", "HISTORIA", "GEOGRAFIA", "FISICA",
            "QUIMICA", "BIOLOGIA", "FILOSOFIA", "SOCIOLOGIA", "EDUCACAO FISICA",
            "LINGUA ESPANHOLA", "LINGUA FRANCESA", "LINGUA INGLESA",
            "LÍNGUA PORTUGUESA", "MATEMÁTICA", "HISTÓRIA", "FÍSICA",
            "QUÍMICA", "EDUCAÇÃO FÍSICA", "LÍNGUA ESPANHOLA", "LÍNGUA FRANCESA", "LÍNGUA INGLESA",
        }
        hdr_variants = {subject_headers[qs[0]["subject"]], subject_headers[qs[0]["subject"]].replace("I", "Í")}
        prev_start_pos: tuple[int, float] | None = None  # (col, y0) of subject header on first_page - 1

        if first_page > 2:
            prev_page = doc[first_page - 2]
            prev_mid = prev_page.rect.width / 2
            for b in prev_page.get_text("dict")["blocks"]:
                if b["type"] != 0:
                    continue
                txt = "".join(s["text"] for l in b["lines"] for s in l["spans"]).strip().upper()
                if any(h == txt or txt.startswith(h + "\n") or txt.startswith(h + " ") for h in hdr_variants):
                    bx0, by0, bx1, _ = b["bbox"]
                    col = 0 if (bx0 + bx1) / 2 < prev_mid else 1
                    prev_start_pos = (col, by0)
                    pages_used.insert(0, first_page - 1)
                    break

        # Find all orphan column regions (not covered by question regions) across pages_used
        context_regions: list[tuple[int, int, list[float]]] = []  # (page, col, bounds)
        for p in pages_used:
            if p == 1:
                continue
            page = doc[p - 1]
            midpoint = page.rect.width / 2
            q_regs = [r["bounds"] for q in qs for r in occurrences[q["id"]]["sourceRegions"] if r["page"] == p]

            blocks = page.get_text("dict")["blocks"]
            # Check if another subject starts on this page (e.g. Matematica after Portugues)
            next_subject_pos: tuple[int, float] | None = None
            if p == last_page:
                for b in blocks:
                    if b["type"] != 0:
                        continue
                    txt = "".join(s["text"] for l in b["lines"] for s in l["spans"]).strip().upper()
                    if txt in all_section_headers and txt not in hdr_variants:
                        bx0, by0, bx1, _ = b["bbox"]
                        ncol = 0 if (bx0 + bx1) / 2 < midpoint else 1
                        if next_subject_pos is None or (ncol, by0) < next_subject_pos:
                            next_subject_pos = (ncol, by0)

            orphan_by_col: dict[int, list[tuple[float, float, float, float]]] = {0: [], 1: []}
            for b in blocks:
                x0, y0, x1, y1 = b["bbox"]
                if y0 < 55 or y1 > page.rect.height - 55:
                    continue
                if b["type"] == 0:
                    txt = "".join(s["text"] for l in b["lines"] for s in l["spans"]).strip()
                    if not txt or "O número do gabarito" in txt or txt.startswith("Página ") or txt == "R A S C U N H O":
                        continue
                col = 0 if (x0 + x1) / 2 < midpoint else 1
                if p == first_page - 1 and prev_start_pos is not None:
                    if (col, y0) < prev_start_pos:
                        continue
                if next_subject_pos is not None and (col, y0) >= next_subject_pos:
                    continue
                cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
                in_q = any(rx0 - 5 <= cx <= rx1 + 5 and ry0 - 3 <= cy <= ry1 + 3 for rx0, ry0, rx1, ry1 in q_regs)
                if not in_q:
                    orphan_by_col[col].append((x0, y0, x1, y1))

            for col in (0, 1):
                cblocks = orphan_by_col[col]
                if not cblocks:
                    continue
                ux0 = 28.0 if col == 0 else midpoint + 5.0
                ux1 = midpoint - 5.0 if col == 0 else page.rect.width - 28.0
                uy0 = max(55.0, min(b[1] for b in cblocks) - 4.0)
                uy1 = min(page.rect.height - 55.0, max(b[3] for b in cblocks) + 4.0)
                if uy1 - uy0 > 60:
                    context_regions.append((p, col, [ux0, uy0, ux1, uy1]))

        if not context_regions:
            continue

        # Group consecutive column regions into logical Texts (separated by questions or big gaps)
        # Map each context block to the questions that follow it until the next context block
        # First, find starting (page, col, y0) of each question
        q_starts = []
        for q in qs:
            reg0 = occurrences[q["id"]]["sourceRegions"][0]
            col0 = 0 if reg0["bounds"][0] < 290 else 1
            q_starts.append((q["id"], occurrences[q["id"]]["number"], (reg0["page"], col0, reg0["bounds"][1])))

        # Merge adjacent context regions (e.g. Page 2 Col 0 + Page 2 Col 1 if no question in between)
        grouped_contexts: list[list[tuple[int, int, list[float]]]] = []
        for reg in context_regions:
            p, col, bnds = reg
            if not grouped_contexts:
                grouped_contexts.append([reg])
                continue
            prev_p, prev_col, prev_bnds = grouped_contexts[-1][-1]
            # Check if any question starts between prev and curr
            has_q_between = any(
                (prev_p, prev_col, prev_bnds[1]) < q_pos < (p, col, bnds[1])
                for _, _, q_pos in q_starts
            )
            if not has_q_between:
                grouped_contexts[-1].append(reg)
            else:
                grouped_contexts.append([reg])

        # Associate each grouped context to all questions after it and before the next group
        out_dir = PUBLIC_ASSETS_ROOT / "shared" / str(year)
        out_dir.mkdir(parents=True, exist_ok=True)

        for ctx_idx, ctx_group in enumerate(grouped_contexts, start=1):
            first_pos = (ctx_group[0][0], ctx_group[0][1], ctx_group[0][2][1])
            next_pos = (
                (grouped_contexts[ctx_idx][0][0], grouped_contexts[ctx_idx][0][1], grouped_contexts[ctx_idx][0][2][1])
                if ctx_idx < len(grouped_contexts)
                else (9999, 9, 9999.0)
            )
            shared_qids = [
                qid for qid, _, q_pos in q_starts
                if first_pos <= q_pos < next_pos
            ]
            # If no questions found strictly after (e.g. context was on same page/after), link to all questions of the paper that reference texto N or fallback
            if not shared_qids:
                shared_qids = [q["id"] for q in qs]

            for part_idx, (p, col, bnds) in enumerate(ctx_group, start=1):
                page = doc[p - 1]
                pix = page.get_pixmap(matrix=pymupdf.Matrix(2, 2), clip=pymupdf.Rect(bnds), alpha=False)
                file_name = f"{pid}-ctx-{ctx_idx:02}-part-{part_idx:02}.png"
                out_path = out_dir / file_name
                pix.save(out_path)
                new_assets.append({
                    "id": f"asset-{pid}-ctx-{ctx_idx:02}-part-{part_idx:02}",
                    "questionId": None,
                    "occurrenceId": None,
                    "type": "SHARED_CONTEXT",
                    "path": out_path.as_posix(),
                    "sha256": sha256_file(out_path),
                    "documentId": doc_id,
                    "sourcePage": p,
                    "sourceBounds": [round(x, 2) for x in bnds],
                    "width": pix.width,
                    "height": pix.height,
                    "sharedByQuestionIds": shared_qids,
                })
                url = f"/question-assets/shared/{year}/{file_name}"
                for sqid in shared_qids:
                    ensure_manifest(sqid)["shared"].append({
                        "url": url,
                        "width": pix.width,
                        "height": pix.height,
                    })
                shared_count += 1

    print(f"   -> {shared_count} imagens de textos-base compartilhados extraidas para public/question-assets/shared/")

    # Write updated assets.jsonl
    all_assets = sorted(base_assets + new_assets, key=lambda x: x["id"])
    with (DATA_ROOT / "assets.jsonl").open("w", encoding="utf-8") as f:
        for a in all_assets:
            f.write(json.dumps(a, ensure_ascii=False) + "\n")

    # Write public/question-assets/manifest.json
    manifest_path = PUBLIC_ASSETS_ROOT / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False), encoding="utf-8")
    print(f"\nConcluido! Manifesto salvo em {manifest_path} ({len(manifest)} questoes com recursos visuais).")


if __name__ == "__main__":
    extract_all()
