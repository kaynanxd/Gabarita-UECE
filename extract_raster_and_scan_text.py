import hashlib
import json
import re
from pathlib import Path
import pymupdf

DATA_ROOT = Path("question-bank/data")
PDF_ROOT = Path("UECE/VESTIBULAR UECE_/1 PROVAS E GABARITOS")
PUBLIC_FIGURES_ROOT = Path("public/question-assets/figures")
MANIFEST_PATH = Path("public/question-assets/manifest.json")

EXTRA_TEXT_VISUAL_RE = re.compile(
    r"(?:"
    r"f[óo]rmula\s+estrutural|"
    r"estrutura\s+(?:abaixo|a seguir|acima|ao lado|química|molecular|do composto|da mol[ée]cula)|"
    r"observe\s+(?:a\s+estrutura|o\s+circuito|o\s+heredograma|a\s+pir[âa]mide|o\s+organograma|o\s+fluxograma|a\s+rea[çc][ãa]o|a\s+montagem)|"
    r"considere\s+(?:o\s+circuito|a\s+estrutura|o\s+sistema\s+abaixo|a\s+montagem|o\s+heredograma)|"
    r"circuito\s+(?:abaixo|a seguir|el[ée]trico\s+abaixo|mostrado|representado|ilustrado)|"
    r"heredograma|"
    r"pir[âa]mide\s+(?:et[áa]ria|alimentar|de\s+biomassa|ecol[óo]gica)|"
    r"abaixo\s*:|a\s+seguir\s*:"
    r")",
    re.IGNORECASE,
)

def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()

def rects_overlap(r1, r2, pad=4.0):
    return not (r1[2] + pad < r2[0] or r1[0] - pad > r2[2] or r1[3] + pad < r2[1] or r1[1] - pad > r2[3])

questions = [json.loads(l) for l in (DATA_ROOT / "questions.jsonl").read_text(encoding="utf-8").splitlines() if l.strip()]
occurrences = {o["questionId"]: o for o in (json.loads(l) for l in (DATA_ROOT / "occurrences.jsonl").read_text(encoding="utf-8").splitlines() if l.strip())}
docs = {d["id"]: d for d in (json.loads(l) for l in (DATA_ROOT / "manifests/documents.jsonl").read_text(encoding="utf-8").splitlines() if l.strip())}
papers = {p["id"]: p for p in (json.loads(l) for l in (DATA_ROOT / "papers.jsonl").read_text(encoding="utf-8").splitlines() if l.strip())}
exams = {e["id"]: e for e in (json.loads(l) for l in (DATA_ROOT / "exams.jsonl").read_text(encoding="utf-8").splitlines() if l.strip())}
existing_assets = [json.loads(l) for l in (DATA_ROOT / "assets.jsonl").read_text(encoding="utf-8").splitlines() if l.strip()]
manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8")) if MANIFEST_PATH.exists() else {}
already_extracted = set(manifest.keys())

pdf_cache = {}
new_figure_assets = []
extra_text_candidates = []

for q in questions:
    qid = q["id"]
    if qid in already_extracted:
        continue
    occ = occurrences.get(qid)
    if not occ:
        continue
    doc_id = q["source"]["documentId"]
    if doc_id not in pdf_cache:
        pdf_cache[doc_id] = pymupdf.open(PDF_ROOT / docs[doc_id]["relativePath"])
    doc = pdf_cache[doc_id]
    year = exams[papers[q["paperId"]]["examId"]]["year"]

    # Check raster images in statement area
    raster_rects = []
    for reg in occ["sourceRegions"]:
        page = doc[reg["page"] - 1]
        rb = reg["bounds"]

        opt_a_y = rb[3]
        for b in page.get_text("dict")["blocks"]:
            if b["type"] != 0 or not rects_overlap(rb, b["bbox"], 2.0):
                continue
            for line in b["lines"]:
                txt = "".join(s["text"] for s in line["spans"]).strip()
                if txt.startswith("A)"):
                    opt_a_y = min(opt_a_y, line["bbox"][1])

        stmt_rect = (rb[0], rb[1], rb[2], opt_a_y)
        r_boxes = []
        for b in page.get_text("dict")["blocks"]:
            if b["type"] == 1 and rects_overlap(stmt_rect, b["bbox"], 4.0):
                bw = b["bbox"][2] - b["bbox"][0]
                bh = b["bbox"][3] - b["bbox"][1]
                if bw >= 35 and bh >= 35:
                    r_boxes.append(b["bbox"])

        if r_boxes:
            # Union of raster boxes in this region, padded cleanly within column
            ux0 = max(rb[0], min(b[0] for b in r_boxes) - 8.0)
            uy0 = max(55.0, min(b[1] for b in r_boxes) - 8.0)
            ux1 = min(rb[2], max(b[2] for b in r_boxes) + 8.0)
            uy1 = min(page.rect.height - 55.0, max(b[3] for b in r_boxes) + 8.0)
            raster_rects.append((reg["page"], pymupdf.Rect(ux0, uy0, ux1, uy1)))

    if raster_rects:
        out_dir = PUBLIC_FIGURES_ROOT / str(year)
        out_dir.mkdir(parents=True, exist_ok=True)
        for idx, (page_num, rect) in enumerate(raster_rects, start=1):
            page = doc[page_num - 1]
            pix = page.get_pixmap(matrix=pymupdf.Matrix(2, 2), clip=rect, alpha=False)
            file_name = f"{qid}-fig-{idx:02}.png"
            out_path = out_dir / file_name
            pix.save(out_path)
            new_figure_assets.append({
                "id": f"asset-{qid}-fig-{idx:02}",
                "questionId": qid,
                "occurrenceId": occ["id"],
                "type": "FIGURE",
                "path": out_path.as_posix(),
                "sha256": sha256_file(out_path),
                "documentId": doc_id,
                "sourcePage": page_num,
                "sourceBounds": [round(rect.x0, 2), round(rect.y0, 2), round(rect.x1, 2), round(rect.y1, 2)],
                "width": pix.width,
                "height": pix.height,
                "sharedByQuestionIds": [],
            })
            manifest.setdefault(qid, {"shared": [], "figures": [], "crops": []})["figures"].append({
                "url": f"/question-assets/figures/{year}/{file_name}",
                "width": pix.width,
                "height": pix.height,
            })
            print(f"[RASTER SAVED] {file_name} ({pix.width}x{pix.height})")
    elif EXTRA_TEXT_VISUAL_RE.search(q["statement"]):
        extra_text_candidates.append((qid, q["subject"], q["statement"][:90].replace("\n", " ")))

all_assets = sorted(existing_assets + new_figure_assets, key=lambda x: x["id"])
with (DATA_ROOT / "assets.jsonl").open("w", encoding="utf-8") as f:
    for a in all_assets:
        f.write(json.dumps(a, ensure_ascii=False) + "\n")

MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"\nTotal novas imagens raster salvas: {len(new_figure_assets)}")
print(f"Total candidatas textuais extras (sem raster): {len(extra_text_candidates)}")
for qid, s, st in extra_text_candidates[:30]:
    print(f"  [EXTRA_TXT] {qid} ({s}): {st}")
