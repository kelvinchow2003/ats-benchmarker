import type { LegacyResult } from "@/types/evaluation";

/* ── Stop words to filter out common English words ── */
const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","it","as","be","was","were","been","being","have","has",
  "had","do","does","did","will","would","shall","should","may","might",
  "can","could","that","this","these","those","i","you","he","she","we",
  "they","me","him","her","us","them","my","your","his","its","our","their",
  "what","which","who","whom","where","when","how","not","no","nor","if",
  "then","than","so","up","out","about","into","over","after","before",
  "between","under","above","such","each","every","all","any","both","few",
  "more","most","other","some","only","same","just","also","very","much",
  "many","well","back","even","still","too","here","there","are","am",
  "able","across","actually","almost","already","always","among","around",
  "because","become","becomes","below","best","better","beyond","cannot",
  "certain","certainly","come","comes","contain","containing","could",
  "currently","during","else","enough","especially","etc","ever","example",
  "experience","find","first","following","found","get","give","given",
  "goes","going","good","great","however","include","including","keep",
  "know","known","last","least","less","let","like","likely","long","look",
  "made","make","makes","making","might","must","need","needs","never",
  "new","next","nothing","now","number","often","old","once","one","ones",
  "part","per","perhaps","please","possible","rather","really","right",
  "said","say","says","second","see","seem","seems","set","several","show",
  "since","something","take","tell","things","think","third","though",
  "three","through","thus","together","toward","try","turn","two","upon",
  "use","used","using","way","whether","while","within","without","work",
  "working","works","year","years","yet","job","role","team","company",
  "looking","join","ideal","candidate","responsibilities","requirements",
  "qualifications","position","opportunity","apply","application",
]);

/* ── Compound phrase patterns (preserved as single tokens) ── */
const COMPOUND_PATTERNS = [
  /\b(machine\s+learning)\b/gi,
  /\b(deep\s+learning)\b/gi,
  /\b(natural\s+language\s+processing)\b/gi,
  /\b(computer\s+vision)\b/gi,
  /\b(data\s+science)\b/gi,
  /\b(data\s+engineering)\b/gi,
  /\b(data\s+analysis)\b/gi,
  /\b(data\s+analytics)\b/gi,
  /\b(project\s+management)\b/gi,
  /\b(product\s+management)\b/gi,
  /\b(version\s+control)\b/gi,
  /\b(ci\s*\/?\s*cd)\b/gi,
  /\b(rest\s+api)\b/gi,
  /\b(unit\s+test(?:ing|s)?)\b/gi,
  /\b(full[\s-]stack)\b/gi,
  /\b(front[\s-]end)\b/gi,
  /\b(back[\s-]end)\b/gi,
  /\b(user\s+experience)\b/gi,
  /\b(user\s+interface)\b/gi,
  /\b(cloud\s+computing)\b/gi,
  /\b(software\s+engineer(?:ing)?)\b/gi,
  /\b(cross[\s-]functional)\b/gi,
  /\b(problem[\s-]solving)\b/gi,
  /\b(communication\s+skills)\b/gi,
  /\b(time\s+management)\b/gi,
  /\b(agile\s+methodology)\b/gi,
  /\b(test[\s-]driven\s+development)\b/gi,
  /\b(object[\s-]oriented)\b/gi,
  /\b(open\s+source)\b/gi,
  /\b(supply\s+chain)\b/gi,
  /\b(customer\s+service)\b/gi,
  /\b(business\s+intelligence)\b/gi,
  /\b(quality\s+assurance)\b/gi,
];

/**
 * Extract meaningful keywords from text, preserving compound phrases.
 */
function extractKeywords(text: string): string[] {
  const normalized = text.toLowerCase();
  const keywords = new Set<string>();

  // 1. Extract compound phrases first
  const compoundsFound: string[] = [];
  for (const pattern of COMPOUND_PATTERNS) {
    const matches = normalized.matchAll(new RegExp(pattern));
    for (const m of matches) {
      const phrase = m[1].replace(/\s+/g, " ").trim();
      keywords.add(phrase);
      compoundsFound.push(phrase);
    }
  }

  // 2. Extract single words (skip those already in compounds)
  const words = normalized
    .replace(/[^a-z0-9#+.\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);

  for (const word of words) {
    if (STOP_WORDS.has(word)) continue;
    // Skip if word is part of a compound already captured
    const inCompound = compoundsFound.some((c) => c.includes(word));
    if (inCompound && word.length < 5) continue;
    keywords.add(word);
  }

  return Array.from(keywords);
}

/**
 * Check if a keyword exists in resume text using word-boundary matching.
 */
function keywordInText(keyword: string, text: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "i");
  return regex.test(text);
}

/**
 * Engine 1: Legacy Keyword ATS scoring.
 * Pure TypeScript — no external APIs needed.
 */
export function runLegacyEngine(
  resumeText: string,
  jobDescription: string
): LegacyResult {
  const jdKeywords = extractKeywords(jobDescription);
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of jdKeywords) {
    if (keywordInText(kw, resumeText)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const totalJDKeywords = jdKeywords.length;
  const matchRate = totalJDKeywords > 0 ? matchedKeywords.length / totalJDKeywords : 0;
  const score = Math.round(matchRate * 100);

  return {
    score,
    matchedKeywords,
    missingKeywords,
    totalJDKeywords,
    matchRate,
  };
}
