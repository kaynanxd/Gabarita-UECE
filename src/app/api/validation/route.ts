import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, studyRoutine, biggestDifficulty, willingToInterview } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e e-mail são obrigatórios para registrar sua participação." },
        { status: 400 }
      );
    }

    // Grava no banco de dados PostgreSQL via Prisma
    const lead = await prisma.validationLead.create({
      data: {
        name,
        email,
        phone: phone || null,
        studyRoutine: studyRoutine || null,
        biggestDifficulty: biggestDifficulty || null,
        willingToInterview: Boolean(willingToInterview),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Obrigado por colaborar com a pesquisa do Gabarita UECE!",
        leadId: lead.id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Erro ao salvar participação na validação:", error);
    return NextResponse.json(
      {
        error: "Falha temporária ao registrar no banco de dados. Verifique a conexão com o PostgreSQL.",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await prisma.validationLead.count();
    return NextResponse.json({
      success: true,
      totalResponses: count,
    });
  } catch {
    return NextResponse.json({
      success: false,
      totalResponses: 0,
      note: "Banco de dados aguardando conexão em produção.",
    });
  }
}
