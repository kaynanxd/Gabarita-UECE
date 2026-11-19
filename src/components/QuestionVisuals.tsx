"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import type { PracticeQuestion } from "@/lib/question-bank";

export function QuestionVisuals({
  question,
  part = "all",
}: {
  question: PracticeQuestion;
  part?: "shared" | "figures" | "all";
}) {
  const [showShared, setShowShared] = useState(true);
  const includeShared = part === "all" || part === "shared";
  const includeFigures = part === "all" || part === "figures";
  const hasSharedTexts = includeShared && (question.sharedTexts?.length ?? 0) > 0;
  const hasShared = includeShared && !hasSharedTexts && question.sharedAssets?.length > 0;
  const hasFigures = includeFigures && question.figureAssets?.length > 0;
  const hasCrops = includeFigures && question.cropAssets?.length > 0;

  if (!hasSharedTexts && !hasShared && !hasFigures && !hasCrops) return null;

  return (
    <div className="mt-5 space-y-4">
      {hasSharedTexts && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setShowShared((prev) => !prev)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <span className="inline-flex items-center gap-2">
              <BookOpen size={16} className="text-blue-600" />
              {question.sharedTexts.length === 1
                ? `Texto de apoio — ${question.sharedTexts[0].label}${question.sharedTexts[0].title ? `: ${question.sharedTexts[0].title}` : ""}`
                : `Textos de apoio (${question.sharedTexts.length})`}
            </span>
            {showShared ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showShared && (
            <div className="max-h-[28rem] space-y-6 overflow-y-auto border-t border-slate-200 bg-white p-5">
              {question.sharedTexts.map((textBlock) => (
                <div key={textBlock.id} className="space-y-3">
                  {(question.sharedTexts.length > 1 || textBlock.title) && (
                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-blue-600">
                        {textBlock.label}
                      </span>
                      {textBlock.title && (
                        <h4 className="mt-0.5 text-base font-bold text-slate-900">
                          {textBlock.title}
                        </h4>
                      )}
                    </div>
                  )}
                  <div className="space-y-1 text-sm leading-relaxed text-slate-800">
                    {textBlock.lines.map((line, idx) => (
                      <div key={idx} className="flex items-baseline gap-3">
                        <span className="w-7 shrink-0 select-none text-right font-mono text-xs tabular-nums text-slate-400">
                          {line.number ?? ""}
                        </span>
                        <span className="flex-1 whitespace-pre-wrap">{line.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {hasShared && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setShowShared((prev) => !prev)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <span className="inline-flex items-center gap-2">
              <BookOpen size={16} className="text-blue-600" />
              Texto de apoio da prova ({question.sharedAssets.length} {question.sharedAssets.length === 1 ? "parte" : "partes"})
            </span>
            {showShared ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showShared && (
            <div className="grid gap-3 border-t border-slate-200 bg-white p-4 sm:grid-cols-2">
              {question.sharedAssets.map((asset, index) => (
                <img
                  key={asset.url}
                  src={asset.url}
                  alt={`Texto de apoio ${index + 1} da questão ${question.number}`}
                  loading="lazy"
                  className="w-full rounded-lg border border-slate-200 bg-white object-contain"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {hasFigures && (
        <div className="space-y-3">
          {question.figureAssets.map((asset, index) => (
            <figure
              key={asset.url}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3"
            >
              <img
                src={asset.url}
                alt={`Figura ${index + 1} da questão ${question.number}`}
                loading="lazy"
                className="mx-auto max-h-[32rem] w-auto rounded-lg object-contain"
              />
            </figure>
          ))}
        </div>
      )}

      {hasCrops && (
        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-800">
            <ImageIcon size={15} />
            Recorte visual da questão (alternativas com figuras/fórmulas)
          </p>
          <div className="space-y-3">
            {question.cropAssets.map((asset, index) => (
              <img
                key={asset.url}
                src={asset.url}
                alt={`Recorte visual ${index + 1} da questão ${question.number}`}
                loading="lazy"
                className="mx-auto w-full max-w-xl rounded-xl border border-amber-200 bg-white object-contain"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
