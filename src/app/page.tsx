import { ValidationForm } from "@/components/ValidationForm";
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  CheckCircle,
  FileText,
  BrainCircuit,
  Award,
  Layers,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Cpu,
  PenTool,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-[600px] -left-40 w-[500px] h-[500px] bg-blue-500/10 blur-[140px] rounded-full" />
        <div className="absolute top-[1200px] -right-40 w-[500px] h-[500px] bg-teal-500/10 blur-[140px] rounded-full" />
      </div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                Gabarita <span className="gradient-text-emerald">UECE</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium ml-1">
                Extensão Universitária
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#proposta" className="hover:text-emerald-400 transition-colors">
              O Projeto
            </a>
            <a href="#acervo" className="hover:text-emerald-400 transition-colors">
              Acervo de Provas
            </a>
            <a href="#ia" className="hover:text-emerald-400 transition-colors">
              Assistente de IA
            </a>
            <a href="#validacao" className="hover:text-emerald-400 transition-colors text-emerald-400 font-semibold">
              Pesquisa de Escuta
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#validacao"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold transition-all transform active:scale-95 shadow-md shadow-emerald-500/20"
            >
              Participar da Pesquisa
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          Plataforma de Apoio ao Vestibulando • 100% Gratuita e Aberta
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
          Sua preparação para a{" "}
          <span className="gradient-text-uece">UECE</span> no mais alto nível.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Reunimos provas anteriores, resoluções comentadas e uma Inteligência Artificial
          especializada no edital e nos critérios de correção da banca da Universidade Estadual do Ceará.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#validacao"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base transition-all transform hover:-translate-y-0.5 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            Quero Contribuir com a Pesquisa
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#modulos"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-700/60 transition-colors flex items-center justify-center gap-2"
          >
            Conhecer os Recursos
          </a>
        </div>

        {/* Highlight Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">1ª e 2ª</span>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Fases completas da UECE</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-2xl sm:text-3xl font-black text-teal-400">4 Opções</span>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Padrão exato da banca CEV</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-2xl sm:text-3xl font-black text-cyan-400">IA Treinada</span>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Gêneros textuais da UECE</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-2xl sm:text-3xl font-black text-indigo-400">0 Custos</span>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Extensão universitária aberta</p>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modulos" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
            A Arquitetura da Solução
          </h2>
          <p className="text-3xl sm:text-4xl font-black text-white">
            Dois pilares desenhados para otimizar o seu tempo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Module 1: Acervo de Estudos */}
          <div id="acervo" className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Módulo 1</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  Acervo de Estudos Curado
                </h3>
                <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
                  Chega de caçar PDFs espalhados pela web. Um repositório centralizado, catalogado por ano, semestre e disciplina.
                </p>
              </div>

              <ul className="space-y-3.5 pt-2">
                {[
                  "Provas anteriores oficiais da UECE com gabaritos homologados",
                  "Questões categorizadas por disciplina, peso e recorrência",
                  "Resoluções e explicações detalhadas passo a passo",
                  "Estatísticas de incidência temática das últimas edições",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Organizado para 1ª Fase e Específicas da 2ª</span>
              <span className="text-blue-400 font-semibold">Módulo em estruturação</span>
            </div>
          </div>

          {/* Module 2: Assistente de IA */}
          <div id="ia" className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <BrainCircuit className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Módulo 2</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  Assistente de IA Especializado
                </h3>
                <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
                  Uma inteligência artificial parametrizada rigorosamente no edital da UECE para treino ativo e feedback imediato.
                </p>
              </div>

              <ul className="space-y-3.5 pt-2">
                {[
                  "Geração de questões inéditas no formato clássico de 4 itens (A, B, C, D)",
                  "Tira-dúvidas interativo e contextualizado com a bibliografia indicada",
                  "Treinamento de Redação com foco nos gêneros da UECE (Crônica, Artigo, etc.)",
                  "Análise com base nos critérios oficiais da banca corretora",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                    <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>IA focada exclusivamente no edital UECE</span>
              <span className="text-emerald-400 font-semibold">Modelagem em andamento</span>
            </div>
          </div>
        </div>
      </section>

      {/* Validation Survey Section */}
      <section id="validacao" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="mb-10">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            Etapa de Validação • Escuta Ativa
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-4">
            Construindo a solução a partir de necessidades reais
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
            Antes de finalizar cada ferramenta, queremos ouvir vestibulandos de todas as regiões para entender onde o calo aperta na rotina de estudos para a UECE.
          </p>
        </div>

        <ValidationForm />
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-slate-300">Gabarita UECE</span>
            <span>— Projeto de Extensão 4</span>
          </div>

          <p className="text-center sm:text-right">
            Desenvolvido com Next.js, TypeScript, TailwindCSS e PostgreSQL. Hospedado na Vercel.
          </p>
        </div>
      </footer>
    </div>
  );
}
