import type { StructureScoringResult, SectionPresence, FormattingIssue } from "@/types/evaluation";

/* ── Expected resume sections with detection patterns ── */

const SECTION_DEFINITIONS: {
  name: string;
  patterns: RegExp[];
  importance: "critical" | "important" | "optional";
  idealOrder: number;
}[] = [
  {
    name: "Contact Information",
    patterns: [
      /\b[\w.-]+@[\w.-]+\.\w{2,}\b/, // email
      /\b\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/, // phone
      /\blinkedin\.com\b/i,
      /\bgithub\.com\b/i,
    ],
    importance: "critical",
    idealOrder: 0,
  },
  {
    name: "Summary / Objective",
    patterns: [
      /\b(professional\s+)?summary\b/i,
      /\bobjective\b/i,
      /\babout\s+me\b/i,
      /\bprofile\b/i,
      /\bpersonal\s+statement\b/i,
      /\bcareer\s+overview\b/i,
    ],
    importance: "important",
    idealOrder: 1,
  },
  {
    name: "Experience",
    patterns: [
      /\b(work\s+)?experience\b/i,
      /\bemployment(\s+history)?\b/i,
      /\bprofessional\s+experience\b/i,
      /\bwork\s+history\b/i,
      /\bcareer\s+history\b/i,
    ],
    importance: "critical",
    idealOrder: 2,
  },
  {
    name: "Education",
    patterns: [
      /\beducation\b/i,
      /\bacademic\b/i,
      /\bdegree/i,
      /\buniversity\b/i,
      /\bcollege\b/i,
      /\bB\.?S\.?\b/,
      /\bM\.?S\.?\b/,
      /\bPh\.?D\.?\b/,
      /\bB\.?A\.?\b/,
      /\bM\.?A\.?\b/,
      /\bMBA\b/,
    ],
    importance: "critical",
    idealOrder: 4,
  },
  {
    name: "Skills",
    patterns: [
      /\b(technical\s+)?skills\b/i,
      /\btechnologies\b/i,
      /\btools?\s*(&|and)\s*technologies\b/i,
      /\bcore\s+competencies\b/i,
      /\btechnical\s+proficiencies\b/i,
      /\bskill\s+set\b/i,
    ],
    importance: "critical",
    idealOrder: 3,
  },
  {
    name: "Projects",
    patterns: [
      /\bprojects?\b/i,
      /\bportfolio\b/i,
      /\bpersonal\s+projects?\b/i,
      /\bside\s+projects?\b/i,
    ],
    importance: "optional",
    idealOrder: 5,
  },
  {
    name: "Certifications",
    patterns: [
      /\bcertification/i,
      /\bcertified\b/i,
      /\blicenses?\b/i,
      /\baccreditation/i,
      /\bAWS\s+Certified\b/i,
    ],
    importance: "optional",
    idealOrder: 6,
  },
  {
    name: "Awards / Achievements",
    patterns: [
      /\bawards?\b/i,
      /\bachievements?\b/i,
      /\bhonors?\b/i,
      /\brecognition/i,
    ],
    importance: "optional",
    idealOrder: 7,
  },
];

/* ── Formatting issue detectors ── */

function detectFormattingIssues(text: string, lines: string[]): FormattingIssue[] {
  const issues: FormattingIssue[] = [];

  // 1. Inconsistent bullet styles
  const bulletStyles = new Set<string>();
  for (const line of lines) {
    if (/^•\s/.test(line)) bulletStyles.add("•");
    if (/^-\s/.test(line)) bulletStyles.add("-");
    if (/^\*\s/.test(line)) bulletStyles.add("*");
    if (/^–\s/.test(line)) bulletStyles.add("–");
    if (/^►\s/.test(line)) bulletStyles.add("►");
    if (/^▪\s/.test(line)) bulletStyles.add("▪");
    if (/^▸\s/.test(line)) bulletStyles.add("▸");
  }
  if (bulletStyles.size > 1) {
    issues.push({
      type: "inconsistent_bullets",
      severity: "warning",
      message: `Multiple bullet styles detected (${[...bulletStyles].join(", ")}). Use a single consistent bullet style.`,
    });
  }

  // 2. Inconsistent date formats
  const dateFormats = new Set<string>();
  const mmyyyyPattern = /\b\d{2}\/\d{4}\b/g;
  const monthYearPattern = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b/gi;
  const mmddyyyyPattern = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g;

  if (mmyyyyPattern.test(text)) dateFormats.add("MM/YYYY");
  if (monthYearPattern.test(text)) dateFormats.add("Month YYYY");
  if (mmddyyyyPattern.test(text)) dateFormats.add("MM/DD/YYYY");
  // Reset lastIndex after test
  if (dateFormats.size > 1) {
    issues.push({
      type: "inconsistent_dates",
      severity: "warning",
      message: `Multiple date formats detected (${[...dateFormats].join(", ")}). Use a consistent date format throughout.`,
    });
  }

  // 3. Very long paragraphs (walls of text without bullets)
  let consecutiveNonBullet = 0;
  for (const line of lines) {
    if (
      line.length > 50 &&
      !/^[•\-–—*▪▸►\d]/.test(line) &&
      !isSectionHeader(line)
    ) {
      consecutiveNonBullet++;
      if (consecutiveNonBullet >= 4) {
        issues.push({
          type: "wall_of_text",
          severity: "warning",
          message: "Large blocks of text detected without bullet points. Break content into concise bullets for ATS readability.",
        });
        break;
      }
    } else {
      consecutiveNonBullet = 0;
    }
  }

  // 4. Very short bullets (less than 30 chars)
  const shortBullets = lines.filter(
    (l) => /^[•\-–—*▪▸►]\s/.test(l) && l.length < 30
  ).length;
  if (shortBullets >= 3) {
    issues.push({
      type: "short_bullets",
      severity: "info",
      message: `${shortBullets} very short bullet points detected. Expand with specific achievements and metrics.`,
    });
  }

  // 5. All-caps sections that are too long
  const allCapsLines = lines.filter(
    (l) => l.length > 3 && l === l.toUpperCase() && /[A-Z]/.test(l) && l.length > 40
  );
  if (allCapsLines.length >= 2) {
    issues.push({
      type: "excessive_caps",
      severity: "info",
      message: "Excessive use of ALL CAPS detected. Use title case for section headers to improve readability.",
    });
  }

  // 6. Check for personal pronouns (I, my, me)
  const pronounCount = (text.match(/\b(I|my|me|myself)\b/g) || []).length;
  if (pronounCount >= 5) {
    issues.push({
      type: "personal_pronouns",
      severity: "warning",
      message: `${pronounCount} personal pronouns (I, my, me) detected. Resumes should use implied first person (start bullets with verbs instead).`,
    });
  }

  // 7. Check for URLs/links that may not parse in ATS
  const longUrls = (text.match(/https?:\/\/\S{60,}/g) || []).length;
  if (longUrls >= 1) {
    issues.push({
      type: "long_urls",
      severity: "info",
      message: "Long URLs detected. Some ATS systems may not parse these correctly. Use hyperlinked text instead if possible.",
    });
  }

  return issues;
}

function isSectionHeader(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 50 && trimmed.endsWith(":")) return true;
  if (trimmed.length < 40 && /^[A-Z][A-Za-z\s/&-]+$/.test(trimmed)) return true;
  if (trimmed.length < 40 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) return true;
  return false;
}

/**
 * Engine: Resume Structure Scoring.
 * Evaluates whether the resume has expected sections, appropriate length,
 * consistent formatting patterns, and good information density.
 * Pure TypeScript — no external APIs needed.
 */
export function runStructureScoringEngine(
  resumeText: string
): StructureScoringResult {
  const lines = resumeText.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const totalLines = lines.length;
  const totalWords = resumeText.split(/\s+/).filter(Boolean).length;

  // 1. Detect sections present
  const sectionsFound: SectionPresence[] = [];
  let foundOrder = 0;

  for (const section of SECTION_DEFINITIONS) {
    const found = section.patterns.some((p) => p.test(resumeText));
    sectionsFound.push({
      name: section.name,
      found,
      importance: section.importance,
      idealOrder: section.idealOrder,
      actualOrder: found ? foundOrder++ : -1,
    });
  }

  // 2. Calculate section coverage
  const criticalSections = sectionsFound.filter((s) => s.importance === "critical");
  const importantSections = sectionsFound.filter((s) => s.importance === "important");
  const optionalSections = sectionsFound.filter((s) => s.importance === "optional");

  const criticalFound = criticalSections.filter((s) => s.found).length;
  const criticalTotal = criticalSections.length;
  const importantFound = importantSections.filter((s) => s.found).length;
  const importantTotal = importantSections.length;
  const optionalFound = optionalSections.filter((s) => s.found).length;

  // 3. Estimate page count and evaluate length
  // Average resume has ~3000-3500 chars per page, ~500-600 words per page
  const estimatedPages = Math.max(1, Math.round(totalWords / 550));
  let lengthAssessment: StructureScoringResult["lengthAssessment"];

  if (totalWords < 200) {
    lengthAssessment = "too_short";
  } else if (totalWords <= 600) {
    lengthAssessment = "ideal"; // ~1 page
  } else if (totalWords <= 1200) {
    lengthAssessment = "ideal"; // ~2 pages, acceptable for experienced
  } else if (totalWords <= 1800) {
    lengthAssessment = "slightly_long";
  } else {
    lengthAssessment = "too_long";
  }

  // 4. Information density
  const bulletCount = lines.filter((l) => /^[•\-–—*▪▸►]\s/.test(l) || /^\d+[.)]\s/.test(l)).length;
  const bulletDensity = totalLines > 0 ? bulletCount / totalLines : 0;

  // Calculate average line length (good density means lines around 60-120 chars)
  const avgLineLength = totalLines > 0
    ? Math.round(lines.reduce((s, l) => s + l.length, 0) / totalLines)
    : 0;

  // 5. Formatting issues
  const formattingIssues = detectFormattingIssues(resumeText, lines);

  // 6. Score calculation
  // Critical sections: 40%, formatting: 25%, length: 20%, density: 15%
  const criticalRate = criticalTotal > 0 ? criticalFound / criticalTotal : 1;
  const importantRate = importantTotal > 0 ? importantFound / importantTotal : 1;
  const sectionScore = criticalRate * 0.7 + importantRate * 0.3;

  const warningCount = formattingIssues.filter((i) => i.severity === "warning").length;
  const formattingScore = Math.max(0, 1 - warningCount * 0.2);

  let lengthScore: number;
  switch (lengthAssessment) {
    case "ideal":
      lengthScore = 1;
      break;
    case "slightly_long":
      lengthScore = 0.7;
      break;
    case "too_short":
      lengthScore = 0.4;
      break;
    case "too_long":
      lengthScore = 0.3;
      break;
  }

  // Good bullet density is 30-60%
  const densityScore =
    bulletDensity >= 0.3 && bulletDensity <= 0.6
      ? 1
      : bulletDensity > 0.6
        ? 0.8
        : bulletDensity >= 0.15
          ? 0.6
          : 0.3;

  const score = Math.round(
    sectionScore * 40 +
    formattingScore * 25 +
    lengthScore * 20 +
    densityScore * 15
  );

  return {
    sections: sectionsFound,
    criticalSectionsFound: criticalFound,
    criticalSectionsTotal: criticalTotal,
    importantSectionsFound: importantFound,
    importantSectionsTotal: importantTotal,
    optionalSectionsFound: optionalFound,
    estimatedPages,
    totalWords,
    totalLines,
    bulletCount,
    avgLineLength,
    lengthAssessment,
    formattingIssues,
    score,
  };
}
