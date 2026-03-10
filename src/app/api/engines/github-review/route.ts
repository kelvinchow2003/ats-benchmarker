import { NextResponse, type NextRequest } from "next/server";
import {
  parseGitHubUsername,
  fetchGitHubProfile,
  runGitHubReviewEngine,
} from "@/lib/engines/github-review";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { githubUsername, jobDescription } = body as {
      githubUsername: string;
      jobDescription?: string;
    };

    if (!githubUsername) {
      return NextResponse.json(
        { error: "GitHub username is required" },
        { status: 400 }
      );
    }

    // Parse and validate username
    const username = parseGitHubUsername(githubUsername);

    // Fetch public GitHub profile data
    const profileData = await fetchGitHubProfile(username);

    // Run AI review
    const result = await runGitHubReviewEngine(profileData, jobDescription);

    return NextResponse.json(result);
  } catch (error) {
    console.error("GitHub review engine error:", error);
    const message =
      error instanceof Error ? error.message : "GitHub review engine failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
