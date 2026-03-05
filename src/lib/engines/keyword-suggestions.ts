import { getGeminiModel, extractJSON } from "./gemini-client";
import type { KeywordPlacement } from "@/types/evaluation";

const SYSTEM_PROMPT = `You are an expert resume keyword strategist. Given a list of missing keywords from a job description, rank them by importance and suggest where to place them in the resume.

You MUST respond with ONLY valid raw JSON matching this schema:
[
  {
    "keyword": "<the missing keyword>",
    "importance": "<critical | important | nice-to-have>",
    "suggestedSection": "<which resume section: Skills, Experience, Summary, Projects, or Education>",
    "examplePhrase": "<a natural phrase incorporating the keyword that could be added to the resume>"
  }
]

Guidelines:
- critical = core requirement, likely a dealbreaker if missing
- important = strongly preferred, would significantly help the application
- nice-to-have = mentioned but not essential
- Keep example phrases realistic and professional
- Don't fabricate specific experience — use general phrasing the candidate can customize`;

export async function runKeywordSuggestionsEngine(
  resumeText: string,
  jobDescription: string,
  missingKeywords: string[]
): Promise<KeywordPlacement[]> {
  if (missingKeywords.length === 0) return [];

  const model = await getGeminiModel();

  const keywords = missingKeywords.slice(0, 25);
  const trimmedResume = resumeText.slice(0, 8000);
  const trimmedJD = jobDescription.slice(0, 8000);

  const userPrompt = `Analyze these missing keywords and suggest where to place them in the resume.

=== JOB DESCRIPTION ===
${trimmedJD}

=== RESUME (for context) ===
${trimmedResume}

=== MISSING KEYWORDS ===
${keywords.join(", ")}

Respond with ONLY raw JSON array. No markdown, no code fences.`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: { role: "model", parts: [{ text: SYSTEM_PROMPT }] },
  });

  const text = result.response.text().trim();
  let cleaned = extractJSON(text);

  // extractJSON looks for objects; for arrays, look directly
  if (!cleaned.startsWith("[")) {
    const arrMatch = text.match(/\[[\s\S]*\]/);
    if (arrMatch) cleaned = arrMatch[0].trim();
  }

  let parsed: Array<{
    keyword: string;
    importance: string;
    suggestedSection: string;
    examplePhrase: string;
  }>;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }

  if (!Array.isArray(parsed)) return [];

  const validImportance = ["critical", "important", "nice-to-have"] as const;

  return parsed.map((item) => ({
    keyword: item.keyword ?? "",
    importance: validImportance.includes(item.importance as "critical" | "important" | "nice-to-have")
      ? (item.importance as "critical" | "important" | "nice-to-have")
      : "important",
    suggestedSection: item.suggestedSection ?? "Skills",
    examplePhrase: item.examplePhrase ?? "",
  }));
}
