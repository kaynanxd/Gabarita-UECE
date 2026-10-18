import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gabarita UECE — Banco de Questões",
  description: "Pratique com questões de vestibulares anteriores da UECE.",
  keywords: ["Vestibular UECE", "Banco de questões UECE", "Gabarita UECE", "Provas UECE", "Vestibular Ceará"],
  authors: [{ name: "Gabarita UECE" }],
  openGraph: {
    title: "Gabarita UECE — Banco de Questões",
    description: "Pratique com questões de vestibulares anteriores da UECE.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className="scroll-smooth"><body>{children}</body></html>;
}
