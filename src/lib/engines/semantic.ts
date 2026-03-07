import { CohereClient } from "cohere-ai";
import type { SemanticResult } from "@/types/evaluation";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!,
});

/**
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Map raw cosine similarity (typically 0.3–1.0) to a 0–100 score
 * using a non-linear curve that spreads the useful range.
 */
function mapToScore(similarity: number): number {
  // Clamp to [0, 1]
  const clamped = Math.max(0, Math.min(1, similarity));
  // Remap: 0.3 → 0, 1.0 → 1.0
  const normalized = Math.max(0, (clamped - 0.3) / 0.7);
  // Apply sqrt for non-linear spread (boosts mid-range differentiation)
  const curved = Math.sqrt(normalized);
  return Math.round(curved * 100);
}

/**
 * Human-readable interpretation of the similarity score.
 */
function interpret(score: number): string {
  if (score >= 85) return "Exceptional semantic alignment";
  if (score >= 70) return "Strong semantic match";
  if (score >= 55) return "Good alignment with room for improvement";
  if (score >= 40) return "Moderate overlap — consider tailoring";
  if (score >= 25) return "Weak alignment — significant gaps";
  return "Very low relevance to the job description";
}

/**
 * Engine 2: Semantic ATS — Cohere embed-english-v3.0 embeddings
 * with cosine similarity scoring.
 */
export async function runSemanticEngine(
  resumeText: string,
  jobDescription: string
): Promise<SemanticResult> {
  // Truncate texts to avoid token limits (Cohere allows ~512 tokens per text)
  const maxChars = 8000;
  const trimmedResume = resumeText.slice(0, maxChars);
  const trimmedJD = jobDescription.slice(0, maxChars);

  // Embed resume as a document, JD as a query (per Cohere best practices)
  // search_document = the corpus being searched (resume)
  // search_query = the query to match against (job description)
  const [resumeResponse, jdResponse] = await Promise.all([
    cohere.embed({
      texts: [trimmedResume],
      model: "embed-english-v3.0",
      inputType: "search_document",
    }),
    cohere.embed({
      texts: [trimmedJD],
      model: "embed-english-v3.0",
      inputType: "search_query",
    }),
  ]);

  // Extract vectors from each response
  function extractVector(embeddings: unknown): number[] {
    if (Array.isArray(embeddings) && Array.isArray(embeddings[0])) {
      return embeddings[0] as number[];
    }
    if (
      typeof embeddings === "object" &&
      embeddings !== null &&
      "float" in embeddings
    ) {
      return (embeddings as { float: number[][] }).float[0];
    }
    throw new Error("Unexpected Cohere embedding response format");
  }

  const resumeVec = extractVector(resumeResponse.embeddings);
  const jdVec = extractVector(jdResponse.embeddings);

  const rawSimilarity = cosineSimilarity(resumeVec, jdVec);
  const score = mapToScore(rawSimilarity);
  const interpretation = interpret(score);

  return { score, rawSimilarity, interpretation };
}
