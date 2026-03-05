import { NextRequest, NextResponse } from "next/server";
import { runSuggestionsEngine } from "@/lib/engines/suggestions";
import type { LegacyResult, SemanticResult, AIRecruiterResult } from "@/types/evaluation";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      resumeText,
      jobDescription,
      legacyResult,
      semanticResult,
      aiRecruiterResult,
    } = body as {
      resumeText: string;
      jobDescription: string;
      legacyResult: LegacyResult;
      semanticResult: SemanticResult;
      aiRecruiterResult: AIRecruiterResult;
    };

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Missing resumeText or jobDescription" },
        { status: 400 }
      );
    }

    const result = await runSuggestionsEngine(
      resumeText,
      jobDescription,
      legacyResult,
      semanticResult,
      aiRecruiterResult
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Suggestions engine error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Suggestions engine failed" },
      { status: 500 }
    );
  }
}
