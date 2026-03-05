/* ── Engine Result Types ── */

export interface LegacyResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  totalJDKeywords: number;
  matchRate: number;
  synonymMatches?: Record<string, string>;
}

/* ── Requirement Priority Parsing ── */

export type RequirementPriority = "required" | "preferred" | "bonus";

export interface PrioritizedRequirement {
  keyword: string;
  priority: RequirementPriority;
  matched: boolean;
  context: string;
}

export interface RequirementPriorityResult {
  requirements: PrioritizedRequirement[];
  requiredMatchRate: number;
  preferredMatchRate: number;
  bonusMatchRate: number;
  weightedScore: number;
}

/* ── Resume Quality / Impact Analysis ── */

export interface BulletAnalysis {
  text: string;
  hasMetrics: boolean;
  hasActionVerb: boolean;
  actionVerb: string | null;
  metrics: string[];
  rating: "strong" | "moderate" | "weak";
}

export interface ResumeQualityResult {
  bullets: BulletAnalysis[];
  totalBullets: number;
  bulletsWithMetrics: number;
  bulletsWithActionVerbs: number;
  metricsRate: number;
  actionVerbRate: number;
  overallRating: "strong" | "moderate" | "weak";
  score: number;
}

export interface SemanticResult {
  score: number;
  rawSimilarity: number;
  interpretation: string;
}

export interface AIRecruiterResult {
  score: number;
  verdict: "Strong Match" | "Moderate Match" | "Weak Match" | "Not a Fit";
  feedback: string;
  pros: string[];
  cons: string[];
}

/* ── Composite ── */

export interface CompositeResult {
  legacy: LegacyResult;
  semantic: SemanticResult;
  aiRecruiter: AIRecruiterResult;
  compositeScore: number;
}

/* ── Engine Execution State ── */

export type EngineStatus = "idle" | "running" | "done" | "error";

export interface EngineState<T> {
  status: EngineStatus;
  result: T | null;
  error: string | null;
}

/* ── API Request / Response ── */

export interface EngineRequest {
  resumeText: string;
  jobDescription: string;
}

export interface ParsePDFResponse {
  text: string;
  pageCount: number;
}

/* ── Database Row (matches Supabase schema) ── */

export interface EvaluationRow {
  id: string;
  user_id: string;
  resume_id: string | null;
  job_description: string;
  legacy_score: number | null;
  legacy_matched: string[] | null;
  legacy_missing: string[] | null;
  legacy_details: LegacyResult | null;
  semantic_score: number | null;
  semantic_details: SemanticResult | null;
  ai_score: number | null;
  ai_verdict: string | null;
  ai_feedback: string | null;
  ai_pros: string[] | null;
  ai_cons: string[] | null;
  ai_details: AIRecruiterResult | null;
  composite_score: number | null;
  label: string | null;
  created_at: string;
}

export interface ResumeRow {
  id: string;
  user_id: string;
  file_name: string;
  parsed_text: string;
  created_at: string;
}

export interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

/* ── Resume Improvement Suggestions ── */

export interface SuggestionItem {
  section: string;
  currentText: string;
  suggestedRewrite: string;
  reasoning: string;
  priority: "high" | "medium" | "low";
}

export interface SuggestionsResult {
  suggestions: SuggestionItem[];
  overallStrategy: string;
}

/* ── Keyword Placement Suggestions ── */

export interface KeywordPlacement {
  keyword: string;
  importance: "critical" | "important" | "nice-to-have";
  suggestedSection: string;
  examplePhrase: string;
}

/* ── Section-by-Section Scoring ── */

export interface SectionScore {
  sectionName: string;
  score: number;
  feedback: string;
  relevantKeywords: string[];
  missingKeywords: string[];
}

export interface SectionScoringResult {
  sections: SectionScore[];
  strongestSection: string;
  weakestSection: string;
}
