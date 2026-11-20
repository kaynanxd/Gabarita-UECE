"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, ClipboardList, ExternalLink, GraduationCap, HelpCircle, Layers, Search, X } from "lucide-react";

type SpecificGroup = {
  id: number;
  subjects: string[];
  areas: string;
  courses: string[];
};

const specificGroups: SpecificGroup[] = [
  {
    id: 1,
    subjects: ["Biologia", "Física", "Química"],
    areas: "Ciências da Saúde e Biológicas",
    courses: ["Medicina", "Enfermagem", "Nutrição", "Medicina Veterinária", "Ciências Biológicas", "Educação Física", "Terapia Ocupacional"],
  },
  {
    id: 2,
    subjects: ["Matemática", "Física", "Química"],
    areas: "Ciências Exatas e Tecnologia",
    courses: ["Ciência da Computação", "Física", "Química", "Matemática"],
  },
  {
    id: 3,
    subjects: ["Matemática", "Geografia", "História"],
    areas: "Negócios e Gestão",
    courses: ["Administração", "Ciências Contábeis", "Economia"],
  },
  {
    id: 4,
    subjects: ["Português", "Geografia", "História"],
    areas: "Humanidades e Educação",
    courses: ["Geografia", "História", "Pedagogia", "Serviço Social"],
  },
  {
    id: 5,
    subjects: ["Inglês", "Geografia", "História"],
    areas: "Letras — Língua Inglesa",
    courses: ["Letras (Inglês)"],
  },
  {
    id: 6,
    subjects: ["Francês", "Geografia", "História"],
    areas: "Letras — Língua Francesa",
    courses: ["Letras (Francês)"],
  },
  {
    id: 7,
    subjects: ["Espanhol", "Geografia", "História"],
    areas: "Letras — Língua Espanhola",
    courses: ["Letras (Espanhol)"],
  },
  {
    id: 8,
    subjects: ["Português", "Filosofia", "Sociologia"],
    areas: "Letras, Filosofia, Sociais e Psicologia",
    courses: ["Psicologia", "Ciências Sociais", "Filosofia", "Letras (Português)", "Música", "Artes Visuais"],
  },
];

export function VestibularGuideModal() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"overview" | "courses" | "info">("overview");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredGroups = normalizedQuery
    ? specificGroups.filter((group) => {
        const haystack = [group.areas, ...group.subjects, ...group.courses].join(" ").toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : specificGroups;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
      >
        <HelpCircle size={17} className="text-blue-600" />
        Como funciona o vestibular da UECE?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="uece-guide-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                  Guia rápido · CEV/UECE
                </span>
                <h2 id="uece-guide-title" className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  Como funciona o vestibular da UECE
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar explicação"
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-100 pb-4">
              <button
                type="button"
                onClick={() => setTab("overview")}
                className={`rounded-xl px-3.5 py-2 text-sm font-bold transition ${
                  tab === "overview" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Visão geral
              </button>
              <button
                type="button"
                onClick={() => setTab("courses")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition ${
                  tab === "courses" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <GraduationCap size={16} />
                Específicas por curso
              </button>
              <button
                type="button"
                onClick={() => setTab("info")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition ${
                  tab === "info" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <ClipboardList size={16} />
                Inscrição e datas
              </button>
            </div>

            {tab === "overview" && (
              <div className="mt-5 space-y-5 text-sm leading-6 text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                    <Layers size={18} className="text-blue-600" />
                    1ª Fase — Conhecimentos Gerais
                  </h3>
                  <p className="mt-2">
                    Prova objetiva única de caráter classificatório e eliminatório, com questões de múltipla escolha de{" "}
                    <strong className="text-slate-900">4 alternativas (A, B, C e D)</strong>.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-1 shrink-0 text-blue-600" />
                      <span>
                        <strong>85 questões</strong> nas edições mais recentes (60 a 70 nas mais antigas).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-1 shrink-0 text-blue-600" />
                      <span>
                        Cobra Português, Língua Estrangeira (Inglês, Espanhol ou Francês), Geografia, História, Filosofia,
                        Sociologia, Matemática, Física, Química, Biologia e Educação Física.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
                  <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                    <CalendarDays size={18} className="text-blue-600" />
                    2ª Fase — Conhecimentos Específicos e Redação
                  </h3>
                  <p className="mt-2">
                    Aplicada em <strong className="text-slate-900">2 dias consecutivos</strong>, com foco nas 3
                    disciplinas do grupo do curso escolhido:
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-blue-100 bg-white p-3.5">
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-700">1º Dia</p>
                      <p className="mt-1 font-bold text-slate-900">Redação + 1ª Específica</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Prova de Redação + 20 questões objetivas da primeira disciplina específica do seu grupo.
                      </p>
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-white p-3.5">
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-700">2º Dia</p>
                      <p className="mt-1 font-bold text-slate-900">2ª e 3ª Específicas (40 questões)</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        20 questões de cada uma das outras duas disciplinas específicas do grupo do seu curso.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <BookOpen size={17} className="text-blue-600" />
                    Dica para treinar no Gabarita UECE
                  </h3>
                  <p className="mt-1.5">
                    Na aba{" "}
                    <button
                      type="button"
                      onClick={() => setTab("courses")}
                      className="font-bold text-blue-700 hover:underline"
                    >
                      Específicas por curso
                    </button>{" "}
                    você pode consultar as 3 disciplinas de cada grupo da 2ª fase antes de montar seu simulado.
                  </p>
                </div>
              </div>
            )}

            {tab === "courses" && (
              <div className="mt-5 space-y-4">
                <div className="relative">
                  <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar curso ou disciplina (ex.: Medicina, Computação, Biologia...)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-3">
                  {filteredGroups.length === 0 ? (
                    <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                      Nenhum grupo encontrado para &ldquo;{query}&rdquo;.
                    </p>
                  ) : (
                    filteredGroups.map((group) => (
                      <div key={group.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
                              Grupo {group.id} · {group.areas}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {group.subjects.map((subject) => (
                              <span
                                key={subject}
                                className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="mt-2.5 text-xs leading-5 text-slate-600">
                          <strong className="text-slate-800">Exemplos de cursos:</strong> {group.courses.join(", ")}.
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <p className="text-xs leading-5 text-slate-500">
                  * Os grupos seguem a estrutura usada nos simulados da plataforma. Sempre confira a tabela oficial do
                  edital vigente da CEV/UECE para o seu curso e campus.
                </p>
              </div>
            )}

            {tab === "info" && (
              <div className="mt-5 space-y-5 text-sm leading-6 text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                    <ClipboardList size={18} className="text-blue-600" />
                    Como fazer a inscrição
                  </h3>
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
                    <li>
                      Acesse o portal oficial da <strong>CEV/UECE</strong> e leia o edital da edição aberta (vagas,
                      modalidades de concorrência/cotas e regras).
                    </li>
                    <li>
                      Caso se enquadre nos critérios do edital, solicite a <strong>isenção ou redução da taxa</strong>{" "}
                      no prazo específico (que normalmente abre antes das inscrições regulares).
                    </li>
                    <li>
                      Preencha o formulário online com seus dados (CPF, documento oficial), escolha{" "}
                      <strong>curso/campus</strong>, <strong>língua estrangeira</strong> (Inglês, Espanhol ou Francês)
                      e modalidade de vaga.
                    </li>
                    <li>
                      Finalize gerando e pagando o boleto (DAE) dentro do vencimento para confirmar a inscrição.
                    </li>
                  </ol>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
                  <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                    <CalendarDays size={18} className="text-blue-600" />
                    Ciclo do calendário e etapas
                  </h3>
                  <p className="mt-2">
                    A UECE realiza <strong className="text-slate-900">dois vestibulares por ano</strong> (1º e 2º
                    semestres), seguindo esta sequência de etapas definida em cada edital:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-1 shrink-0 text-blue-600" />
                      <span>Publicação do Edital → Pedidos de Isenção → Período de Inscrições.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-1 shrink-0 text-blue-600" />
                      <span>Divulgação do Cartão de Informação (local e sala de prova) → 1ª Fase.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-1 shrink-0 text-blue-600" />
                      <span>Resultado da 1ª Fase → 2ª Fase (2 dias seguidos) → Resultado Final e Matrícula.</span>
                    </li>
                  </ul>
                  <a
                    href="https://www.cev.uece.br/"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-blue-700 shadow-xs ring-1 ring-blue-200 transition hover:bg-blue-50"
                  >
                    Consultar edital e cronograma oficial na CEV/UECE
                    <ExternalLink size={14} />
                  </a>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-extrabold text-slate-900">No dia da prova</h3>
                  <p className="mt-1.5">
                    Leve documento oficial original com foto e caneta esferográfica de corpo transparente (tinta preta ou
                    azul). Confira o horário de fechamento dos portões no seu Cartão de Informação para evitar atrasos.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Fechar
              </button>
              <Link
                href="/praticar"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-blue-700"
              >
                Montar meu treino <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
