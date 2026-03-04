import { NextRequest, NextResponse } from "next/server";
import { runSemanticEngine } from "@/lib/engines/semantic";
import type { EngineRequest } from "@/types/evaluation";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EngineRequest;

    if (!body.resumeText || !body.jobDescription) {
      return NextResponse.json(
        { error: "resumeText and jobDescription are required" },
        { status: 400 }
      );
    }

    const result = await runSemanticEngine(
      body.resumeText,
      body.jobDescription
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Semantic engine error:", error);
    return NextResponse.json(
      { error: "Semantic engine failed" },
      { status: 500 }
    );
  }
}
