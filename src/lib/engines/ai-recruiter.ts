import { getGeminiModel, extractJSON } from "./gemini-client";
import type { AIRecruiterResult } from "@/types/evaluation";

const SYSTEM_PROMPT = `You are an expert technical recruiter evaluating a resume against a job description. Be thorough, accurate, and fair.

EVALUATION CRITERIA (consider ALL of these):
1. **Required vs. Preferred Skills**: Distinguish between "must-have" and "nice-to-have" requirements. Missing required skills should weigh much more heavily than missing preferred/bonus ones.
2. **Experience Level**: Compare the candidate's years of experience and seniority level against what the JD asks for. A junior applying for a senior role (or vice versa) should be scored accordingly.
3. **Technical Stack Match**: Evaluate how well the candidate's specific technologies, tools, and frameworks align with the JD's stack.
4. **Domain Relevance**: Consider industry/domain experience (fintech, healthcare, e-commerce, etc.) if the JD specifies one.
5. **Education**: Check if the candidate meets education requirements (degree level, field of study) if specified.
6. **Achievements & Impact**: Weigh quantified accomplishments and demonstrated impact relevant to the role.

SCORING RUBRIC:
- 85–100 → "Strong Match": Near-perfect fit. Meets virtually all required AND preferred qualifications.
- 65–84 → "Moderate Match": Good fit. Meets most required qualifications with minor gaps in preferred areas.
- 40–64 → "Weak Match": Partial fit. Meets some requirements but has notable gaps in required areas.
- 0–39 → "Not a Fit": Poor fit. Missing most required qualifications.

IMPORTANT: Your Verdict MUST align with your Score per the rubric above. Do NOT give a "Strong Match" for a score below 85.

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
 * Engine 3: AI Recruiter — Google Gemini 2.5 Flash structured evaluation.
 */
export async function runAIRecruiterEngine(
  resumeText: string,
  jobDescription: string
): Promise<AIRecruiterResult> {
  const model = await getGeminiModel();

  const maxChars = 12000;
  const trimmedResume = resumeText.slice(0, maxChars);
  const trimmedJD = jobDescription.slice(0, maxChars);

  const userPrompt = `Evaluate this resume against the job description. Pay close attention to:
- Whether the candidate meets REQUIRED qualifications vs. just preferred/bonus ones
- How the candidate's experience level compares to what's requested
- Specific technology and tool alignment
- Any degree or certification requirements

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
  const cleaned = extractJSON(text);

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

  const score = Math.max(0, Math.min(100, Math.round(parsed.Score ?? 0)));

  const validVerdicts = [
    "Strong Match",
    "Moderate Match",
    "Weak Match",
    "Not a Fit",
  ] as const;
  type Verdict = (typeof validVerdicts)[number];
  const verdict: Verdict = validVerdicts.includes(parsed.Verdict as Verdict)
    ? (parsed.Verdict as Verdict)
    : score >= 85
      ? "Strong Match"
      : score >= 65
        ? "Moderate Match"
        : score >= 40
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
