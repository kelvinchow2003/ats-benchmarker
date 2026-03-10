import { getGeminiModel, extractJSON } from "./gemini-client";
import type {
  LinkedInProfileData,
  LinkedInReviewResult,
} from "@/types/evaluation";

/* ── LinkedIn URL Parsing & Fetching ── */

/**
 * Validate and normalize a LinkedIn profile input into a canonical URL.
 * Accepts: "johndoe", "linkedin.com/in/johndoe", "https://www.linkedin.com/in/johndoe"
 * Returns: "https://www.linkedin.com/in/<slug>"
 */
export function parseLinkedInUrl(input: string): string {
  const trimmed = input.trim().replace(/\/+$/, "");

  // Match full or partial LinkedIn URL — capture the slug after /in/
  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9][a-zA-Z0-9\-]{0,99})\/?$/i
  );
  if (urlMatch) {
    return `https://www.linkedin.com/in/${urlMatch[1]}`;
  }

  // Plain slug: alphanumeric + hyphens (LinkedIn slug rules)
  if (/^[a-zA-Z0-9][a-zA-Z0-9\-]{0,99}$/.test(trimmed)) {
    return `https://www.linkedin.com/in/${trimmed}`;
  }

  throw new Error(
    `Invalid LinkedIn profile URL or username: "${input}". ` +
      `Provide a URL like "https://linkedin.com/in/johndoe" or a username like "johndoe".`
  );
}

/** Decode common HTML entities */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ");
}

/** Extract a meta property value (og:title, og:description, etc.) from HTML */
function extractMetaProperty(html: string, property: string): string | null {
  // Handle both attribute orderings: property-then-content and content-then-property
  const regex = new RegExp(
    `<meta\\s+(?:property=["']${property}["']\\s+content=["']([\\s\\S]*?)["']|content=["']([\\s\\S]*?)["']\\s+property=["']${property}["'])\\s*/?>`,
    "i"
  );
  const match = html.match(regex);
  if (match) {
    const value = match[1] || match[2];
    return value ? decodeHtmlEntities(value.trim()) : null;
  }
  return null;
}

/**
 * Fetch a LinkedIn profile page and extract whatever text data is available.
 * LinkedIn blocks most scrapers, so this is best-effort.
 * Returns a combined text string of extracted profile information.
 * Throws if the profile is inaccessible or returns no useful data.
 */
export async function fetchLinkedInProfile(url: string): Promise<string> {
  let html: string;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    html = await response.text();
  } catch {
    throw new Error(
      "Could not access this LinkedIn profile. The profile may be private " +
        "or LinkedIn may be blocking access. Please paste your profile text instead."
    );
  }

  // Check for login wall
  if (
    html.includes("authwall") ||
    html.includes("/login") ||
    html.includes("/checkpoint/")
  ) {
    throw new Error(
      "LinkedIn is requiring sign-in to view this profile. " +
        "Please paste your profile text instead."
    );
  }

  const parts: string[] = [];

  // 1. Extract <title> content (e.g., "John Doe - Senior Engineer - Company | LinkedIn")
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    const title = decodeHtmlEntities(titleMatch[1].trim());
    const cleaned = title.replace(/\s*\|\s*LinkedIn\s*$/i, "").trim();
    if (cleaned) {
      parts.push(cleaned);
    }
  }

  // 2. Extract <meta name="description">
  const descMatch = html.match(
    /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i
  );
  if (descMatch) {
    const desc = decodeHtmlEntities(descMatch[1].trim());
    if (desc && desc.length > 20) {
      parts.push(desc);
    }
  }

  // 3. Extract Open Graph tags
  const ogTitle = extractMetaProperty(html, "og:title");
  const ogDesc = extractMetaProperty(html, "og:description");
  if (ogTitle && !parts.some((p) => p.includes(ogTitle))) {
    parts.push(ogTitle);
  }
  if (ogDesc && ogDesc.length > 20 && !parts.some((p) => p.includes(ogDesc))) {
    parts.push(ogDesc);
  }

  // 4. Extract JSON-LD structured data (Person / ProfilePage)
  const jsonLdMatches = html.matchAll(
    /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  for (const match of jsonLdMatches) {
    try {
      const data = JSON.parse(match[1]);
      if (data["@type"] === "Person" || data["@type"] === "ProfilePage") {
        if (data.name) parts.push(`Name: ${data.name}`);
        if (data.jobTitle) parts.push(`Title: ${data.jobTitle}`);
        if (data.description) parts.push(`About: ${data.description}`);
        if (data.worksFor?.name)
          parts.push(`Company: ${data.worksFor.name}`);
        if (data.alumniOf) {
          const schools = Array.isArray(data.alumniOf)
            ? data.alumniOf
            : [data.alumniOf];
          for (const school of schools) {
            if (school.name) parts.push(`Education: ${school.name}`);
          }
        }
      }
    } catch {
      // JSON parse failed, skip this block
    }
  }

  // Validate: we need at least some meaningful data
  const combinedText = parts.join("\n\n");
  if (combinedText.length < 30) {
    throw new Error(
      "Could not extract sufficient profile data from this LinkedIn URL. " +
        "The profile may be private or LinkedIn may be blocking access. " +
        "Please paste your profile text instead."
    );
  }

  return combinedText;
}

/* ── LinkedIn Profile Parsing ── */

/**
 * Best-effort extraction of structured fields from raw LinkedIn profile text.
 * LinkedIn PDF exports typically have: Name on first line, headline on second,
 * then sections like Summary/About, Experience, Education, Skills.
 *
 * Even if extraction fails for some fields, the full profileText is always
 * preserved so the AI can still review the complete profile.
 */
export function extractLinkedInFields(text: string): LinkedInProfileData {
  const lines = text.split("\n").map((l) => l.trim());
  const nonEmpty = lines.filter(Boolean);

  // Name: first non-empty line
  const name = nonEmpty.length > 0 ? nonEmpty[0] : null;

  // Headline: second non-empty line (LinkedIn PDFs put headline right after name)
  // Skip lines that look like contact info (contain @, phone numbers, linkedin.com)
  let headline: string | null = null;
  for (let i = 1; i < Math.min(nonEmpty.length, 5); i++) {
    const line = nonEmpty[i];
    if (
      line.includes("@") ||
      line.includes("linkedin.com") ||
      /^\+?\d[\d\s\-()]{6,}$/.test(line)
    ) {
      continue; // skip contact info lines
    }
    headline = line;
    break;
  }

  // Summary/About: text between "Summary" or "About" header and next major section
  const summaryMatch = text.match(
    /(?:^|\n)\s*(?:Summary|About)\s*\n([\s\S]*?)(?:\n\s*(?:Experience|Education|Skills|Licenses|Certifications|Honors|Publications|Languages|Volunteer|Projects|Organizations)\s*\n|$)/i
  );
  const summary = summaryMatch ? summaryMatch[1].trim() || null : null;

  return {
    name,
    headline,
    summary,
    profileText: text,
  };
}

/* ── Prompt Formatting ── */

/**
 * Format LinkedIn profile data into a text summary for the LLM.
 */
export function formatLinkedInForPrompt(
  profile: LinkedInProfileData
): string {
  const lines: string[] = [];

  if (profile.name) lines.push(`Name: ${profile.name}`);
  if (profile.headline) lines.push(`Headline: ${profile.headline}`);
  lines.push("");

  if (profile.summary) {
    lines.push("=== SUMMARY ===");
    lines.push(profile.summary);
    lines.push("");
  }

  lines.push("=== FULL PROFILE TEXT ===");
  // Truncate very long profiles to stay within Gemini's context window
  const maxLen = 15000;
  if (profile.profileText.length > maxLen) {
    lines.push(profile.profileText.slice(0, maxLen));
    lines.push("[... profile truncated for length ...]");
  } else {
    lines.push(profile.profileText);
  }

  return lines.join("\n");
}

/* ── Gemini-Powered Review ── */

const LINKEDIN_SYSTEM_PROMPT = `You are an experienced career coach and recruiter evaluating a candidate's LinkedIn profile. You are reviewing their profile the way a hiring manager or recruiter would when they first visit it.

EVALUATION CRITERIA:
1. **Headline Effectiveness**: Is the headline keyword-rich, specific, and does it convey the candidate's value proposition? (Avoid generic titles like "Looking for opportunities")
2. **Summary/About Quality**: Is the About section compelling, well-structured, and does it tell a professional story? Does it include a call to action?
3. **Experience Descriptions**: Do job descriptions use the STAR method? Are there action verbs, quantified results, and specific achievements rather than just listing duties?
4. **Skills & Endorsements**: Is the skills section complete and relevant? Are key skills for their target role included?
5. **Profile Completeness**: Does the profile include education, certifications, volunteer work, recommendations, and other sections that signal a well-maintained presence?
6. **Professional Presentation**: Is the overall profile polished, free of typos, consistent in formatting, and does it present a clear personal brand?

SCORING RUBRIC:
- 85–100 → "Excellent": Outstanding LinkedIn presence. Compelling headline, detailed experience with metrics, strong summary, complete profile.
- 65–84 → "Good": Solid profile. Decent descriptions, reasonable headline, some quantified achievements, minor gaps.
- 40–64 → "Needs Work": Thin descriptions, generic headline, missing summary or key sections, few metrics.
- 0–39 → "Getting Started": Bare-bones profile, no summary, job titles only without descriptions, minimal effort.

IMPORTANT: Your Verdict MUST align with your Score per the rubric above.

You MUST respond with ONLY valid raw JSON. No markdown fences, no explanation text, no backticks.
The JSON must exactly match this schema:
{
  "Score": <number 0-100>,
  "Verdict": "<one of: Excellent | Good | Needs Work | Getting Started>",
  "Feedback": "<2-3 sentence overall assessment of the LinkedIn profile>",
  "Strengths": ["<strength 1>", "<strength 2>", ...],
  "Improvements": ["<actionable suggestion 1>", "<actionable suggestion 2>", ...],
  "SectionHighlights": [{"section": "<section name like Experience, Summary, Skills, etc.>", "feedback": "<specific feedback for this section>"}, ...]
}`;

/**
 * Engine: LinkedIn Profile Review.
 * Evaluates a LinkedIn profile using Gemini.
 */
export async function runLinkedInReviewEngine(
  profileData: LinkedInProfileData
): Promise<LinkedInReviewResult> {
  const model = await getGeminiModel();

  const profileSummary = formatLinkedInForPrompt(profileData);

  const userPrompt = `Review this professional's LinkedIn profile. Evaluate their overall presence, the quality of each section, and provide specific, actionable suggestions for improvement.

=== LINKEDIN PROFILE ===
${profileSummary}

Respond with ONLY raw JSON matching the required schema. No markdown, no code fences.`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: {
      role: "model",
      parts: [{ text: LINKEDIN_SYSTEM_PROMPT }],
    },
  });

  const text = result.response.text().trim();
  const cleaned = extractJSON(text);

  let parsed: {
    Score: number;
    Verdict: string;
    Feedback: string;
    Strengths: string[];
    Improvements: string[];
    SectionHighlights: { section: string; feedback: string }[];
  };

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }

  const score = Math.max(0, Math.min(100, Math.round(parsed.Score ?? 0)));

  const validVerdicts = [
    "Excellent",
    "Good",
    "Needs Work",
    "Getting Started",
  ] as const;
  type Verdict = (typeof validVerdicts)[number];

  const verdict: Verdict = validVerdicts.includes(parsed.Verdict as Verdict)
    ? (parsed.Verdict as Verdict)
    : score >= 85
      ? "Excellent"
      : score >= 65
        ? "Good"
        : score >= 40
          ? "Needs Work"
          : "Getting Started";

  return {
    score,
    verdict,
    feedback: parsed.Feedback ?? "No feedback provided.",
    strengths: Array.isArray(parsed.Strengths) ? parsed.Strengths : [],
    improvements: Array.isArray(parsed.Improvements)
      ? parsed.Improvements
      : [],
    sectionHighlights: Array.isArray(parsed.SectionHighlights)
      ? parsed.SectionHighlights.map((s) => ({
          section: s.section ?? "",
          feedback: s.feedback ?? "",
        }))
      : [],
    profileData,
  };
}
