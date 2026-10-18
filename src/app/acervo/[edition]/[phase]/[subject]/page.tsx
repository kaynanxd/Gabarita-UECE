import Link from "next/link";
import { ChevronLeft, GraduationCap } from "lucide-react";
import { notFound } from "next/navigation";
import { ArchiveQuestionViewer } from "@/components/ArchiveQuestionViewer";
import { getArchiveSubject } from "@/lib/question-bank";

export default async function ArchiveSubjectPage({ params }: { params: Promise<{ edition: string; phase: string; subject: string }> }) {
  const { edition, phase: phaseValue, subject } = await params;
  const archiveSubject = getArchiveSubject(edition, Number(phaseValue), subject);
  if (!archiveSubject) notFound();

  return <main className="min-h-screen bg-slate-50 text-slate-900"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6"><Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white"><GraduationCap size={22} /></span><span className="font-extrabold">Gabarita UECE</span></Link><Link href="/acervo" className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-blue-700"><ChevronLeft size={18} /> Acervo</Link></div></header><section className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><p className="text-sm font-bold text-blue-700">UECE {archiveSubject.edition} · {archiveSubject.phase}ª fase</p><h1 className="mt-2 text-3xl font-black">{archiveSubject.subject.label}</h1><p className="mt-2 text-slate-600">{archiveSubject.questions.length} questões disponíveis. Selecione uma alternativa para conferir a resposta ou revele o gabarito diretamente.</p><div className="mt-8"><ArchiveQuestionViewer questions={archiveSubject.questions} /></div></section></main>;
}
