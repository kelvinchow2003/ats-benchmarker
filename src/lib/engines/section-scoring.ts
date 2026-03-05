import { getGeminiModel, extractJSON } from "./gemini-client";
import type { SectionScoringResult } from "@/types/evaluation";

const SYSTEM_PROMPT = `You are an expert resume analyst. Break down a resume into its sections and score each section against the job description.

You MUST respond with ONLY valid raw JSON matching this schema:
{
  "sections": [
    {
      "sectionName": "<section name: Summary, Experience, Skills, Education, Projects, Certifications, etc.>",
      "score": <number 0-100>,
      "feedback": "<1-2 sentence assessment of this section's relevance>",
      "relevantKeywords": ["<keywords from this section that match the JD>"],
      "missingKeywords": ["<keywords expected in this section but absent>"]
    }
  ],
  "strongestSection": "<name of the highest-scoring section>",
  "weakestSection": "<name of the lowest-scoring section>"
}

Guidelines:
- Identify all distinct sections present in the resume
- Score each section 0-100 based on relevance to the job description
- Focus on content quality, keyword coverage, and relevance
- Be specific about which keywords each section covers or misses`;

export async function runSectionScoringEngine(
  resumeText: string,
  jobDescription: string
): Promise<SectionScoringResult> {
  const model = await getGeminiModel();

  const maxChars = 10000;
  const trimmedResume = resumeText.slice(0, maxChars);
  const trimmedJD = jobDescription.slice(0, maxChars);

  const userPrompt = `Break this resume into sections and score each one against the job description.

=== JOB DESCRIPTION ===
${trimmedJD}

=== RESUME ===
${trimmedResume}

Respond with ONLY raw JSON. No markdown, no code fences.`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: { role: "model", parts: [{ text: SYSTEM_PROMPT }] },
  });

  const text = result.response.text().trim();
  const cleaned = extractJSON(text);

  let parsed: {
    sections: Array<{
      sectionName: string;
      score: number;
      feedback: string;
      relevantKeywords: string[];
      missingKeywords: string[];
    }>;
    strongestSection: string;
    weakestSection: string;
  };

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }

  const sections = (Array.isArray(parsed.sections) ? parsed.sections : []).map((s) => ({
    sectionName: s.sectionName ?? "Unknown",
    score: Math.max(0, Math.min(100, Math.round(s.score ?? 0))),
    feedback: s.feedback ?? "",
    relevantKeywords: Array.isArray(s.relevantKeywords) ? s.relevantKeywords : [],
    missingKeywords: Array.isArray(s.missingKeywords) ? s.missingKeywords : [],
  }));

  return {
    sections,
    strongestSection: parsed.strongestSection ?? sections[0]?.sectionName ?? "",
    weakestSection: parsed.weakestSection ?? sections[sections.length - 1]?.sectionName ?? "",
  };
}
