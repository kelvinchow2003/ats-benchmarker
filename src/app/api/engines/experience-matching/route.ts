import { NextResponse } from "next/server";
import { runExperienceMatchingEngine } from "@/lib/engines/experience-matching";

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription } = await req.json();
    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "resumeText and jobDescription are required" },
        { status: 400 }
      );
    }
    const result = runExperienceMatchingEngine(resumeText, jobDescription);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Experience matching failed" },
      { status: 500 }
    );
  }
}
