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

/* ── Action Verb Analysis ── */

export interface VerbInstance {
  verb: string;
  category: string;
  text: string;
}

export interface WeakPhraseInstance {
  text: string;
  weakPhrase: string;
  alternatives: string[];
}

export interface ActionVerbAnalysisResult {
  verbInstances: VerbInstance[];
  weakPhrases: WeakPhraseInstance[];
  verbFrequency: Record<string, number>;
  categoryBreakdown: { category: string; count: number }[];
  topVerbs: { verb: string; count: number }[];
  overusedVerbs: { verb: string; count: number }[];
  totalBullets: number;
  strongVerbCount: number;
  weakPhraseCount: number;
  uniqueVerbCount: number;
  verbDiversity: number;
  score: number;
}

/* ── Resume Structure Scoring ── */

export interface SectionPresence {
  name: string;
  found: boolean;
  importance: "critical" | "important" | "optional";
  idealOrder: number;
  actualOrder: number;
}

export interface FormattingIssue {
  type: string;
  severity: "warning" | "info";
  message: string;
}

export interface StructureScoringResult {
  sections: SectionPresence[];
  criticalSectionsFound: number;
  criticalSectionsTotal: number;
  importantSectionsFound: number;
  importantSectionsTotal: number;
  optionalSectionsFound: number;
  estimatedPages: number;
  totalWords: number;
  totalLines: number;
  bulletCount: number;
  avgLineLength: number;
  lengthAssessment: "too_short" | "ideal" | "slightly_long" | "too_long";
  formattingIssues: FormattingIssue[];
  score: number;
}

/* ── Experience Level Matching ── */

export interface JDExperienceRequirement {
  minYears: number;
  maxYears: number | null;
  field: string | null;
  rawText: string;
}

export interface ResumeExperienceEntry {
  rawText: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  durationYears: number;
  isCurrent: boolean;
}

export interface ExperienceRequirementMatch {
  requirement: JDExperienceRequirement;
  candidateYears: number;
  gap: number;
  status: "meets" | "exceeds" | "below";
}

export interface ExperienceMatchResult {
  jdRequirements: JDExperienceRequirement[];
  resumeEntries: ResumeExperienceEntry[];
  totalYears: number;
  jdSeniority: string;
  candidateSeniority: string;
  requirementMatches: ExperienceRequirementMatch[];
  overallFit: "good_match" | "under_qualified" | "over_qualified" | "no_data";
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
