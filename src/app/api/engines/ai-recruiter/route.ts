import { NextRequest, NextResponse } from "next/server";
import { runAIRecruiterEngine } from "@/lib/engines/ai-recruiter";
import type { EngineRequest } from "@/types/evaluation";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EngineRequest;

    if (!body.resumeText || !body.jobDescription) {
      return NextResponse.json(
        { error: "resumeText and jobDescription are required" },
        { status: 400 }
      );
    }

    const result = await runAIRecruiterEngine(
      body.resumeText,
      body.jobDescription
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Recruiter engine error:", error);
    return NextResponse.json(
      { error: "AI Recruiter engine failed" },
      { status: 500 }
    );
  }
}
