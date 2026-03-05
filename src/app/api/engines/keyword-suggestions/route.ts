import { NextRequest, NextResponse } from "next/server";
import { runKeywordSuggestionsEngine } from "@/lib/engines/keyword-suggestions";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobDescription, missingKeywords } = body as {
      resumeText: string;
      jobDescription: string;
      missingKeywords: string[];
    };

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Missing resumeText or jobDescription" },
        { status: 400 }
      );
    }

    const result = await runKeywordSuggestionsEngine(
      resumeText,
      jobDescription,
      missingKeywords ?? []
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Keyword suggestions engine error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Keyword suggestions failed" },
      { status: 500 }
    );
  }
}
