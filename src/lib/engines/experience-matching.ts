import type { ExperienceMatchResult, JDExperienceRequirement, ResumeExperienceEntry } from "@/types/evaluation";

/* ── Month name mapping ── */

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, september: 8, sept: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/* ── Seniority level detection patterns ── */

const SENIORITY_PATTERNS: { level: string; patterns: RegExp[] }[] = [
  {
    level: "intern",
    patterns: [/\bintern(ship)?\b/i, /\bco-?op\b/i, /\btrainee\b/i],
  },
  {
    level: "entry",
    patterns: [
      /\bentry[\s-]?level\b/i, /\bjunior\b/i, /\bassociate\b/i,
      /\b(0|1)[\s-+]?\s*years?\b/i, /\bnew\s+grad(uate)?\b/i,
    ],
  },
  {
    level: "mid",
    patterns: [
      /\bmid[\s-]?level\b/i, /\b[2-4]\+?\s*years?\b/i,
      /\b(2|3|4)\s*[-–]\s*\d+\s*years?\b/i,
    ],
  },
  {
    level: "senior",
    patterns: [
      /\bsenior\b/i, /\bsr\.?\b/i, /\bstaff\b/i, /\bprincipal\b/i,
      /\b[5-9]\+?\s*years?\b/i, /\b\d{2}\+?\s*years?\b/i,
      /\b(5|6|7|8|9|10)\s*[-–]\s*\d+\s*years?\b/i,
    ],
  },
  {
    level: "lead",
    patterns: [
      /\b(tech(nical)?\s+)?lead\b/i, /\bteam\s+lead\b/i,
      /\bengineering\s+manager\b/i, /\bmanager\b/i,
    ],
  },
  {
    level: "executive",
    patterns: [
      /\bdirector\b/i, /\bVP\b/, /\bvice\s+president\b/i,
      /\bC[A-Z]O\b/, /\bchief\b/i, /\bhead\s+of\b/i,
    ],
  },
];

/**
 * Parse experience requirements from a job description.
 */
function parseJDExperienceRequirements(jd: string): JDExperienceRequirement[] {
  const requirements: JDExperienceRequirement[] = [];

  // Pattern: "X+ years (of) experience (in/with) Y"
  const expPatterns = [
    /(\d+)\+?\s*[-–]?\s*(?:\d+\s*)?years?\s+(?:of\s+)?(?:professional\s+)?(?:experience|exp\.?)\s*(?:in|with|working\s+(?:with|in))?\s*([^,.;\n]{3,60})?/gi,
    /(?:minimum|at\s+least|requires?)\s+(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience\s+)?(?:in|with)?\s*([^,.;\n]{3,60})?/gi,
    /(\d+)\s*[-–]\s*(\d+)\s*years?\s+(?:of\s+)?(?:experience\s+)?(?:in|with)?\s*([^,.;\n]{3,60})?/gi,
  ];

  for (const pattern of expPatterns) {
    let match;
    while ((match = pattern.exec(jd)) !== null) {
      const minYears = parseInt(match[1], 10);
      let maxYears: number | null = null;
      let field: string | null = null;

      // Check if pattern is range type (X-Y years)
      if (match[2] && !isNaN(parseInt(match[2], 10)) && match[3]) {
        maxYears = parseInt(match[2], 10);
        field = match[3]?.trim() || null;
      } else {
        field = match[2]?.trim() || null;
      }

      // Clean up field text
      if (field) {
        field = field.replace(/[.,:;]+$/, "").trim();
        // Skip if field is too generic or short
        if (field.length < 3 || /^(the|and|or|in|a|an)$/i.test(field)) {
          field = null;
        }
      }

      // Avoid duplicate requirements
      if (!requirements.some((r) => r.minYears === minYears && r.field === field)) {
        requirements.push({
          minYears,
          maxYears,
          field,
          rawText: match[0].trim().slice(0, 120),
        });
      }
    }
  }

  return requirements;
}

/**
 * Detect seniority level from JD text.
 */
function detectJDSeniority(jd: string): string {
  // Check from most senior to least
  for (const { level, patterns } of [...SENIORITY_PATTERNS].reverse()) {
    if (patterns.some((p) => p.test(jd))) {
      return level;
    }
  }
  return "mid"; // default
}

/**
 * Parse date ranges from resume and calculate experience entries.
 */
function parseResumeExperience(resumeText: string): ResumeExperienceEntry[] {
  const entries: ResumeExperienceEntry[] = [];
  const lines = resumeText.split(/\n/);
  const now = new Date();

  // Pattern: "Month YYYY – Month YYYY" or "Month YYYY – Present"
  const dateRangePatterns = [
    // "Jan 2020 - Dec 2023", "January 2020 – Present"
    /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*(\d{4})\s*[-–—]\s*(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*(\d{4})/gi,
    // "Jan 2020 - Present/Current"
    /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*(\d{4})\s*[-–—]\s*(present|current|now|ongoing)\b/gi,
    // "2020 - 2023" or "2020 – Present"
    /\b(20\d{2}|19\d{2})\s*[-–—]\s*(20\d{2}|19\d{2})\b/g,
    /\b(20\d{2}|19\d{2})\s*[-–—]\s*(present|current|now|ongoing)\b/gi,
    // "MM/YYYY - MM/YYYY"
    /\b(\d{1,2})\/(20\d{2}|19\d{2})\s*[-–—]\s*(\d{1,2})\/(20\d{2}|19\d{2})/g,
    /\b(\d{1,2})\/(20\d{2}|19\d{2})\s*[-–—]\s*(present|current|now|ongoing)\b/gi,
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    for (const pattern of dateRangePatterns) {
      let match;
      const regex = new RegExp(pattern);
      while ((match = regex.exec(trimmed)) !== null) {
        let startDate: Date | null = null;
        let endDate: Date | null = null;
        let isCurrent = false;

        const fullMatch = match[0];

        // Parse based on pattern type
        if (/present|current|now|ongoing/i.test(fullMatch)) {
          isCurrent = true;
          endDate = now;
        }

        // "Month Year - Month Year" or "Month Year - Present"
        const monthYearMatch = fullMatch.match(
          /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*(\d{4})/gi
        );

        if (monthYearMatch && monthYearMatch.length >= 1) {
          const startParts = monthYearMatch[0].match(
            /\b([A-Za-z]+)\s*\.?\s*(\d{4})/
          );
          if (startParts) {
            const monthStr = startParts[1].toLowerCase().slice(0, 3);
            const month = MONTH_MAP[monthStr];
            const year = parseInt(startParts[2], 10);
            if (month !== undefined && year) {
              startDate = new Date(year, month);
            }
          }

          if (monthYearMatch.length >= 2 && !isCurrent) {
            const endParts = monthYearMatch[1].match(
              /\b([A-Za-z]+)\s*\.?\s*(\d{4})/
            );
            if (endParts) {
              const monthStr = endParts[1].toLowerCase().slice(0, 3);
              const month = MONTH_MAP[monthStr];
              const year = parseInt(endParts[2], 10);
              if (month !== undefined && year) {
                endDate = new Date(year, month);
              }
            }
          }
        }

        // "YYYY - YYYY" or "YYYY - Present"
        if (!startDate) {
          const yearMatch = fullMatch.match(/\b(20\d{2}|19\d{2})/g);
          if (yearMatch && yearMatch.length >= 1) {
            startDate = new Date(parseInt(yearMatch[0], 10), 0);
            if (yearMatch.length >= 2 && !isCurrent) {
              endDate = new Date(parseInt(yearMatch[1], 10), 11);
            }
          }
        }

        // "MM/YYYY - MM/YYYY" or "MM/YYYY - Present"
        if (!startDate) {
          const mmyyyyMatch = fullMatch.match(/(\d{1,2})\/(20\d{2}|19\d{2})/g);
          if (mmyyyyMatch && mmyyyyMatch.length >= 1) {
            const parts = mmyyyyMatch[0].split("/");
            startDate = new Date(parseInt(parts[1], 10), parseInt(parts[0], 10) - 1);
            if (mmyyyyMatch.length >= 2 && !isCurrent) {
              const endParts = mmyyyyMatch[1].split("/");
              endDate = new Date(parseInt(endParts[1], 10), parseInt(endParts[0], 10) - 1);
            }
          }
        }

        if (startDate && endDate) {
          const durationMonths = Math.max(
            0,
            (endDate.getFullYear() - startDate.getFullYear()) * 12 +
              (endDate.getMonth() - startDate.getMonth())
          );
          const durationYears = Math.round(durationMonths / 12 * 10) / 10;

          // Sanity check: skip durations > 50 years or negative
          if (durationYears > 0 && durationYears <= 50) {
            // Try to extract role context from surrounding text
            const contextLine = trimmed.slice(0, 100);
            entries.push({
              rawText: contextLine,
              startDate: startDate.toISOString(),
              endDate: isCurrent ? "Present" : endDate.toISOString(),
              durationMonths,
              durationYears,
              isCurrent,
            });
          }
        }
      }
    }
  }

  // Deduplicate overlapping entries (keep unique by start date)
  const unique = entries.filter((e, i, arr) =>
    arr.findIndex((x) => x.startDate === e.startDate && x.endDate === e.endDate) === i
  );

  return unique.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

/**
 * Calculate total years of experience accounting for overlapping periods.
 */
function calculateTotalYears(entries: ResumeExperienceEntry[]): number {
  if (entries.length === 0) return 0;

  // Convert to sorted intervals
  const intervals = entries
    .map((e) => ({
      start: new Date(e.startDate).getTime(),
      end: e.endDate === "Present" ? Date.now() : new Date(e.endDate).getTime(),
    }))
    .sort((a, b) => a.start - b.start);

  // Merge overlapping intervals
  const merged: { start: number; end: number }[] = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const prev = merged[merged.length - 1];
    if (intervals[i].start <= prev.end) {
      prev.end = Math.max(prev.end, intervals[i].end);
    } else {
      merged.push(intervals[i]);
    }
  }

  // Sum total duration
  const totalMs = merged.reduce((sum, iv) => sum + (iv.end - iv.start), 0);
  return Math.round((totalMs / (1000 * 60 * 60 * 24 * 365.25)) * 10) / 10;
}

/**
 * Engine: Experience Level Matching.
 * Parses years-of-experience requirements from the JD, extracts date ranges
 * from the resume, and determines if the candidate is a match, under-qualified,
 * or over-qualified for the role.
 * Pure TypeScript — no external APIs needed.
 */
export function runExperienceMatchingEngine(
  resumeText: string,
  jobDescription: string
): ExperienceMatchResult {
  const jdRequirements = parseJDExperienceRequirements(jobDescription);
  const resumeEntries = parseResumeExperience(resumeText);
  const totalYears = calculateTotalYears(resumeEntries);
  const jdSeniority = detectJDSeniority(jobDescription);

  // Evaluate each JD requirement
  const requirementMatches = jdRequirements.map((req) => {
    const gap = totalYears - req.minYears;
    let status: "meets" | "exceeds" | "below";

    if (gap >= 3) {
      status = "exceeds";
    } else if (gap >= -1) {
      // Within 1 year below is still a reasonable match
      status = "meets";
    } else {
      status = "below";
    }

    return {
      requirement: req,
      candidateYears: totalYears,
      gap,
      status,
    };
  });

  // Overall fit assessment
  let overallFit: ExperienceMatchResult["overallFit"];
  const belowCount = requirementMatches.filter((m) => m.status === "below").length;
  const exceedsCount = requirementMatches.filter((m) => m.status === "exceeds").length;

  if (jdRequirements.length === 0) {
    overallFit = "no_data";
  } else if (belowCount > 0) {
    overallFit = "under_qualified";
  } else if (exceedsCount > 0 && exceedsCount === requirementMatches.length) {
    overallFit = "over_qualified";
  } else {
    overallFit = "good_match";
  }

  // Detect candidate's seniority from resume
  let candidateSeniority = "unknown";
  if (totalYears >= 10) candidateSeniority = "senior";
  else if (totalYears >= 5) candidateSeniority = "mid-senior";
  else if (totalYears >= 2) candidateSeniority = "mid";
  else if (totalYears >= 0.5) candidateSeniority = "entry";
  else candidateSeniority = "entry";

  // Score
  let score: number;
  if (jdRequirements.length === 0) {
    // No experience requirements found, score based on resume data presence
    score = resumeEntries.length > 0 ? 70 : 40;
  } else {
    // Score based on how well requirements are met
    const meetsCount = requirementMatches.filter((m) => m.status === "meets").length;
    const meetRate = (meetsCount + exceedsCount * 0.8) / requirementMatches.length;
    score = Math.round(meetRate * 100);
  }

  return {
    jdRequirements,
    resumeEntries,
    totalYears,
    jdSeniority,
    candidateSeniority,
    requirementMatches,
    overallFit,
    score,
  };
}
