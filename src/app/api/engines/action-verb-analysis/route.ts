import { NextResponse } from "next/server";
import { runActionVerbAnalysisEngine } from "@/lib/engines/action-verb-analysis";

export async function POST(req: Request) {
  try {
    const { resumeText } = await req.json();
    if (!resumeText) {
      return NextResponse.json(
        { error: "resumeText is required" },
        { status: 400 }
      );
    }
    const result = runActionVerbAnalysisEngine(resumeText);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Action verb analysis failed" },
      { status: 500 }
    );
  }
}
