import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gabarita UECE — Plataforma de Apoio ao Vestibulando",
  description:
    "Hub completo e gratuito para o vestibular da Universidade Estadual do Ceará (UECE). Provas anteriores, banco de questões comentadas e assistente de IA focado no edital e critérios da banca.",
  keywords: [
    "Vestibular UECE",
    "UECE 2025",
    "UECE 2026",
    "Gabarita UECE",
    "Provas UECE",
    "Redação UECE",
    "Vestibular Ceará",
    "Extensão Universitária",
  ],
  authors: [{ name: "Projeto de Extensão 4 — Gabarita UECE" }],
  openGraph: {
    title: "Gabarita UECE — O Guia Definitivo para sua Aprovação",
    description:
      "Preparação inteligente, gratuita e direcionada para a 1ª e 2ª fase do Vestibular da UECE.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
        {children}
      </body>
    </html>
  );
}
