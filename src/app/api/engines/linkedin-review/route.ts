import { NextResponse, type NextRequest } from "next/server";
import {
  parseLinkedInUrl,
  fetchLinkedInProfile,
  extractLinkedInFields,
  runLinkedInReviewEngine,
} from "@/lib/engines/linkedin-review";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkedinUrl, profileText } = body as {
      linkedinUrl?: string;
      profileText?: string;
    };

    let profileData;

    if (linkedinUrl && linkedinUrl.trim()) {
      // URL path: parse, fetch, extract
      const url = parseLinkedInUrl(linkedinUrl);
      const fetchedText = await fetchLinkedInProfile(url);
      profileData = extractLinkedInFields(fetchedText);
      profileData.linkedinUrl = url;
    } else if (profileText && profileText.trim()) {
      // Fallback paste path: extract from raw text
      profileData = extractLinkedInFields(profileText.trim());
    } else {
      return NextResponse.json(
        { error: "Either a LinkedIn URL or profile text is required" },
        { status: 400 }
      );
    }

    // Run AI review
    const result = await runLinkedInReviewEngine(profileData);

    return NextResponse.json(result);
  } catch (error) {
    console.error("LinkedIn review engine error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "LinkedIn review engine failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
