import { readFileSync } from "node:fs";
import path from "node:path";

type RawQuestion = {
  id: string;
  paperId: string;
  subject: string;
  statement: string;
  alternatives: { id: string; text: string }[];
  correctAlternativeId: string | null;
  answerStatus: "PRELIMINARY" | "OFFICIAL" | "CHANGED" | "ANNULLED" | "UNAVAILABLE";
};

type RawPaper = {
  id: string;
  examId: string;
  phase: 1 | 2;
  subject: string;
};

type RawExam = {
  id: string;
  year: number;
  semester: 1 | 2;
};

type RawOccurrence = {
  questionId: string;
  number: number;
  optionOrder: Record<"A" | "B" | "C" | "D", string>;
};

export type PracticeQuestion = {
  id: string;
  number: number;
  statement: string;
  alternatives: { id: string; label: "A" | "B" | "C" | "D"; text: string }[];
  correctAlternativeId: string | null;
  answerStatus: RawQuestion["answerStatus"];
  year: number;
  semester: 1 | 2;
  phase: 1 | 2;
  subject: string;
};

export type PracticeFilters = {
  editions?: string[];
  phases?: (1 | 2)[];
  subjects?: string[];
  courseGroup?: number;
  quantity?: number | "all";
};

export type FilterOptions = {
  editions: string[];
  phases: (1 | 2)[];
  subjects: { id: string; label: string }[];
  courseGroups: { id: number; label: string }[];
};

export type ArchiveEdition = {
  id: string;
  phases: {
    phase: 1 | 2;
    questionCount: number;
    subjects: { id: string; label: string; questionCount: number }[];
  }[];
};

export type ArchiveSubject = {
  edition: string;
  phase: 1 | 2;
  subject: { id: string; label: string };
  questions: PracticeQuestion[];
};

type QuestionBank = {
  questions: PracticeQuestion[];
  filters: FilterOptions;
};

let cachedBank: QuestionBank | undefined;

const dataDirectory = path.join(process.cwd(), "question-bank", "data");

const subjectLabels: Record<string, string> = {
  biology: "Biologia",
  chemistry: "Química",
  english: "Inglês",
  french: "Francês",
  geography: "Geografia",
  history: "História",
  mathematics: "Matemática",
  philosophy: "Filosofia",
  "physical-education": "Educação Física",
  physics: "Física",
  portuguese: "Português",
  sociology: "Sociologia",
  spanish: "Espanhol",
};

const firstPhaseBlueprint = [
  ["portuguese", 12], ["mathematics", 10], ["history", 8], ["geography", 8],
  ["physics", 8], ["chemistry", 8], ["biology", 8], ["physical-education", 5],
  ["philosophy", 5], ["sociology", 5], ["english", 8],
] as const;

const secondPhaseGroups: Record<number, readonly string[]> = {
  1: ["biology", "physics", "chemistry"],
  2: ["mathematics", "physics", "chemistry"],
  3: ["mathematics", "geography", "history"],
  4: ["portuguese", "geography", "history"],
  5: ["english", "geography", "history"],
  6: ["french", "geography", "history"],
  7: ["spanish", "geography", "history"],
  8: ["portuguese", "philosophy", "sociology"],
};

function readJsonl<T>(fileName: string): T[] {
  return readFileSync(path.join(dataDirectory, fileName), "utf8")
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

function loadQuestionBank(): QuestionBank {
  if (cachedBank) return cachedBank;

  const rawQuestions = readJsonl<RawQuestion>("questions.jsonl");
  const papers = new Map(readJsonl<RawPaper>("papers.jsonl").map((paper) => [paper.id, paper]));
  const exams = new Map(readJsonl<RawExam>("exams.jsonl").map((exam) => [exam.id, exam]));
  const occurrences = new Map(
    readJsonl<RawOccurrence>("occurrences.jsonl").map((occurrence) => [occurrence.questionId, occurrence]),
  );

  const questions = rawQuestions.flatMap((question): PracticeQuestion[] => {
    const paper = papers.get(question.paperId);
    const exam = paper ? exams.get(paper.examId) : undefined;
    const occurrence = occurrences.get(question.id);
    if (!paper || !exam || !occurrence) return [];

    const labels: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
    const alternativeById = new Map(question.alternatives.map((alternative) => [alternative.id, alternative]));

    return [{
      id: question.id,
      number: occurrence.number,
      statement: question.statement,
      alternatives: labels.flatMap((label) => {
        const alternative = alternativeById.get(occurrence.optionOrder[label]);
        return alternative ? [{ id: alternative.id, label, text: alternative.text }] : [];
      }),
      correctAlternativeId: question.correctAlternativeId,
      answerStatus: question.answerStatus,
      year: exam.year,
      semester: exam.semester,
      phase: paper.phase,
      subject: paper.subject,
    }];
  });

  cachedBank = {
    questions,
    filters: {
      editions: [...new Set(questions.map((question) => `${question.year}.${question.semester}`))].sort((a, b) => b.localeCompare(a, undefined, { numeric: true })),
      phases: [1, 2],
      subjects: [...new Set(questions.map((question) => question.subject))]
        .sort()
        .map((id) => ({ id, label: subjectLabels[id] ?? id })),
      courseGroups: Object.entries(secondPhaseGroups).map(([id, subjects]) => ({
        id: Number(id),
        label: `Grupo ${id} — ${subjects.map((subject) => subjectLabels[subject]).join(", ")}`,
      })),
    },
  };

  return cachedBank;
}

export function getFilterOptions(): FilterOptions {
  return loadQuestionBank().filters;
}

export function getArchive(): ArchiveEdition[] {
  const groups = new Map<string, PracticeQuestion[]>();
  for (const question of loadQuestionBank().questions) {
    const edition = `${question.year}.${question.semester}`;
    const items = groups.get(edition) ?? [];
    items.push(question);
    groups.set(edition, items);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true }))
    .map(([id, questions]) => ({
      id,
      phases: ([1, 2] as const).flatMap((phase) => {
        const phaseQuestions = questions.filter((question) => question.phase === phase);
        if (!phaseQuestions.length) return [];
        const subjects = [...new Set(phaseQuestions.map((question) => question.subject))]
          .sort((a, b) => (subjectLabels[a] ?? a).localeCompare(subjectLabels[b] ?? b, "pt-BR"))
          .map((subject) => ({
            id: subject,
            label: subjectLabels[subject] ?? subject,
            questionCount: phaseQuestions.filter((question) => question.subject === subject).length,
          }));
        return [{ phase, questionCount: phaseQuestions.length, subjects }];
      }),
    }));
}

export function getArchiveSubject(edition: string, phase: number, subject: string): ArchiveSubject | undefined {
  if ((phase !== 1 && phase !== 2) || !/^20(1[5-9]|2[0-3])\.[12]$/.test(edition)) return undefined;
  const questions = loadQuestionBank().questions
    .filter((question) => `${question.year}.${question.semester}` === edition && question.phase === phase && question.subject === subject)
    .sort((a, b) => a.number - b.number);
  if (!questions.length) return undefined;
  return { edition, phase, subject: { id: subject, label: subjectLabels[subject] ?? subject }, questions };
}

export function getArchivePhase(edition: string, phase: number) {
  if ((phase !== 1 && phase !== 2) || !/^20(1[5-9]|2[0-3])\.[12]$/.test(edition)) return undefined;
  const questions = loadQuestionBank().questions
    .filter((question) => `${question.year}.${question.semester}` === edition && question.phase === phase)
    .sort((a, b) => a.number - b.number || a.subject.localeCompare(b.subject));
  return questions.length ? { edition, phase: phase as 1 | 2, questions } : undefined;
}

export function findPracticeQuestions(filters: PracticeFilters) {
  const bank = loadQuestionBank();
  const matching = bank.questions.filter((question) =>
    (!filters.editions?.length || filters.editions.includes(`${question.year}.${question.semester}`)) &&
    (!filters.phases?.length || filters.phases.includes(question.phase)) &&
    (!filters.subjects?.length || filters.subjects.includes(question.subject)),
  );

  const includesFirstPhase = !filters.phases?.length || filters.phases.includes(1);
  const includesSecondPhase = !filters.phases?.length || filters.phases.includes(2);
  const maximumForSession = (includesFirstPhase ? 85 : 0) + (includesSecondPhase ? 60 : 0);

  if (filters.quantity === "all") {
    return {
      available: matching.length,
      questions: buildCompleteSimulation(matching, { includesFirstPhase, includesSecondPhase, subjects: filters.subjects, courseGroup: filters.courseGroup }),
    };
  }

  const quantity = Math.min(Math.max(filters.quantity ?? 10, 1), maximumForSession);
  const shuffled = [...matching];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }

  return { available: matching.length, questions: shuffled.slice(0, quantity) };
}

function buildCompleteSimulation(
  questions: PracticeQuestion[],
  options: { includesFirstPhase: boolean; includesSecondPhase: boolean; subjects?: string[]; courseGroup?: number },
) {
  const picked: PracticeQuestion[] = [];
  const subjectIsAllowed = (subject: string) => !options.subjects?.length || options.subjects.includes(subject);

  if (options.includesFirstPhase) {
    const selectedLanguage = ["english", "french", "spanish"].find((subject) => options.subjects?.includes(subject)) ?? "english";
    for (const [subject, count] of firstPhaseBlueprint) {
      if (subject === "english" && selectedLanguage !== "english") {
        if (subjectIsAllowed(selectedLanguage)) picked.push(...pickQuestions(questions, 1, selectedLanguage, 8));
      } else if (subjectIsAllowed(subject)) {
        picked.push(...pickQuestions(questions, 1, subject, count));
      }
    }
  }

  if (options.includesSecondPhase) {
    const group = secondPhaseGroups[options.courseGroup ?? 1];
    for (const subject of group) {
      if (subjectIsAllowed(subject)) picked.push(...pickQuestions(questions, 2, subject, 20));
    }
  }

  return picked;
}

function pickQuestions(questions: PracticeQuestion[], phase: 1 | 2, subject: string, count: number) {
  const candidates = questions.filter((question) => question.phase === phase && question.subject === subject);
  shuffle(candidates);
  return candidates.slice(0, count);
}

function shuffle<T>(items: T[]) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [items[index], items[other]] = [items[other], items[index]];
  }
}

export function parseList(value: string | null): string[] | undefined {
  if (!value) return undefined;
  const values = value.split(",").map((item) => item.trim()).filter(Boolean);
  return values.length ? values : undefined;
}

export function parseEditions(value: string | null): string[] | undefined {
  const values = parseList(value)?.filter((edition) => /^20(1[5-9]|2[0-3])\.[12]$/.test(edition));
  return values?.length ? values : undefined;
}

export function parsePhases(value: string | null): (1 | 2)[] | undefined {
  const values = parseList(value)?.map(Number).filter((phase): phase is 1 | 2 => phase === 1 || phase === 2);
  return values?.length ? values : undefined;
}

export function parseCourseGroup(value: string | null): number | undefined {
  const group = Number(value);
  return Number.isInteger(group) && group in secondPhaseGroups ? group : undefined;
}
