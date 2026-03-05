import type { ActionVerbAnalysisResult, VerbInstance, WeakPhraseInstance } from "@/types/evaluation";

/* ── Action verbs categorized by type ── */

const VERB_CATEGORIES: Record<string, Set<string>> = {
  leadership: new Set([
    "led", "managed", "directed", "headed", "oversaw", "supervised",
    "coordinated", "orchestrated", "spearheaded", "championed", "mentored",
    "coached", "delegated", "mobilized", "guided", "inspired", "empowered",
  ]),
  achievement: new Set([
    "achieved", "attained", "earned", "exceeded", "surpassed", "won",
    "awarded", "captured", "secured", "delivered", "completed", "accomplished",
  ]),
  creation: new Set([
    "built", "created", "designed", "developed", "engineered", "established",
    "founded", "implemented", "launched", "pioneered", "introduced", "initiated",
    "invented", "conceptualized", "prototyped", "constructed", "assembled",
    "formulated", "devised",
  ]),
  optimization: new Set([
    "improved", "increased", "enhanced", "optimized", "streamlined",
    "accelerated", "boosted", "elevated", "maximized", "minimized",
    "reduced", "decreased", "cut", "saved", "eliminated", "consolidated",
    "revamped", "modernized", "refactored", "upgraded", "transformed",
    "simplified", "standardized",
  ]),
  analysis: new Set([
    "analyzed", "assessed", "evaluated", "identified", "investigated",
    "researched", "discovered", "diagnosed", "audited", "benchmarked",
    "forecasted", "mapped", "measured", "quantified", "surveyed", "studied",
  ]),
  communication: new Set([
    "presented", "published", "communicated", "collaborated", "facilitated",
    "negotiated", "advocated", "influenced", "persuaded", "authored",
    "documented", "trained", "educated", "briefed", "liaised", "partnered",
  ]),
  technical: new Set([
    "architected", "automated", "configured", "debugged", "deployed",
    "integrated", "migrated", "scaled", "shipped", "tested", "validated",
    "containerized", "provisioned", "instrumented", "monitored", "programmed",
    "coded", "compiled", "scripted", "maintained", "troubleshot", "patched",
  ]),
  execution: new Set([
    "executed", "produced", "generated", "resolved", "solved",
    "processed", "organized", "structured", "scheduled", "prioritized",
    "administered", "operated", "handled", "allocated",
  ]),
};

/* ── All strong verbs flattened ── */

const ALL_STRONG_VERBS = new Set<string>();
for (const verbs of Object.values(VERB_CATEGORIES)) {
  for (const v of verbs) ALL_STRONG_VERBS.add(v);
}

/* ── Weak / passive phrase patterns with alternatives ── */

const WEAK_PHRASE_MAP: { pattern: RegExp; phrase: string; alternatives: string[] }[] = [
  {
    pattern: /^responsible\s+for\b/i,
    phrase: "Responsible for",
    alternatives: ["Led", "Managed", "Directed", "Oversaw"],
  },
  {
    pattern: /^helped\s+(to\s+)?/i,
    phrase: "Helped",
    alternatives: ["Contributed to", "Facilitated", "Enabled", "Supported by"],
  },
  {
    pattern: /^assisted\s+(with|in)\b/i,
    phrase: "Assisted with",
    alternatives: ["Collaborated on", "Contributed to", "Supported"],
  },
  {
    pattern: /^participated\s+in\b/i,
    phrase: "Participated in",
    alternatives: ["Contributed to", "Engaged in", "Collaborated on"],
  },
  {
    pattern: /^involved\s+(in|with)\b/i,
    phrase: "Involved in",
    alternatives: ["Drove", "Contributed to", "Executed", "Delivered"],
  },
  {
    pattern: /^worked\s+on\b/i,
    phrase: "Worked on",
    alternatives: ["Developed", "Built", "Delivered", "Engineered"],
  },
  {
    pattern: /^tasked\s+with\b/i,
    phrase: "Tasked with",
    alternatives: ["Executed", "Delivered", "Implemented", "Completed"],
  },
  {
    pattern: /^assigned\s+to\b/i,
    phrase: "Assigned to",
    alternatives: ["Owned", "Drove", "Led", "Spearheaded"],
  },
  {
    pattern: /^supported\b/i,
    phrase: "Supported",
    alternatives: ["Enabled", "Facilitated", "Partnered with", "Contributed to"],
  },
  {
    pattern: /^handled\b/i,
    phrase: "Handled",
    alternatives: ["Managed", "Resolved", "Processed", "Administered"],
  },
  {
    pattern: /^dealt\s+with\b/i,
    phrase: "Dealt with",
    alternatives: ["Resolved", "Addressed", "Managed", "Navigated"],
  },
  {
    pattern: /^utilized\b/i,
    phrase: "Utilized",
    alternatives: ["Leveraged", "Applied", "Employed", "Implemented"],
  },
  {
    pattern: /^maintained\b/i,
    phrase: "Maintained",
    alternatives: ["Sustained", "Ensured uptime of", "Managed", "Preserved"],
  },
  {
    pattern: /^did\b/i,
    phrase: "Did",
    alternatives: ["Executed", "Completed", "Performed", "Delivered"],
  },
  {
    pattern: /^made\b/i,
    phrase: "Made",
    alternatives: ["Created", "Developed", "Produced", "Engineered"],
  },
];

/**
 * Extract bullet points from resume text.
 */
function extractBullets(text: string): string[] {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const bullets: string[] = [];

  for (const line of lines) {
    if (/^[•\-–—*▪▸►]\s+/.test(line)) {
      bullets.push(line.replace(/^[•\-–—*▪▸►]\s+/, "").trim());
      continue;
    }
    if (/^\d+[.)]\s+/.test(line)) {
      bullets.push(line.replace(/^\d+[.)]\s+/, "").trim());
      continue;
    }
    const firstWord = line.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    if (firstWord && line.length >= 20 && line.length <= 300) {
      // Check if it starts with any known verb (strong or weak)
      if (ALL_STRONG_VERBS.has(firstWord) || WEAK_PHRASE_MAP.some((w) => w.pattern.test(line))) {
        bullets.push(line);
      }
    }
  }

  return bullets;
}

/**
 * Classify a verb into its category.
 */
function classifyVerb(verb: string): string {
  for (const [category, verbs] of Object.entries(VERB_CATEGORIES)) {
    if (verbs.has(verb)) return category;
  }
  return "other";
}

/**
 * Engine: Action Verb Analysis.
 * Deep analysis of action verbs used across resume bullet points.
 * Categorizes verbs, detects repetition, identifies weak phrasing,
 * and provides actionable rewording suggestions.
 * Pure TypeScript — no external APIs needed.
 */
export function runActionVerbAnalysisEngine(
  resumeText: string
): ActionVerbAnalysisResult {
  const rawBullets = extractBullets(resumeText);

  const verbInstances: VerbInstance[] = [];
  const weakPhrases: WeakPhraseInstance[] = [];
  const verbFrequency: Record<string, number> = {};
  const categoryCount: Record<string, number> = {};

  for (const bullet of rawBullets) {
    const firstWord = bullet.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");

    // Check for weak phrasing first
    let isWeak = false;
    for (const entry of WEAK_PHRASE_MAP) {
      if (entry.pattern.test(bullet)) {
        weakPhrases.push({
          text: bullet.slice(0, 200),
          weakPhrase: entry.phrase,
          alternatives: entry.alternatives,
        });
        isWeak = true;
        break;
      }
    }

    if (isWeak) continue;

    // Check for strong verbs
    if (firstWord && ALL_STRONG_VERBS.has(firstWord)) {
      const category = classifyVerb(firstWord);
      verbInstances.push({
        verb: firstWord,
        category,
        text: bullet.slice(0, 200),
      });
      verbFrequency[firstWord] = (verbFrequency[firstWord] || 0) + 1;
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    }
  }

  // Calculate verb diversity
  const totalVerbsUsed = verbInstances.length;
  const uniqueVerbs = Object.keys(verbFrequency).length;
  const verbDiversity = totalVerbsUsed > 0 ? uniqueVerbs / totalVerbsUsed : 0;

  // Find overused verbs (used 3+ times)
  const overusedVerbs = Object.entries(verbFrequency)
    .filter(([, count]) => count >= 3)
    .sort(([, a], [, b]) => b - a)
    .map(([verb, count]) => ({ verb, count }));

  // Category breakdown (sorted by count descending)
  const categoryBreakdown = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .map(([category, count]) => ({ category, count }));

  // Top verbs (sorted by frequency)
  const topVerbs = Object.entries(verbFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([verb, count]) => ({ verb, count }));

  // Score: diversity (40%) + strong verb rate (30%) + low weak phrase rate (30%)
  const totalBullets = rawBullets.length;
  const strongRate = totalBullets > 0 ? totalVerbsUsed / totalBullets : 0;
  const weakRate = totalBullets > 0 ? weakPhrases.length / totalBullets : 0;
  const diversityScore = Math.min(verbDiversity * 1.5, 1); // cap at 1, reward diversity

  const score = Math.round(
    diversityScore * 40 +
    Math.min(strongRate, 1) * 30 +
    Math.max(0, 1 - weakRate * 3) * 30
  );

  return {
    verbInstances,
    weakPhrases,
    verbFrequency,
    categoryBreakdown,
    topVerbs,
    overusedVerbs,
    totalBullets,
    strongVerbCount: totalVerbsUsed,
    weakPhraseCount: weakPhrases.length,
    uniqueVerbCount: uniqueVerbs,
    verbDiversity,
    score,
  };
}
