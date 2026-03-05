import type { BulletAnalysis, ResumeQualityResult } from "@/types/evaluation";

/* ── Strong action verbs categorized by type ── */

const ACTION_VERBS = new Set([
  // Leadership / management
  "led", "managed", "directed", "headed", "oversaw", "supervised", "coordinated",
  "orchestrated", "spearheaded", "championed", "mentored", "coached",
  // Achievement / creation
  "achieved", "built", "created", "designed", "developed", "engineered",
  "established", "founded", "implemented", "launched", "pioneered",
  "introduced", "initiated",
  // Improvement / optimization
  "improved", "increased", "enhanced", "optimized", "streamlined", "accelerated",
  "boosted", "elevated", "maximized", "minimized", "reduced", "decreased",
  "cut", "saved", "eliminated", "consolidated", "revamped", "modernized",
  "refactored", "upgraded", "transformed",
  // Analysis / research
  "analyzed", "assessed", "evaluated", "identified", "investigated",
  "researched", "discovered", "diagnosed", "audited", "benchmarked",
  // Communication / collaboration
  "presented", "published", "communicated", "collaborated", "facilitated",
  "negotiated", "advocated", "influenced", "persuaded",
  // Technical execution
  "architected", "automated", "configured", "debugged", "deployed",
  "integrated", "migrated", "scaled", "shipped", "tested", "validated",
  "containerized", "provisioned", "instrumented", "monitored",
  // Delivery
  "delivered", "executed", "completed", "produced", "generated",
  "resolved", "solved",
]);

/* ── Weak / passive verb patterns ── */

const WEAK_PATTERNS = [
  /^responsible\s+for\b/i,
  /^helped\s+(to\s+)?/i,
  /^assisted\s+(with|in)\b/i,
  /^participated\s+in\b/i,
  /^involved\s+(in|with)\b/i,
  /^worked\s+on\b/i,
  /^tasked\s+with\b/i,
  /^assigned\s+to\b/i,
  /^supported\b/i,
  /^handled\b/i,
  /^dealt\s+with\b/i,
  /^utilized\b/i,
];

/* ── Metric / quantification patterns ── */

const METRIC_PATTERNS = [
  // Percentages
  /\b\d+\.?\d*\s*%/g,
  // Dollar amounts
  /\$\s*\d[\d,]*\.?\d*/g,
  // Numbers with units
  /\b\d[\d,]*\+?\s*(users|customers|clients|employees|team\s+members|engineers|developers|people|requests|transactions|records|orders|tickets|events)/gi,
  // Time/speed improvements
  /\b\d+\.?\d*x\b/g,
  // Revenue / metrics
  /\b\d[\d,]*\.?\d*\s*(million|billion|M|B|K|k)\b/g,
  // Rankings
  /\b(top\s+\d+%?)\b/gi,
  // Specific numbers (3+ digits suggest a metric)
  /\b\d{3,}[\d,]*\b/g,
  // Ratios and rates
  /\b\d+\.?\d*\s*(per|\/)\s*(day|week|month|hour|second|minute|sprint|quarter)/gi,
  // X to Y improvements
  /\bfrom\s+\d+.*?to\s+\d+/gi,
  // Reductions / increases with numbers
  /\b(reduced?|increased?|improved?|decreased?|grew|cut|saved|boosted)\b.*?\b\d+/gi,
];

/**
 * Extract bullet points from resume text.
 * Looks for lines starting with •, -, *, or numbered lists.
 * Also catches lines that look like accomplishment statements.
 */
function extractBullets(text: string): string[] {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const bullets: string[] = [];

  for (const line of lines) {
    // Explicit bullet markers
    if (/^[•\-–—*▪▸►]\s+/.test(line)) {
      bullets.push(line.replace(/^[•\-–—*▪▸►]\s+/, "").trim());
      continue;
    }
    // Numbered bullets
    if (/^\d+[.)]\s+/.test(line)) {
      bullets.push(line.replace(/^\d+[.)]\s+/, "").trim());
      continue;
    }
    // Lines that start with an action verb (likely an accomplishment)
    const firstWord = line.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    if (
      firstWord &&
      ACTION_VERBS.has(firstWord) &&
      line.length >= 20 &&
      line.length <= 300
    ) {
      bullets.push(line);
    }
  }

  return bullets;
}

/**
 * Detect the action verb at the start of a bullet.
 */
function detectActionVerb(bullet: string): string | null {
  const firstWord = bullet
    .split(/\s+/)[0]
    ?.toLowerCase()
    .replace(/[^a-z]/g, "");
  if (firstWord && ACTION_VERBS.has(firstWord)) {
    return firstWord;
  }
  return null;
}

/**
 * Check if a bullet uses weak/passive phrasing.
 */
function isWeakPhrasing(bullet: string): boolean {
  return WEAK_PATTERNS.some((p) => p.test(bullet));
}

/**
 * Extract quantified metrics from a bullet.
 */
function extractMetrics(bullet: string): string[] {
  const metrics: string[] = [];
  for (const pattern of METRIC_PATTERNS) {
    const matches = bullet.matchAll(new RegExp(pattern));
    for (const m of matches) {
      metrics.push(m[0].trim());
    }
  }
  // Deduplicate
  return [...new Set(metrics)];
}

/**
 * Rate a single bullet point.
 */
function rateBullet(bullet: string): BulletAnalysis {
  const actionVerb = detectActionVerb(bullet);
  const hasActionVerb = actionVerb !== null && !isWeakPhrasing(bullet);
  const metrics = extractMetrics(bullet);
  const hasMetrics = metrics.length > 0;

  let rating: BulletAnalysis["rating"];
  if (hasActionVerb && hasMetrics) {
    rating = "strong";
  } else if (hasActionVerb || hasMetrics) {
    rating = "moderate";
  } else {
    rating = "weak";
  }

  return {
    text: bullet.slice(0, 200),
    hasMetrics,
    hasActionVerb,
    actionVerb: hasActionVerb ? actionVerb : null,
    metrics,
    rating,
  };
}

/**
 * Engine: Resume Quality / Impact Checker.
 * Analyzes bullet points for metrics, action verbs, and impact language.
 * Pure TypeScript — no external APIs needed.
 */
export function runResumeQualityEngine(
  resumeText: string
): ResumeQualityResult {
  const rawBullets = extractBullets(resumeText);
  const bullets = rawBullets.map(rateBullet);

  const totalBullets = bullets.length;
  const bulletsWithMetrics = bullets.filter((b) => b.hasMetrics).length;
  const bulletsWithActionVerbs = bullets.filter((b) => b.hasActionVerb).length;

  const metricsRate = totalBullets > 0 ? bulletsWithMetrics / totalBullets : 0;
  const actionVerbRate =
    totalBullets > 0 ? bulletsWithActionVerbs / totalBullets : 0;

  // Overall rating
  let overallRating: ResumeQualityResult["overallRating"];
  if (metricsRate >= 0.4 && actionVerbRate >= 0.6) {
    overallRating = "strong";
  } else if (metricsRate >= 0.2 || actionVerbRate >= 0.4) {
    overallRating = "moderate";
  } else {
    overallRating = "weak";
  }

  // Score: weighted by metrics (60%) and action verbs (40%)
  const score = Math.round(metricsRate * 60 + actionVerbRate * 40);

  return {
    bullets,
    totalBullets,
    bulletsWithMetrics,
    bulletsWithActionVerbs,
    metricsRate,
    actionVerbRate,
    overallRating,
    score,
  };
}
