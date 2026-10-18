"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Flag, GraduationCap, RotateCcw, X } from "lucide-react";
import type { FilterOptions, PracticeQuestion } from "@/lib/question-bank";

type Mode = "training" | "simulation";
type SessionResponse = { available: number; questions: PracticeQuestion[] };
type Quantity = 5 | 10 | 20 | 40 | "all";
const quantities: { value: Quantity; label: string }[] = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 40, label: "40" },
  { value: "all", label: "Simulado completo" },
];

export function PracticeApp({ filters }: { filters: FilterOptions }) {
  const [editions, setEditions] = useState<string[]>([]);
  const [phases, setPhases] = useState<(1 | 2)[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [courseGroup, setCourseGroup] = useState(1);
  const [quantity, setQuantity] = useState<Quantity>(10);
  const [mode, setMode] = useState<Mode>("training");
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [flagged, setFlagged] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const currentQuestion = session?.questions[currentIndex];
  const completed = useMemo(() => Object.keys(answers).length, [answers]);
  const toggle = <T,>(value: T, selected: T[], update: (items: T[]) => void) => update(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);

  async function startSession() {
    setIsLoading(true); setError(null);
    const params = new URLSearchParams({ quantity: String(quantity) });
    if (editions.length) params.set("editions", editions.join(","));
    if (phases.length) params.set("phases", phases.join(","));
    if (subjects.length) params.set("subjects", subjects.join(","));
    if (phases.length === 0 || phases.includes(2)) params.set("courseGroup", String(courseGroup));
    try {
      const response = await fetch(`/api/questions?${params.toString()}`);
      if (!response.ok) throw new Error();
      const data = (await response.json()) as SessionResponse;
      if (!data.questions.length) { setError("Não encontramos questões para essa combinação de filtros."); return; }
      setSession(data); setCurrentIndex(0); setAnswers({}); setConfirmed([]); setFlagged([]); setFinished(false);
    } catch { setError("Não foi possível carregar as questões. Tente novamente."); }
    finally { setIsLoading(false); }
  }

  function reset() { setSession(null); setFinished(false); setError(null); }
  function answerQuestion(id: string) { if (currentQuestion && !confirmed.includes(currentQuestion.id)) setAnswers((current) => ({ ...current, [currentQuestion.id]: id })); }

  if (!session) return <Setup filters={filters} editions={editions} phases={phases} subjects={subjects} courseGroup={courseGroup} quantity={quantity} mode={mode} error={error} isLoading={isLoading} toggle={toggle} setEditions={setEditions} setPhases={setPhases} setSubjects={setSubjects} setCourseGroup={setCourseGroup} setQuantity={setQuantity} setMode={setMode} onStart={startSession} />;
  if (finished) {
    const correct = session.questions.filter((question) => question.correctAlternativeId && answers[question.id] === question.correctAlternativeId).length;
    return <Results questions={session.questions} correct={correct} unanswered={session.questions.length - completed} onReset={reset} />;
  }
  if (!currentQuestion) return null;
  const isConfirmed = confirmed.includes(currentQuestion.id);
  const selectedAnswer = answers[currentQuestion.id];
  const showFeedback = mode === "training" && isConfirmed;

  return <main className="min-h-screen bg-slate-50 text-slate-900"><div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5"><Brand compact /><button type="button" onClick={reset} className="text-sm font-semibold text-slate-500 hover:text-slate-900">Encerrar treino</button></header>
    <div className="mt-6 flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-blue-700">Questão {currentIndex + 1} de {session.questions.length}</p><p className="mt-1 text-sm text-slate-500">{completed} respondida{completed === 1 ? "" : "s"}</p></div><div className="h-2 w-36 overflow-hidden rounded-full bg-slate-100 sm:w-52"><div className="h-full rounded-full bg-blue-600" style={{ width: `${((currentIndex + 1) / session.questions.length) * 100}%` }} /></div></div>
    <div className="mt-6 flex flex-wrap gap-2" aria-label="Navegação entre questões">{session.questions.map((question, index) => <button key={question.id} type="button" onClick={() => setCurrentIndex(index)} aria-label={`Ir para questão ${index + 1}`} className={`h-8 w-8 rounded-lg text-xs font-bold ${index === currentIndex ? "bg-blue-600 text-white" : answers[question.id] ? "bg-blue-600 text-white" : flagged.includes(question.id) ? "bg-amber-400 text-slate-900" : "bg-slate-100 text-slate-500"}`}>{index + 1}</button>)}</div>
    <article className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-9"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2 text-xs font-bold"><Chip>{currentQuestion.year}.{currentQuestion.semester}</Chip><Chip>{currentQuestion.phase}ª fase</Chip><Chip>{filters.subjects.find((item) => item.id === currentQuestion.subject)?.label ?? currentQuestion.subject}</Chip></div><button type="button" onClick={() => toggle(currentQuestion.id, flagged, setFlagged)} className={`inline-flex items-center gap-1.5 text-xs font-bold ${flagged.includes(currentQuestion.id) ? "text-amber-700" : "text-slate-500 hover:text-slate-900"}`}><Flag size={14} fill={flagged.includes(currentQuestion.id) ? "currentColor" : "none"} /> {flagged.includes(currentQuestion.id) ? "Marcada" : "Marcar para revisar"}</button></div>
      <p className="mt-7 whitespace-pre-line text-base leading-8 text-slate-900 sm:text-lg">{currentQuestion.statement}</p>
      <div className="mt-8 grid gap-3" role="radiogroup" aria-label="Alternativas">{currentQuestion.alternatives.map((alternative) => { const selected = selectedAnswer === alternative.id; const correct = alternative.id === currentQuestion.correctAlternativeId; const style = showFeedback && correct ? "border-blue-600 bg-blue-50" : showFeedback && selected ? "border-rose-400 bg-rose-400/10" : selected ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"; return <button key={alternative.id} type="button" role="radio" aria-checked={selected} onClick={() => answerQuestion(alternative.id)} disabled={isConfirmed} className={`flex min-h-14 items-start gap-4 rounded-xl border p-4 text-left transition disabled:cursor-default ${style}`}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-current text-sm font-black">{alternative.label}</span><span className="pt-0.5 leading-6">{alternative.text}</span>{showFeedback && correct && <Check className="ml-auto shrink-0 text-blue-700" />}{showFeedback && selected && !correct && <X className="ml-auto shrink-0 text-rose-600" />}</button>; })}</div>
      {showFeedback && <div className={`mt-6 rounded-xl border px-4 py-3 text-sm ${selectedAnswer === currentQuestion.correctAlternativeId ? "border-blue-200 bg-blue-50 text-blue-900" : "border-rose-500/40 bg-rose-500/10 text-rose-800"}`}>{selectedAnswer === currentQuestion.correctAlternativeId ? "Resposta correta!" : `Resposta incorreta. A alternativa correta é ${currentQuestion.alternatives.find((alternative) => alternative.id === currentQuestion.correctAlternativeId)?.label ?? "indisponível"}.`}</div>}
      <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-6"><button type="button" onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))} disabled={currentIndex === 0} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"><ChevronLeft size={18} /> Anterior</button><div className="flex gap-3">{mode === "training" && !isConfirmed && <button type="button" onClick={() => setConfirmed((items) => [...items, currentQuestion.id])} disabled={!selectedAnswer} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-extrabold text-white disabled:opacity-40">Confirmar</button>}{currentIndex === session.questions.length - 1 ? <button type="button" onClick={() => setFinished(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-extrabold text-white">Finalizar</button> : <button type="button" onClick={() => setCurrentIndex((index) => index + 1)} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-extrabold text-white">Próxima <ChevronRight size={18} /></button>}</div></div>
    </article></div></main>;
}

type SetupProps = { filters: FilterOptions; editions: string[]; phases: (1 | 2)[]; subjects: string[]; courseGroup: number; quantity: Quantity; mode: Mode; error: string | null; isLoading: boolean; toggle: <T>(value: T, selected: T[], update: (items: T[]) => void) => void; setEditions: (value: string[]) => void; setPhases: (value: (1 | 2)[]) => void; setSubjects: (value: string[]) => void; setCourseGroup: (value: number) => void; setQuantity: (value: Quantity) => void; setMode: (value: Mode) => void; onStart: () => void };
function Setup(props: SetupProps) { const { filters, editions, phases, subjects, courseGroup, quantity, mode, error, isLoading, toggle, setEditions, setPhases, setSubjects, setCourseGroup, setQuantity, setMode, onStart } = props; return <main className="min-h-screen bg-slate-50 text-slate-900"><div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16"><header className="mb-10"><Brand /></header><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/60 sm:p-10"><span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">Pratique com provas anteriores</span><h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Monte seu próximo treino.</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Escolha os filtros e responda questões da UECE com enunciados em texto, para estudar no seu ritmo.</p><div className="mt-10 grid gap-8 border-t border-slate-200 pt-8"><FilterGroup title="Fase" hint="Escolha uma fase ou inclua as duas."><ToggleButton active={phases.length === 0} onClick={() => setPhases([])}>Todas</ToggleButton>{filters.phases.map((phase) => <ToggleButton key={phase} active={phases.includes(phase)} onClick={() => toggle(phase, phases, setPhases)}>{phase}ª fase</ToggleButton>)}</FilterGroup><FilterGroup title="Edição do vestibular" hint="Escolha edições como 2023.1 e 2023.2.">{filters.editions.map((edition) => <ToggleButton key={edition} active={editions.includes(edition)} onClick={() => toggle(edition, editions, setEditions)}>{edition}</ToggleButton>)}</FilterGroup><FilterGroup title="Disciplina" hint="Deixe sem seleção para sortear entre todas.">{filters.subjects.map((subject) => <ToggleButton key={subject.id} active={subjects.includes(subject.id)} onClick={() => toggle(subject.id, subjects, setSubjects)}>{subject.label}</ToggleButton>)}</FilterGroup>{(phases.length === 0 || phases.includes(2)) && <FilterGroup title="Grupo de cursos da 2ª fase" hint="Define as três provas de 20 questões do simulado completo.">{filters.courseGroups.map((group) => <ToggleButton key={group.id} active={courseGroup === group.id} onClick={() => setCourseGroup(group.id)}>{group.label}</ToggleButton>)}</FilterGroup>}<FilterGroup title="Quantidade de questões">{quantities.map((item) => <ToggleButton key={item.value} active={quantity === item.value} onClick={() => setQuantity(item.value)}>{item.label}</ToggleButton>)}</FilterGroup><fieldset><legend className="text-sm font-bold text-slate-900">Modo de estudo</legend><div className="mt-3 grid gap-3 sm:grid-cols-2"><ModeOption active={mode === "training"} onClick={() => setMode("training")} title="Treino" description="Veja o gabarito após confirmar cada resposta." /><ModeOption active={mode === "simulation"} onClick={() => setMode("simulation")} title="Simulado" description="Veja o resultado apenas ao encerrar." /></div></fieldset></div>{error && <p role="alert" className="mt-6 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-800">{error}</p>}<button type="button" onClick={onStart} disabled={isLoading} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60 sm:w-auto">{isLoading ? "Montando treino..." : "Começar a responder"} <ChevronRight size={19} /></button></section></div></main>; }
function Brand({ compact = false }: { compact?: boolean }) { return <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white"><GraduationCap size={compact ? 20 : 25} /></div><div><p className="text-lg font-extrabold tracking-tight">Gabarita UECE</p>{!compact && <p className="text-sm text-slate-500">Banco de questões</p>}</div></div>; }
function Chip({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">{children}</span>; }
function FilterGroup({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) { return <fieldset><legend className="text-sm font-bold text-slate-900">{title}</legend>{hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}<div className="mt-3 flex flex-wrap gap-2">{children}</div></fieldset>; }
function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{children}</button>; }
function ModeOption({ active, onClick, title, description }: { active: boolean; onClick: () => void; title: string; description: string }) { return <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-xl border p-4 text-left transition ${active ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}><span className="block font-bold text-slate-900">{title}</span><span className="mt-1 block text-sm leading-5 text-slate-500">{description}</span></button>; }
function Results({ questions, correct, unanswered, onReset }: { questions: PracticeQuestion[]; correct: number; unanswered: number; onReset: () => void }) { const percentage = Math.round((correct / questions.length) * 100); return <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6"><section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-7 text-center sm:p-10"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-white"><Check size={30} /></div><p className="mt-6 text-sm font-bold uppercase tracking-wider text-blue-700">Treino concluído</p><h1 className="mt-2 text-4xl font-black text-slate-900">{percentage}% de acertos</h1><p className="mt-3 text-slate-600">Você acertou {correct} de {questions.length} questões.</p><div className="mt-8 grid grid-cols-3 gap-3 text-left"><Stat label="Acertos" value={correct} color="text-blue-700" /><Stat label="Erros" value={questions.length - correct - unanswered} color="text-rose-600" /><Stat label="Em branco" value={unanswered} color="text-amber-700" /></div><button type="button" onClick={onReset} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-extrabold text-white"><RotateCcw size={18} /> Montar novo treino</button></section></main>; }
function Stat({ label, value, color }: { label: string; value: number; color: string }) { return <div className="rounded-xl bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-2 text-2xl font-black ${color}`}>{value}</p></div>; }
