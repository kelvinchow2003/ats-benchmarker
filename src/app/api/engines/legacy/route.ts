import { NextRequest, NextResponse } from "next/server";
import { runLegacyEngine } from "@/lib/engines/legacy";
import type { EngineRequest } from "@/types/evaluation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EngineRequest;

    if (!body.resumeText || !body.jobDescription) {
      return NextResponse.json(
        { error: "resumeText and jobDescription are required" },
        { status: 400 }
      );
    }

    const result = runLegacyEngine(body.resumeText, body.jobDescription);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Legacy engine error:", error);
    return NextResponse.json(
      { error: "Legacy engine failed" },
      { status: 500 }
    );
  }
}
