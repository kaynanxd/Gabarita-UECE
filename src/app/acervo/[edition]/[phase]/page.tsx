import Link from "next/link";
import { ChevronLeft, GraduationCap } from "lucide-react";
import { notFound } from "next/navigation";
import { ArchiveQuestionViewer } from "@/components/ArchiveQuestionViewer";
import { getArchivePhase } from "@/lib/question-bank";

export default async function ArchivePhasePage({ params }: { params: Promise<{ edition: string; phase: string }> }) {
  const { edition, phase: phaseValue } = await params;
  const archivePhase = getArchivePhase(edition, Number(phaseValue));
  if (!archivePhase) notFound();

  return <main className="min-h-screen bg-slate-50 text-slate-900"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6"><Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white"><GraduationCap size={22} /></span><span className="font-extrabold">Gabarita UECE</span></Link><Link href="/acervo" className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-blue-700"><ChevronLeft size={18} /> Acervo</Link></div></header><section className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><p className="text-sm font-bold text-blue-700">UECE {archivePhase.edition}</p><h1 className="mt-2 text-3xl font-black">{archivePhase.phase}ª fase — todas as questões</h1><p className="mt-2 text-slate-600">{archivePhase.questions.length} questões disponíveis nesta fase. Você pode responder ou revelar o gabarito de cada item.</p><div className="mt-8"><ArchiveQuestionViewer questions={archivePhase.questions} /></div></section></main>;
}
