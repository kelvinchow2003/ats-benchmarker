import { NextRequest, NextResponse } from "next/server";
import { runSectionScoringEngine } from "@/lib/engines/section-scoring";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobDescription } = body as {
      resumeText: string;
      jobDescription: string;
    };

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Missing resumeText or jobDescription" },
        { status: 400 }
      );
    }

    const result = await runSectionScoringEngine(resumeText, jobDescription);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Section scoring engine error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Section scoring failed" },
      { status: 500 }
    );
  }
}
