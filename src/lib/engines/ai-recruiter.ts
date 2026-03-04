import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIRecruiterResult } from "@/types/evaluation";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are an expert technical recruiter evaluating a resume against a job description.

SCORING RUBRIC:
- 85–100: Near-perfect match. Candidate meets or exceeds all requirements.
- 65–84: Good match. Candidate meets most requirements with minor gaps.
- 45–64: Partial match. Candidate meets some requirements but has significant gaps.
- 25–44: Weak match. Candidate has some transferable skills but major gaps.
- 0–24: Not a fit. Candidate lacks relevant qualifications.

You MUST respond with ONLY valid raw JSON. No markdown fences, no explanation text, no backticks.
The JSON must exactly match this schema:
{
  "Score": <number 0-100>,
  "Verdict": "<one of: Strong Match | Moderate Match | Weak Match | Not a Fit>",
  "Feedback": "<2-3 sentence overall assessment>",
  "Pros": ["<strength 1>", "<strength 2>", ...],
  "Cons": ["<gap 1>", "<gap 2>", ...]
}`;

/**
 * Engine 3: AI Recruiter — Google Gemini 1.5 Flash structured evaluation.
 */
export async function runAIRecruiterEngine(
  resumeText: string,
  jobDescription: string
): Promise<AIRecruiterResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
    },
  });

  // Truncate to stay well within token limits
  const maxChars = 12000;
  const trimmedResume = resumeText.slice(0, maxChars);
  const trimmedJD = jobDescription.slice(0, maxChars);

  const userPrompt = `Evaluate this resume against the job description.

=== JOB DESCRIPTION ===
${trimmedJD}

=== RESUME ===
${trimmedResume}

Respond with ONLY raw JSON matching the required schema. No markdown, no code fences.`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: { role: "model", parts: [{ text: SYSTEM_PROMPT }] },
  });

  const text = result.response.text().trim();

  // Strip any accidental markdown fences
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: {
    Score: number;
    Verdict: string;
    Feedback: string;
    Pros: string[];
    Cons: string[];
  };

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }

  // Validate and clamp score
  const score = Math.max(0, Math.min(100, Math.round(parsed.Score ?? 0)));

  // Normalize verdict
  const validVerdicts = [
    "Strong Match",
    "Moderate Match",
    "Weak Match",
    "Not a Fit",
  ] as const;
  type Verdict = (typeof validVerdicts)[number];
  const verdict: Verdict = validVerdicts.includes(parsed.Verdict as Verdict)
    ? (parsed.Verdict as Verdict)
    : score >= 65
      ? "Strong Match"
      : score >= 45
        ? "Moderate Match"
        : score >= 25
          ? "Weak Match"
          : "Not a Fit";

  return {
    score,
    verdict,
    feedback: parsed.Feedback ?? "No feedback provided.",
    pros: Array.isArray(parsed.Pros) ? parsed.Pros : [],
    cons: Array.isArray(parsed.Cons) ? parsed.Cons : [],
  };
}
