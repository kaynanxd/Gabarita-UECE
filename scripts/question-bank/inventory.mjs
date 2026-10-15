import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_SOURCE = path.join(
  "UECE",
  "VESTIBULAR UECE_",
  "1 PROVAS E GABARITOS",
);
const DEFAULT_OUTPUT = path.join("question-bank", "data");
const ACTIVE_MINIMUM_YEAR = 2015;
const ACTIVE_MAXIMUM_YEAR = 2023;

const sourceRoot = path.resolve(process.argv[2] ?? DEFAULT_SOURCE);
const outputRoot = path.resolve(process.argv[3] ?? DEFAULT_OUTPUT);
const manifestDir = path.join(outputRoot, "manifests");

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizePath(value) {
  return value.split(path.sep).join("/");
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolutePath)));
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
      files.push(absolutePath);
    }
  }

  return files;
}

function sha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function inferEdition(relativePath) {
  const normalized = normalizeText(relativePath);
  const matches = [...normalized.matchAll(/(?:uece\s*)?(20\d{2})[.\s_-]*([12])/g)];
  const candidates = [
    ...new Set(matches.map((match) => `${Number(match[1])}.${Number(match[2])}`)),
  ];
  if (candidates.length !== 1) return { year: null, semester: null, candidates };
  const [year, semester] = candidates[0].split(".").map(Number);
  return { year, semester, candidates };
}

function inferPhase(relativePath) {
  const normalized = normalizeText(relativePath);
  const candidates = [];
  if (/(?:2a|2ª|2o|segunda)\s*fase|f2(?:\D|$)/.test(normalized)) candidates.push(2);
  if (/(?:1a|1ª|1o|primeira)\s*fase|f1(?:\D|$)/.test(normalized)) candidates.push(1);
  return { value: candidates.length === 1 ? candidates[0] : null, candidates };
}

function inferDocumentType(fileName) {
  const normalized = normalizeText(fileName);
  if (/gab|gabarito/.test(normalized)) {
    if (/preliminar|gab(?:of)?pre/.test(normalized)) return "ANSWER_KEY_PRELIMINARY";
    if (/definitivo|gab(?:of)?def/.test(normalized)) return "ANSWER_KEY_OFFICIAL";
    return "ANSWER_KEY_UNKNOWN_STATUS";
  }
  if (/comunicado|edital|resultado|recurso/.test(normalized)) return "ADMINISTRATIVE";
  return "EXAM_OR_UNKNOWN";
}

function inferBooklet(fileName) {
  const normalized = normalizeText(path.basename(fileName, path.extname(fileName)));
  const match = normalized.match(/(?:gabarito\s*|g)([1-4])(?:[^0-9]|$)/);
  return match ? `G${match[1]}` : null;
}

function contentId(hash) {
  return `content-${hash.slice(0, 16)}`;
}

function documentId(hash, relativePath) {
  const pathHash = createHash("sha256").update(relativePath).digest("hex");
  return `doc-${hash.slice(0, 12)}-${pathHash.slice(0, 8)}`;
}

async function atomicWrite(filePath, contents) {
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, contents, "utf8");
  await rm(filePath, { force: true });
  await rename(temporaryPath, filePath);
}

async function main() {
  const sourceStats = await stat(sourceRoot).catch(() => null);
  if (!sourceStats?.isDirectory()) {
    throw new Error(`Diretorio de origem nao encontrado: ${sourceRoot}`);
  }

  const files = await walk(sourceRoot);
  const documents = [];

  for (const [index, filePath] of files.entries()) {
    const relativePath = normalizePath(path.relative(sourceRoot, filePath));
    const fileStats = await stat(filePath);
    const hash = await sha256(filePath);
    const edition = inferEdition(relativePath);
    const phase = inferPhase(relativePath);
    const metadataWarnings = [];
    if (edition.candidates.length > 1) {
      metadataWarnings.push(`CONFLICTING_EDITIONS:${edition.candidates.join(",")}`);
    }
    if (phase.candidates.length > 1) {
      metadataWarnings.push(`CONFLICTING_PHASES:${phase.candidates.join(",")}`);
    }

    documents.push({
      id: documentId(hash, relativePath),
      contentId: contentId(hash),
      relativePath,
      fileName: path.basename(filePath),
      sha256: hash,
      sizeBytes: fileStats.size,
      year: edition.year,
      semester: edition.semester,
      phase: phase.value,
      inScope:
        edition.year !== null &&
        edition.year >= ACTIVE_MINIMUM_YEAR &&
        edition.year <= ACTIVE_MAXIMUM_YEAR,
      booklet: inferBooklet(path.basename(filePath)),
      documentType: inferDocumentType(path.basename(filePath)),
      reviewStatus: "PENDING_REVIEW",
      metadataWarnings,
    });

    if ((index + 1) % 100 === 0) {
      process.stdout.write(`Inventariados ${index + 1}/${files.length}\n`);
    }
  }

  documents.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  const byHash = new Map();
  for (const document of documents) {
    const group = byHash.get(document.sha256) ?? [];
    group.push(document.relativePath);
    byHash.set(document.sha256, group);
  }

  const duplicates = [...byHash.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([hash, paths]) => ({ sha256: hash, contentId: contentId(hash), paths }))
    .sort((a, b) => a.paths[0].localeCompare(b.paths[0]));

  await mkdir(manifestDir, { recursive: true });
  await atomicWrite(
    path.join(manifestDir, "documents.jsonl"),
    `${documents.map((document) => JSON.stringify(document)).join("\n")}\n`,
  );
  await atomicWrite(
    path.join(manifestDir, "duplicates.json"),
    `${JSON.stringify(duplicates, null, 2)}\n`,
  );

  for (const fileName of [
    "exams.jsonl",
    "papers.jsonl",
    "questions.jsonl",
    "occurrences.jsonl",
    "answer-keys.jsonl",
    "assets.jsonl",
  ]) {
    await writeFile(path.join(outputRoot, fileName), "", { flag: "a" });
  }
  await mkdir(path.join(outputRoot, "assets"), { recursive: true });

  console.log(`PDFs inventariados: ${documents.length}`);
  console.log(`Grupos duplicados: ${duplicates.length}`);
  console.log(
    `Metadados conflitantes: ${documents.filter((document) => document.metadataWarnings.length).length}`,
  );
  console.log(`PDFs no recorte ativo (2015-2023): ${documents.filter((document) => document.inScope).length}`);
  console.log(`Saida: ${manifestDir}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

