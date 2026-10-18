"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, MessageSquare } from "lucide-react";

export function ValidationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    studyRoutine: "Autodidata / Internet",
    biggestDifficulty: "Redação com critérios da UECE",
    willingToInterview: true,
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao registrar suas respostas.");
      }

      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Ocorreu um erro ao enviar suas respostas."
      );
    }
  };

  if (status === "success") {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-emerald-500/30 text-center max-w-xl mx-auto space-y-4 glow-emerald">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h3 className="text-2xl font-bold text-white">Contribuição Registrada com Sucesso!</h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          Sua resposta foi salva no nosso banco de dados. Sua experiência como vestibulando é a base para construirmos a melhor plataforma gratuita para a UECE.
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setFormData({
              name: "",
              email: "",
              phone: "",
              studyRoutine: "Autodidata / Internet",
              biggestDifficulty: "Redação com critérios da UECE",
              willingToInterview: true,
            });
          }}
          className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 transition-colors"
        >
          Enviar outra resposta
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 text-left max-w-2xl mx-auto space-y-6 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-2 border-b border-slate-800/80 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
          <MessageSquare className="w-3.5 h-3.5" />
          Escuta Inicial • Projeto de Extensão
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white">
          Participe da Construção do Gabarita UECE
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm">
          Leva menos de 1 minuto. Suas respostas definem quais ferramentas serão desenvolvidas primeiro.
        </p>
      </div>

      {status === "error" && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Aviso de envio</p>
            <p className="text-xs text-rose-400">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            Seu Nome <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Ana Clara"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            Seu E-mail <span className="text-emerald-400">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="Ex: vestibulando@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">
          WhatsApp / Telefone (Opcional)
        </label>
        <input
          type="tel"
          placeholder="(85) 99999-9999"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">
          Como você estuda atualmente para a UECE?
        </label>
        <select
          value={formData.studyRoutine}
          onChange={(e) => setFormData({ ...formData, studyRoutine: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
        >
          <option value="Autodidata / Internet">Autodidata / Buscando na internet</option>
          <option value="Cursinho Pré-Vestibular Presencial">Cursinho Pré-Vestibular Presencial</option>
          <option value="Cursinho Pré-Vestibular Online">Cursinho Pré-Vestibular Online</option>
          <option value="Ensino Médio em Escola Pública">Ensino Médio em Escola Pública</option>
          <option value="Ensino Médio em Escola Particular">Ensino Médio em Escola Particular</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">
          O que você considera mais difícil na sua preparação para a UECE?
        </label>
        <select
          value={formData.biggestDifficulty}
          onChange={(e) => setFormData({ ...formData, biggestDifficulty: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
        >
          <option value="Redação com critérios da UECE">
            Praticar Redação e receber correção rápida nos critérios da UECE
          </option>
          <option value="Encontrar provas anteriores organizadas">
            Encontrar provas anteriores, gabaritos e resoluções organizadas
          </option>
          <option value="Preparação específica para a 2ª Fase">
            Preparação para a 2ª Fase (questões discursivas/específicas)
          </option>
          <option value="Saber os conteúdos mais recorrentes">
            Saber quais conteúdos mais caem e como são cobrados pela banca
          </option>
          <option value="Falta de questões inéditas no perfil da UECE">
            Falta de questões no estilo de 4 alternativas da banca CEV-UECE
          </option>
        </select>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          id="willingToInterview"
          checked={formData.willingToInterview}
          onChange={(e) =>
            setFormData({ ...formData, willingToInterview: e.target.checked })
          }
          className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-900 cursor-pointer"
        />
        <label htmlFor="willingToInterview" className="text-xs text-slate-300 cursor-pointer">
          Topo bater um papo rápido online (10 min) para relatar minha experiência e dificuldades.
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Gravando no banco de dados...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Enviar Minha Opinião e Apoiar o Projeto
          </>
        )}
      </button>

      <p className="text-[11px] text-center text-slate-500">
        Iniciativa sem fins lucrativos • Projeto de Extensão Universitária • Seus dados estão seguros
      </p>
    </form>
  );
}
