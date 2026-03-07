import type {
  RequirementPriority,
  PrioritizedRequirement,
  RequirementPriorityResult,
} from "@/types/evaluation";

/* ── Signal phrases that indicate priority level ── */

const REQUIRED_SIGNALS = [
  /\brequired?\b/i,
  /\bmust\s+have\b/i,
  /\bmust\s+be\b/i,
  /\bessential\b/i,
  /\bmandatory\b/i,
  /\bnon[\s-]?negotiable\b/i,
  /\bcritical(?:ly)?\b/i,
  /\bnecessary\b/i,
  /\bminimum\s+requirement/i,
  /\bcore\s+requirement/i,
  /\byou\s+will\s+need\b/i,
  /\bwe\s+require\b/i,
];

const PREFERRED_SIGNALS = [
  /\bpreferred?\b/i,
  /\bstrongly\s+preferred?\b/i,
  /\bhighly\s+desired\b/i,
  /\bdesirable\b/i,
  /\bideally\b/i,
  /\bexperience\s+with\b.*\bpreferred\b/i,
  /\bfamiliarity\s+with\b/i,
  /\bcomfortable\s+with\b/i,
  /\bproficien(?:t|cy)\b/i,
];

const BONUS_SIGNALS = [
  /\bnice\s+to\s+have\b/i,
  /\bbonus\b/i,
  /\bplus\b/i,
  /\ba\s+plus\b/i,
  /\badvantage\b/i,
  /\bbeneficial\b/i,
  /\bhelpful\b/i,
  /\bdesired\s+but\s+not\s+required\b/i,
  /\bnot\s+required\b/i,
  /\boptional\b/i,
  /\bextra\s+credit\b/i,
];

/* ── Section header detection ── */

const REQUIRED_SECTION_HEADERS = [
  /\brequired?\s+(?:skills|qualifications|experience)\b/i,
  /\bminimum\s+qualifications?\b/i,
  /\bwhat\s+you(?:'ll)?\s+need\b/i,
  /\byou\s+(?:should|must)\s+have\b/i,
  /\bcore\s+requirements?\b/i,
  /\bbasic\s+qualifications?\b/i,
];

const PREFERRED_SECTION_HEADERS = [
  /\bpreferred\s+(?:skills|qualifications|experience)\b/i,
  /\bdesired\s+(?:skills|qualifications|experience)\b/i,
  /\badditional\s+(?:skills|qualifications)\b/i,
  /\bwhat\s+(?:we'd|we\s+would)\s+like\b/i,
];

const BONUS_SECTION_HEADERS = [
  /\bnice\s+to\s+have\b/i,
  /\bbonus\s+(?:skills|qualifications|points)\b/i,
  /\bextra\s+credit\b/i,
];

/**
 * Detect the priority of a line based on signal words.
 */
function detectLinePriority(line: string): RequirementPriority | null {
  for (const pattern of BONUS_SIGNALS) {
    if (pattern.test(line)) return "bonus";
  }
  for (const pattern of PREFERRED_SIGNALS) {
    if (pattern.test(line)) return "preferred";
  }
  for (const pattern of REQUIRED_SIGNALS) {
    if (pattern.test(line)) return "required";
  }
  return null;
}

/**
 * Detect the section type of a header line.
 */
function detectSectionType(line: string): RequirementPriority | null {
  for (const pattern of BONUS_SECTION_HEADERS) {
    if (pattern.test(line)) return "bonus";
  }
  for (const pattern of PREFERRED_SECTION_HEADERS) {
    if (pattern.test(line)) return "preferred";
  }
  for (const pattern of REQUIRED_SECTION_HEADERS) {
    if (pattern.test(line)) return "required";
  }
  return null;
}

/**
 * Check if a line looks like a section header.
 */
function isSectionHeader(line: string): boolean {
  const trimmed = line.trim();
  // Short lines in title case, or lines ending with ":"
  if (trimmed.length < 80 && trimmed.endsWith(":")) return true;
  if (trimmed.length < 60 && /^[A-Z][A-Za-z\s/&-]+$/.test(trimmed))
    return true;
  // Lines that are ALL CAPS
  if (trimmed.length < 60 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed))
    return true;
  return false;
}

/**
 * Extract technical keywords from a single line.
 */
function extractLineKeywords(line: string): string[] {
  const keywords: string[] = [];
  // Match terms in a line — split by commas, slashes, "and", "or"
  const cleaned = line
    .replace(/[•\-–—*]/g, "")
    .replace(/\b(experience|proficiency|knowledge|understanding|familiarity|skills?)\s+(in|with|of)\b/gi, "")
    .trim();

  // Split on common delimiters
  const parts = cleaned.split(/[,;/]|\band\b|\bor\b/i);
  for (const part of parts) {
    const trimmed = part.trim().toLowerCase();
    // Keep reasonable-length technical terms (skip full sentences)
    if (trimmed.length >= 2 && trimmed.length <= 40 && trimmed.split(/\s+/).length <= 4) {
      // Skip if it's mostly stop/generic words
      const words = trimmed.split(/\s+/);
      const genericWords = new Set(["with", "in", "of", "the", "a", "an", "to", "for", "and", "or", "years", "year", "plus", "strong"]);
      const meaningful = words.filter((w) => !genericWords.has(w));
      if (meaningful.length > 0) {
        keywords.push(meaningful.join(" "));
      }
    }
  }
  return keywords;
}

/**
 * Check if a keyword exists in resume text (case-insensitive word boundary).
 */
function keywordInText(keyword: string, text: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

/**
 * Parse a job description into prioritized requirements.
 */
export function runRequirementPriorityEngine(
  resumeText: string,
  jobDescription: string
): RequirementPriorityResult {
  const lines = jobDescription.split(/\n/).map((l) => l.trim()).filter(Boolean);

  const requirements: PrioritizedRequirement[] = [];
  let currentSectionPriority: RequirementPriority = "preferred"; // default: assume preferred unless signaled otherwise

  for (const line of lines) {
    // Check if this is a section header
    if (isSectionHeader(line)) {
      const sectionType = detectSectionType(line);
      if (sectionType) {
        currentSectionPriority = sectionType;
        continue;
      }
    }

    // Check for inline priority signals
    const inlinePriority = detectLinePriority(line);

    // Skip very short lines or headers
    if (line.length < 5) continue;

    // Extract keywords from the line
    const lineKeywords = extractLineKeywords(line);
    if (lineKeywords.length === 0) continue;

    // Determine priority: inline signal > section context > default
    const priority = inlinePriority ?? currentSectionPriority;

    for (const kw of lineKeywords) {
      // Deduplicate
      if (requirements.some((r) => r.keyword.toLowerCase() === kw.toLowerCase()))
        continue;

      requirements.push({
        keyword: kw,
        priority,
        matched: keywordInText(kw, resumeText),
        context: line.slice(0, 120),
      });
    }
  }

  // Calculate match rates per priority
  const required = requirements.filter((r) => r.priority === "required");
  const preferred = requirements.filter((r) => r.priority === "preferred");
  const bonus = requirements.filter((r) => r.priority === "bonus");

  const requiredMatchRate =
    required.length > 0
      ? required.filter((r) => r.matched).length / required.length
      : 1;
  const preferredMatchRate =
    preferred.length > 0
      ? preferred.filter((r) => r.matched).length / preferred.length
      : 1;
  const bonusMatchRate =
    bonus.length > 0
      ? bonus.filter((r) => r.matched).length / bonus.length
      : 1;

  // Weighted score: required = 60%, preferred = 30%, bonus = 10%
  const weightedScore = Math.round(
    requiredMatchRate * 60 + preferredMatchRate * 30 + bonusMatchRate * 10
  );

  return {
    requirements,
    requiredMatchRate,
    preferredMatchRate,
    bonusMatchRate,
    weightedScore,
  };
}
