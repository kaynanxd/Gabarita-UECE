import { readFile } from "node:fs/promises";
import path from "node:path";

const dataRoot = path.resolve(process.argv[2] ?? path.join("question-bank", "data"));

const FILES = {
  documents: path.join("manifests", "documents.jsonl"),
  exams: "exams.jsonl",
  papers: "papers.jsonl",
  questions: "questions.jsonl",
  occurrences: "occurrences.jsonl",
  answerKeys: "answer-keys.jsonl",
  assets: "assets.jsonl",
};

const errors = [];
const warnings = [];

async function readJsonLines(relativePath) {
  const absolutePath = path.join(dataRoot, relativePath);
  const contents = await readFile(absolutePath, "utf8").catch((error) => {
    if (error.code === "ENOENT") {
      warnings.push(`${relativePath}: arquivo ainda nao existe`);
      return "";
    }
    throw error;
  });

  const records = [];
  for (const [index, line] of contents.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    try {
      records.push(JSON.parse(line));
    } catch (error) {
      errors.push(`${relativePath}:${index + 1}: JSON invalido (${error.message})`);
    }
  }
  return records;
}

function indexUnique(records, label) {
  const index = new Map();
  for (const record of records) {
    if (typeof record.id !== "string" || !record.id) {
      errors.push(`${label}: registro sem id`);
      continue;
    }
    if (index.has(record.id)) errors.push(`${label}: id duplicado ${record.id}`);
    index.set(record.id, record);
  }
  return index;
}

function validateQuestions(questions, papers, documents) {
  const statuses = new Set(["PRELIMINARY", "OFFICIAL", "CHANGED", "ANNULLED", "UNAVAILABLE"]);
  const reviews = new Set(["PENDING_REVIEW", "REVIEWED", "REJECTED"]);

  for (const question of questions) {
    if (!papers.has(question.paperId)) errors.push(`${question.id}: paperId inexistente`);
    if (!Array.isArray(question.alternatives) || question.alternatives.length !== 4) {
      errors.push(`${question.id}: deve possuir exatamente quatro alternativas`);
      continue;
    }
    const alternativeIds = question.alternatives.map((alternative) => alternative.id);
    if (new Set(alternativeIds).size !== 4) errors.push(`${question.id}: IDs de alternativas repetidos`);
    if (!statuses.has(question.answerStatus)) errors.push(`${question.id}: answerStatus invalido`);
    if (!reviews.has(question.reviewStatus)) errors.push(`${question.id}: reviewStatus invalido`);
    if (!["NATIVE_TEXT", "OCR", "MANUAL"].includes(question.extraction?.method)) {
      errors.push(`${question.id}: metodo de extracao invalido`);
    }
    if (
      typeof question.extraction?.confidence !== "number" ||
      question.extraction.confidence < 0 ||
      question.extraction.confidence > 1
    ) {
      errors.push(`${question.id}: confianca de extracao invalida`);
    }
    if (question.answerStatus === "ANNULLED" && question.correctAlternativeId != null) {
      errors.push(`${question.id}: questao anulada nao pode ter alternativa correta`);
    }
    if (
      question.correctAlternativeId != null &&
      !alternativeIds.includes(question.correctAlternativeId)
    ) {
      errors.push(`${question.id}: correctAlternativeId nao pertence a questao`);
    }
    if (!documents.has(question.source?.documentId)) {
      errors.push(`${question.id}: documento de origem inexistente`);
    }
  }
}

function validateOccurrences(occurrences, questions, documents) {
  const labels = ["A", "B", "C", "D"];
  for (const occurrence of occurrences) {
    const question = questions.get(occurrence.questionId);
    if (!question) {
      errors.push(`${occurrence.id}: questionId inexistente`);
      continue;
    }
    if (!documents.has(occurrence.documentId)) errors.push(`${occurrence.id}: documentId inexistente`);
    if (!/^G[1-4]$/.test(occurrence.booklet ?? "")) errors.push(`${occurrence.id}: booklet invalido`);
    if (!Number.isInteger(occurrence.number) || occurrence.number < 1) {
      errors.push(`${occurrence.id}: numero de questao invalido`);
    }
    if (!Array.isArray(occurrence.sourceRegions) || !occurrence.sourceRegions.length) {
      errors.push(`${occurrence.id}: deve possuir ao menos uma regiao de origem`);
    }
    const order = occurrence.optionOrder ?? {};
    if (!labels.every((label) => typeof order[label] === "string")) {
      errors.push(`${occurrence.id}: optionOrder deve mapear A, B, C e D`);
      continue;
    }
    const orderedIds = labels.map((label) => order[label]);
    if (new Set(orderedIds).size !== 4) errors.push(`${occurrence.id}: optionOrder repete alternativas`);
    const canonicalIds = new Set(question.alternatives.map((alternative) => alternative.id));
    if (!orderedIds.every((id) => canonicalIds.has(id))) {
      errors.push(`${occurrence.id}: optionOrder contem alternativa de outra questao`);
    }
    if (question.correctAlternativeId) {
      const expectedLabel = labels.find((label) => order[label] === question.correctAlternativeId);
      if (occurrence.correctLabel !== expectedLabel) {
        errors.push(`${occurrence.id}: correctLabel diverge da resposta canonica`);
      }
    }
  }
}

function validateAnswerKeys(answerKeys, questions, documents) {
  const statuses = new Set(["PRELIMINARY", "OFFICIAL", "CHANGED", "ANNULLED"]);
  for (const event of answerKeys) {
    const question = questions.get(event.questionId);
    if (!question) errors.push(`${event.id}: questionId inexistente no historico de gabarito`);
    if (!documents.has(event.documentId)) errors.push(`${event.id}: documento do gabarito inexistente`);
    if (!statuses.has(event.status)) errors.push(`${event.id}: status de gabarito invalido`);
    if (event.status === "ANNULLED" && event.correctAlternativeId != null) {
      errors.push(`${event.id}: evento de anulacao nao pode ter alternativa correta`);
    }
    if (
      question &&
      event.correctAlternativeId != null &&
      !question.alternatives.some((alternative) => alternative.id === event.correctAlternativeId)
    ) {
      errors.push(`${event.id}: alternativa do gabarito nao pertence a questao`);
    }
  }
}

function validateAssets(assets, questions, occurrences, documents) {
  const types = new Set(["QUESTION_CROP", "FIGURE", "SHARED_CONTEXT"]);
  for (const asset of assets) {
    if (!types.has(asset.type)) errors.push(`${asset.id}: tipo de asset invalido`);
    if (!documents.has(asset.documentId)) errors.push(`${asset.id}: documento de origem inexistente`);
    if (asset.questionId && !questions.has(asset.questionId)) errors.push(`${asset.id}: questionId inexistente`);
    if (asset.occurrenceId && !occurrences.has(asset.occurrenceId)) {
      errors.push(`${asset.id}: occurrenceId inexistente`);
    }
    if (!/^[a-f0-9]{64}$/.test(asset.sha256 ?? "")) errors.push(`${asset.id}: sha256 invalido`);
  }
}

async function main() {
  const loaded = {};
  for (const [name, relativePath] of Object.entries(FILES)) {
    loaded[name] = await readJsonLines(relativePath);
  }

  const documents = indexUnique(loaded.documents, "documents");
  const exams = indexUnique(loaded.exams, "exams");
  const papers = indexUnique(loaded.papers, "papers");
  const questions = indexUnique(loaded.questions, "questions");
  const occurrences = indexUnique(loaded.occurrences, "occurrences");
  const answerKeys = indexUnique(loaded.answerKeys, "answerKeys");
  const assets = indexUnique(loaded.assets, "assets");

  for (const paper of papers.values()) {
    if (!exams.has(paper.examId)) errors.push(`${paper.id}: examId inexistente`);
  }
  validateQuestions([...questions.values()], papers, documents);
  validateOccurrences([...occurrences.values()], questions, documents);
  validateAnswerKeys([...answerKeys.values()], questions, documents);
  validateAssets([...assets.values()], questions, occurrences, documents);

  for (const warning of warnings) console.warn(`AVISO: ${warning}`);
  for (const error of errors) console.error(`ERRO: ${error}`);

  console.log(
    `Registros: ${documents.size} documentos, ${exams.size} edicoes, ${papers.size} provas, ` +
      `${questions.size} questoes e ${occurrences.size} ocorrencias.`,
  );

  if (errors.length) {
    console.error(`Validacao falhou com ${errors.length} erro(s).`);
    process.exitCode = 1;
  } else {
    console.log(`Validacao concluida sem erros (${warnings.length} aviso(s)).`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

