import { getGeminiModel, extractJSON } from "./gemini-client";
import type {
  LegacyResult,
  SemanticResult,
  AIRecruiterResult,
  SuggestionsResult,
} from "@/types/evaluation";

const SYSTEM_PROMPT = `You are an expert resume coach. Given a resume, job description, and analysis results, provide specific, actionable improvement suggestions.

You MUST respond with ONLY valid raw JSON matching this schema:
{
  "overallStrategy": "<1-2 sentence high-level improvement strategy>",
  "suggestions": [
    {
      "section": "<resume section: Summary, Experience, Skills, Education, or Projects>",
      "currentText": "<the specific weak text or gap found in the resume>",
      "suggestedRewrite": "<the improved version of that text>",
      "reasoning": "<why this change helps match the job description>",
      "priority": "<high | medium | low>"
    }
  ]
}

Guidelines:
- Provide 3-6 concrete suggestions
- Focus on the highest-impact changes first
- Use missing keywords naturally in suggested rewrites
- Keep suggested rewrites realistic and truthful — don't fabricate experience
- Priority should reflect how much the change would improve the match score`;

export async function runSuggestionsEngine(
  resumeText: string,
  jobDescription: string,
  legacyResult: LegacyResult,
  semanticResult: SemanticResult,
  aiRecruiterResult: AIRecruiterResult
): Promise<SuggestionsResult> {
  const model = await getGeminiModel();

  const maxChars = 10000;
  const trimmedResume = resumeText.slice(0, maxChars);
  const trimmedJD = jobDescription.slice(0, maxChars);

  const userPrompt = `Analyze this resume and provide specific improvement suggestions to better match the job description.

=== JOB DESCRIPTION ===
${trimmedJD}

=== RESUME ===
${trimmedResume}

=== ANALYSIS RESULTS ===
Missing Keywords: ${legacyResult.missingKeywords.slice(0, 20).join(", ")}
Semantic Score: ${semanticResult.score}/100 (${semanticResult.interpretation})
AI Verdict: ${aiRecruiterResult.verdict} (${aiRecruiterResult.score}/100)
Weaknesses identified: ${aiRecruiterResult.cons.join("; ")}

Respond with ONLY raw JSON. No markdown, no code fences.`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: { role: "model", parts: [{ text: SYSTEM_PROMPT }] },
  });

  const text = result.response.text().trim();
  const cleaned = extractJSON(text);

  let parsed: {
    overallStrategy: string;
    suggestions: Array<{
      section: string;
      currentText: string;
      suggestedRewrite: string;
      reasoning: string;
      priority: string;
    }>;
  };

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }

  const validPriorities = ["high", "medium", "low"] as const;

  return {
    overallStrategy: parsed.overallStrategy ?? "Focus on tailoring your resume to the job description.",
    suggestions: (Array.isArray(parsed.suggestions) ? parsed.suggestions : []).map((s) => ({
      section: s.section ?? "General",
      currentText: s.currentText ?? "",
      suggestedRewrite: s.suggestedRewrite ?? "",
      reasoning: s.reasoning ?? "",
      priority: validPriorities.includes(s.priority as "high" | "medium" | "low")
        ? (s.priority as "high" | "medium" | "low")
        : "medium",
    })),
  };
}
