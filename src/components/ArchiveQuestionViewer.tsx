"use client";

import { useState } from "react";
import { Check, Eye, X } from "lucide-react";
import type { PracticeQuestion } from "@/lib/question-bank";

export function ArchiveQuestionViewer({ questions }: { questions: PracticeQuestion[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<string[]>([]);
  const question = questions[currentIndex];
  const selectedAnswer = selected[question.id];
  const isRevealed = revealed.includes(question.id);
  const correctAlternative = question.alternatives.find((alternative) => alternative.id === question.correctAlternativeId);

  function reveal() {
    setRevealed((items) => items.includes(question.id) ? items : [...items, question.id]);
  }

  return <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
    <aside className="rounded-2xl border border-slate-200 bg-white p-4"><p className="px-2 pb-3 text-sm font-bold text-slate-700">Questões ({questions.length})</p><div className="grid grid-cols-5 gap-2 lg:grid-cols-4">{questions.map((item, index) => <button key={item.id} type="button" onClick={() => setCurrentIndex(index)} className={`rounded-lg px-2 py-2 text-sm font-bold transition ${index === currentIndex ? "bg-blue-600 text-white" : selected[item.id] ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`} aria-label={`Abrir questão ${item.number}`}>{item.number}</button>)}</div></aside>
    <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><div className="flex items-center justify-between gap-4"><span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-800">Questão {question.number}</span><span className="text-sm text-slate-500">{currentIndex + 1} de {questions.length}</span></div><p className="mt-6 whitespace-pre-line text-base leading-8 text-slate-900 sm:text-lg">{question.statement}</p><div className="mt-8 grid gap-3" role="radiogroup" aria-label="Alternativas">{question.alternatives.map((alternative) => { const isSelected = selectedAnswer === alternative.id; const isCorrect = alternative.id === question.correctAlternativeId; const style = isRevealed && isCorrect ? "border-blue-600 bg-blue-50" : isRevealed && isSelected ? "border-rose-400 bg-rose-50" : isSelected ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"; return <button key={alternative.id} type="button" role="radio" aria-checked={isSelected} onClick={() => !isRevealed && setSelected((answers) => ({ ...answers, [question.id]: alternative.id }))} disabled={isRevealed} className={`flex items-start gap-4 rounded-xl border p-4 text-left transition disabled:cursor-default ${style}`}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-current text-sm font-black">{alternative.label}</span><span className="pt-0.5 leading-6">{alternative.text}</span>{isRevealed && isCorrect && <Check className="ml-auto shrink-0 text-blue-700" />}{isRevealed && isSelected && !isCorrect && <X className="ml-auto shrink-0 text-rose-600" />}</button>; })}</div>
      {isRevealed && <p className={`mt-6 rounded-xl border px-4 py-3 text-sm ${selectedAnswer === question.correctAlternativeId ? "border-blue-200 bg-blue-50 text-blue-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{selectedAnswer ? selectedAnswer === question.correctAlternativeId ? "Resposta correta." : `Resposta incorreta. A correta é a alternativa ${correctAlternative?.label ?? "indisponível"}.` : `A resposta correta é a alternativa ${correctAlternative?.label ?? "indisponível"}.`}</p>}
      <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-6">{!isRevealed && <><button type="button" onClick={reveal} disabled={!selectedAnswer} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40">Conferir resposta</button><button type="button" onClick={reveal} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><Eye size={17} /> Ver gabarito</button></>}<button type="button" onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))} disabled={currentIndex === 0} className="ml-auto rounded-lg px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40">Anterior</button><button type="button" onClick={() => setCurrentIndex((index) => Math.min(index + 1, questions.length - 1))} disabled={currentIndex === questions.length - 1} className="rounded-lg px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40">Próxima</button></div>
    </article>
  </div>;
}
