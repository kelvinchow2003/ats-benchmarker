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
  // Additional compounds
  /\b(web\s+development)\b/gi,
  /\b(mobile\s+(?:app|application)\s+development)\b/gi,
  /\b(mobile\s+development)\b/gi,
  /\b(system\s+design)\b/gi,
  /\b(api\s+development)\b/gi,
  /\b(api\s+design)\b/gi,
  /\b(database\s+management)\b/gi,
  /\b(database\s+design)\b/gi,
  /\b(software\s+development)\b/gi,
  /\b(software\s+architecture)\b/gi,
  /\b(technical\s+leadership)\b/gi,
  /\b(technical\s+writing)\b/gi,
  /\b(code\s+review)\b/gi,
  /\b(pair\s+programming)\b/gi,
  /\b(distributed\s+systems?)\b/gi,
  /\b(event[\s-]driven)\b/gi,
  /\b(real[\s-]time)\b/gi,
  /\b(high\s+availability)\b/gi,
  /\b(load\s+balancing)\b/gi,
  /\b(continuous\s+integration)\b/gi,
  /\b(continuous\s+deployment)\b/gi,
  /\b(continuous\s+delivery)\b/gi,
  /\b(responsive\s+design)\b/gi,
  /\b(design\s+system)\b/gi,
  /\b(a[\s/]?b\s+testing)\b/gi,
  /\b(performance\s+optimization)\b/gi,
  /\b(search\s+engine\s+optimization)\b/gi,
  /\b(content\s+management)\b/gi,
  /\b(user\s+research)\b/gi,
  /\b(data\s+visualization)\b/gi,
  /\b(data\s+modeling)\b/gi,
  /\b(data\s+pipeline)\b/gi,
  /\b(data\s+warehouse)\b/gi,
  /\b(feature\s+engineering)\b/gi,
  /\b(model\s+training)\b/gi,
  /\b(model\s+deployment)\b/gi,
];

/* ── Synonym / Acronym Map ──
   Each entry maps a canonical term to all its known variants.
   Matching checks if the resume contains ANY variant for a JD keyword. */
const SYNONYM_MAP: Record<string, string[]> = {
  // Languages
  "javascript":   ["js", "es6", "es2015", "ecmascript"],
  "typescript":   ["ts"],
  "python":       ["py", "python3"],
  "golang":       ["go"],
  "c#":           ["csharp", "c-sharp", "dotnet", ".net"],
  "c++":          ["cpp"],
  "ruby":         ["rb"],
  // Frontend
  "react":        ["reactjs", "react.js"],
  "angular":      ["angularjs", "angular.js"],
  "vue":          ["vuejs", "vue.js"],
  "next.js":      ["nextjs", "next"],
  "nuxt":         ["nuxtjs", "nuxt.js"],
  "tailwind":     ["tailwindcss", "tailwind css"],
  // Backend
  "node.js":      ["nodejs", "node"],
  "express":      ["expressjs", "express.js"],
  "django":       ["drf", "django rest framework"],
  "spring":       ["spring boot", "springboot"],
  "fastapi":      ["fast api"],
  // Databases
  "postgresql":   ["postgres", "psql"],
  "mongodb":      ["mongo"],
  "mysql":        ["mariadb"],
  "dynamodb":     ["dynamo db"],
  "elasticsearch":["elastic", "opensearch"],
  "sqlite":       ["sqlite3"],
  // Cloud / DevOps
  "aws":          ["amazon web services", "amazon cloud"],
  "gcp":          ["google cloud", "google cloud platform"],
  "azure":        ["microsoft azure", "ms azure"],
  "kubernetes":   ["k8s", "kube"],
  "docker":       ["containerization", "containers"],
  "terraform":    ["iac", "infrastructure as code"],
  "ci/cd":        ["cicd", "ci cd", "continuous integration", "continuous deployment", "continuous delivery"],
  "github actions":["gh actions"],
  // Data / ML
  "machine learning": ["ml"],
  "deep learning":    ["dl"],
  "natural language processing": ["nlp"],
  "computer vision":  ["cv"],
  "artificial intelligence": ["ai"],
  "tensorflow":   ["tf"],
  "pytorch":      ["torch"],
  "pandas":       ["pd"],
  "numpy":        ["np"],
  "scikit-learn": ["sklearn"],
  "data science": ["data analytics", "data analysis"],
  "sql":          ["structured query language"],
  "nosql":        ["no-sql", "non-relational"],
  // Tools / Methods
  "git":          ["version control", "github", "gitlab", "bitbucket"],
  "agile":        ["scrum", "kanban", "sprint"],
  "rest api":     ["restful", "restful api"],
  "graphql":      ["gql"],
  "microservices":["micro-services", "service-oriented", "soa"],
  "ui":           ["user interface"],
  "ux":           ["user experience"],
  "qa":           ["quality assurance", "quality engineering"],
  "tdd":          ["test-driven development", "test driven development"],
  "oop":          ["object-oriented programming", "object oriented"],
  "sre":          ["site reliability engineering", "site reliability"],
  "devops":       ["dev ops"],
  "full-stack":   ["fullstack", "full stack"],
  "front-end":    ["frontend", "front end"],
  "back-end":     ["backend", "back end"],
  "oauth":        ["oauth2", "oauth 2.0"],
  "jwt":          ["json web token", "json web tokens"],
  "sso":          ["single sign-on", "single sign on"],
  // Modern frameworks / runtimes
  "remix":        ["remix.run"],
  "svelte":       ["sveltekit", "svelte kit"],
  "astro":        ["astro.build"],
  "deno":         ["deno.land"],
  "bun":          ["bunjs"],
  "vite":         ["vitejs"],
  // Modern tools / services
  "supabase":     ["supa base"],
  "prisma":       ["prisma orm"],
  "drizzle":      ["drizzle orm"],
  "trpc":         ["t3 stack"],
  "redis":        ["elasticache", "memorydb"],
  "kafka":        ["apache kafka", "confluent"],
  "rabbitmq":     ["rabbit mq", "amqp"],
  // Testing
  "jest":         ["jestjs"],
  "cypress":      ["cypress.io"],
  "playwright":   ["pw"],
  "vitest":       ["vitestjs"],
  "selenium":     ["webdriver"],
  // Design / UI
  "figma":        ["figma design"],
  "sketch":       ["sketch app"],
  "storybook":    ["storybookjs"],
  // Monitoring / observability
  "datadog":      ["data dog"],
  "grafana":      ["grafana cloud"],
  "prometheus":   ["prom"],
  "new relic":    ["newrelic"],
  "sentry":       ["sentry.io"],
  // Mobile
  "react native": ["react-native", "rn"],
  "flutter":      ["dart flutter"],
  "swift":        ["swiftui"],
  "kotlin":       ["kotlinx"],
  // Infrastructure
  "nginx":        ["engine x"],
  "linux":        ["unix", "ubuntu", "centos", "debian"],
  "ansible":      ["ansible playbook"],
  "pulumi":       ["pulumi iac"],
  "cloudformation": ["cfn", "aws cloudformation"],
  // Methodologies
  "responsive design": ["mobile-first", "mobile first"],
  "accessibility": ["a11y", "wcag", "aria"],
  "internationalization": ["i18n"],
  "localization": ["l10n"],
  "seo":          ["search engine optimization"],
};

/**
 * Build a reverse lookup: for any term (canonical or variant), get all synonyms.
 */
function getAllSynonyms(keyword: string): string[] {
  const lower = keyword.toLowerCase();

  // Check if it's a canonical key
  if (SYNONYM_MAP[lower]) {
    return [lower, ...SYNONYM_MAP[lower]];
  }

  // Check if it's a variant
  for (const [canonical, variants] of Object.entries(SYNONYM_MAP)) {
    if (variants.some((v) => v.toLowerCase() === lower)) {
      return [canonical, ...variants];
    }
  }

  return [lower];
}

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

  // 2. Build a set of all individual words that are part of detected compounds
  const wordsInCompounds = new Set<string>();
  for (const compound of compoundsFound) {
    for (const w of compound.split(/\s+/)) {
      wordsInCompounds.add(w);
    }
  }

  // 3. Extract single words (skip ALL words that are part of detected compounds)
  const words = normalized
    .replace(/[^a-z0-9#+.\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);

  for (const word of words) {
    if (STOP_WORDS.has(word)) continue;
    // Skip if this word is part of any detected compound phrase
    if (wordsInCompounds.has(word)) continue;
    keywords.add(word);
  }

  return Array.from(keywords);
}

/**
 * Test whether a single term exists in text.
 * Uses word boundaries for normal words, but handles special characters
 * (C#, C++, .NET, etc.) with lookahead/lookbehind or simple includes.
 */
function termInText(term: string, text: string): boolean {
  const lower = term.toLowerCase();
  const textLower = text.toLowerCase();

  // Special-case terms that break \b word boundaries
  if (lower === "c#" || lower === "csharp" || lower === "c-sharp") {
    return /\bc#/i.test(text) || /\bcsharp\b/i.test(text) || /\bc-sharp\b/i.test(text);
  }
  if (lower === "c++") {
    return /\bc\+\+/i.test(text);
  }
  if (lower === ".net" || lower === "dotnet") {
    return /\.net\b/i.test(text) || /\bdotnet\b/i.test(text);
  }
  if (lower === "node.js" || lower === "nodejs") {
    return /\bnode\.?js\b/i.test(text) || /\bnode\.js\b/i.test(text);
  }
  if (lower === "next.js" || lower === "nextjs") {
    return /\bnext\.?js\b/i.test(text);
  }
  if (lower === "vue.js" || lower === "vuejs") {
    return /\bvue\.?js\b/i.test(text);
  }
  if (lower === "react.js" || lower === "reactjs") {
    return /\breact\.?js\b/i.test(text) || /\breact\b/i.test(text);
  }
  if (lower === "express.js" || lower === "expressjs") {
    return /\bexpress\.?js\b/i.test(text) || /\bexpress\b/i.test(text);
  }
  if (lower === "nuxt.js" || lower === "nuxtjs") {
    return /\bnuxt\.?js\b/i.test(text);
  }

  // Standard word boundary matching
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // For short terms (2-3 chars), require case-insensitive exact boundary
  if (term.length <= 3) {
    return new RegExp(`(?:^|[\\s,;:()/])${escaped}(?:$|[\\s,;:()/])`, "i").test(` ${text} `);
  }
  return new RegExp(`\\b${escaped}\\b`, "i").test(textLower);
}

/**
 * Check if a keyword (or any of its synonyms) exists in resume text.
 * Returns the synonym that matched, or null if the keyword matched directly.
 */
function matchKeyword(
  keyword: string,
  text: string
): { matched: boolean; via: string | null } {
  // Direct match first
  if (termInText(keyword, text)) {
    return { matched: true, via: null };
  }

  // Synonym match
  const synonyms = getAllSynonyms(keyword);
  for (const syn of synonyms) {
    if (syn.toLowerCase() === keyword.toLowerCase()) continue;
    if (termInText(syn, text)) {
      return { matched: true, via: syn };
    }
  }

  return { matched: false, via: null };
}

/**
 * Engine 1: Legacy Keyword ATS scoring.
 * Pure TypeScript — no external APIs needed.
 * Includes synonym/acronym matching.
 */
export function runLegacyEngine(
  resumeText: string,
  jobDescription: string
): LegacyResult {
  const jdKeywords = extractKeywords(jobDescription);
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  const synonymMatches: Record<string, string> = {};

  for (const kw of jdKeywords) {
    const result = matchKeyword(kw, resumeText);
    if (result.matched) {
      matchedKeywords.push(kw);
      if (result.via) {
        synonymMatches[kw] = result.via;
      }
    } else {
      missingKeywords.push(kw);
    }
  }

  const totalJDKeywords = jdKeywords.length;
  const matchRate =
    totalJDKeywords > 0 ? matchedKeywords.length / totalJDKeywords : 0;
  const score = Math.round(matchRate * 100);

  return {
    score,
    matchedKeywords,
    missingKeywords,
    totalJDKeywords,
    matchRate,
    synonymMatches,
  };
}
