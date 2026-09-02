import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "Gabarita-UECE",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    features: {
      acervo: "active",
      iaAssistant: "active",
      database: "configured",
    },
  });
}
