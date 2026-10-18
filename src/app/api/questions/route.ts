import { NextRequest, NextResponse } from "next/server";
import { findPracticeQuestions, parseCourseGroup, parseEditions, parseList, parsePhases } from "@/lib/question-bank";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const requestedQuantity = searchParams.get("quantity");
  const parsedQuantity = Number(requestedQuantity);
  const quantity = requestedQuantity === "all" ? "all" : Number.isInteger(parsedQuantity) ? parsedQuantity : 10;
  const result = findPracticeQuestions({
    editions: parseEditions(searchParams.get("editions")),
    phases: parsePhases(searchParams.get("phases")),
    subjects: parseList(searchParams.get("subjects")),
    courseGroup: parseCourseGroup(searchParams.get("courseGroup")),
    quantity,
  });

  return NextResponse.json(result);
}
