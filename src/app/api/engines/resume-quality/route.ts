import { NextRequest, NextResponse } from "next/server";
import { runResumeQualityEngine } from "@/lib/engines/resume-quality";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText } = body as { resumeText: string };

    if (!resumeText) {
      return NextResponse.json(
        { error: "resumeText is required" },
        { status: 400 }
      );
    }

    const result = runResumeQualityEngine(resumeText);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Resume quality engine error:", error);
    return NextResponse.json(
      { error: "Resume quality engine failed" },
      { status: 500 }
    );
  }
}
