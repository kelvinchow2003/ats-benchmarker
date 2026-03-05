import { NextResponse } from "next/server";
import { runStructureScoringEngine } from "@/lib/engines/structure-scoring";

export async function POST(req: Request) {
  try {
    const { resumeText } = await req.json();
    if (!resumeText) {
      return NextResponse.json(
        { error: "resumeText is required" },
        { status: 400 }
      );
    }
    const result = runStructureScoringEngine(resumeText);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Structure scoring failed" },
      { status: 500 }
    );
  }
}
