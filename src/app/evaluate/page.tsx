"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import UploadZone from "@/components/upload/UploadZone";
import ScoreCard from "@/components/results/ScoreCard";
import CompositeScore from "@/components/results/CompositeScore";
import KeywordGrid from "@/components/results/KeywordGrid";
import AIFeedbackPanel from "@/components/results/AIFeedbackPanel";
import SuggestionsPanel from "@/components/results/SuggestionsPanel";
import SectionScorePanel from "@/components/results/SectionScorePanel";
import RequirementPriorityPanel from "@/components/results/RequirementPriorityPanel";
import ResumeQualityPanel from "@/components/results/ResumeQualityPanel";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import type {
  LegacyResult,
  SemanticResult,
  AIRecruiterResult,
  EngineState,
  SuggestionsResult,
  SectionScoringResult,
  KeywordPlacement,
  RequirementPriorityResult,
  ResumeQualityResult,
} from "@/types/evaluation";
import {
  Cpu,
  Brain,
  Sparkles,
  BarChart3,
  Lightbulb,
  LayoutList,
  ListOrdered,
  Target,
  Loader2,
} from "lucide-react";

export default function EvaluatePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseStatus, setParseStatus] = useState<string | null>(null);

  const [legacy, setLegacy] = useState<EngineState<LegacyResult>>({
    status: "idle",
    result: null,
    error: null,
  });
  const [semantic, setSemantic] = useState<EngineState<SemanticResult>>({
    status: "idle",
    result: null,
    error: null,
  });
  const [ai, setAI] = useState<EngineState<AIRecruiterResult>>({
    status: "idle",
    result: null,
    error: null,
  });

  const [compositeScore, setCompositeScore] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [label, setLabel] = useState("");

  // Post-analysis states
  const [sectionScoring, setSectionScoring] = useState<
    EngineState<SectionScoringResult>
  >({ status: "idle", result: null, error: null });
  const [keywordPlacements, setKeywordPlacements] = useState<
    EngineState<KeywordPlacement[]>
  >({ status: "idle", result: null, error: null });
  const [suggestions, setSuggestions] = useState<
    EngineState<SuggestionsResult>
  >({ status: "idle", result: null, error: null });

  // Free analysis states (run in parallel with main engines)
  const [requirementPriority, setRequirementPriority] = useState<
    EngineState<RequirementPriorityResult>
  >({ status: "idle", result: null, error: null });
  const [resumeQuality, setResumeQuality] = useState<
    EngineState<ResumeQualityResult>
  >({ status: "idle", result: null, error: null });

  const allDone =
    legacy.status === "done" &&
    semantic.status === "done" &&
    ai.status === "done";

  const handleSubmit = useCallback(
    async (pdfFile: File, jobDescription: string) => {
      setIsProcessing(true);
      setCompositeScore(null);
      setSavedId(null);
      setLegacy({ status: "idle", result: null, error: null });
      setSemantic({ status: "idle", result: null, error: null });
      setAI({ status: "idle", result: null, error: null });
      setSectionScoring({ status: "idle", result: null, error: null });
      setKeywordPlacements({ status: "idle", result: null, error: null });
      setSuggestions({ status: "idle", result: null, error: null });
      setRequirementPriority({ status: "idle", result: null, error: null });
      setResumeQuality({ status: "idle", result: null, error: null });

      // Step 1: Parse PDF
      setParseStatus("Extracting text from PDF...");
      let resumeText: string;
      try {
        const formData = new FormData();
        formData.append("file", pdfFile);
        const parseRes = await fetch("/api/parse-pdf", {
          method: "POST",
          body: formData,
        });
        if (!parseRes.ok) {
          const err = await parseRes.json();
          throw new Error(err.error || "PDF parsing failed");
        }
        const parseData = await parseRes.json();
        resumeText = parseData.text;
        setParseStatus(
          `Extracted ${parseData.pageCount} page${parseData.pageCount > 1 ? "s" : ""} — running engines...`
        );
      } catch (err) {
        setParseStatus(
          `Error: ${err instanceof Error ? err.message : "PDF parsing failed"}`
        );
        setIsProcessing(false);
        return;
      }

      const payload = { resumeText, jobDescription };

      // Step 2: Run all 3 engines in parallel
      const legacyPromise = (async () => {
        setLegacy((s) => ({ ...s, status: "running" }));
        try {
          const res = await fetch("/api/engines/legacy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Legacy engine failed");
          const data: LegacyResult = await res.json();
          setLegacy({ status: "done", result: data, error: null });
          return data;
        } catch (err) {
          setLegacy({
            status: "error",
            result: null,
            error: err instanceof Error ? err.message : "Failed",
          });
          return null;
        }
      })();

      const semanticPromise = (async () => {
        setSemantic((s) => ({ ...s, status: "running" }));
        try {
          const res = await fetch("/api/engines/semantic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Semantic engine failed");
          const data: SemanticResult = await res.json();
          setSemantic({ status: "done", result: data, error: null });
          return data;
        } catch (err) {
          setSemantic({
            status: "error",
            result: null,
            error: err instanceof Error ? err.message : "Failed",
          });
          return null;
        }
      })();

      const aiPromise = (async () => {
        setAI((s) => ({ ...s, status: "running" }));
        try {
          const res = await fetch("/api/engines/ai-recruiter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("AI Recruiter engine failed");
          const data: AIRecruiterResult = await res.json();
          setAI({ status: "done", result: data, error: null });
          return data;
        } catch (err) {
          setAI({
            status: "error",
            result: null,
            error: err instanceof Error ? err.message : "Failed",
          });
          return null;
        }
      })();

      // Run free analysis engines in parallel (pure TypeScript, no rate limits)
      const requirementPriorityPromise = (async () => {
        setRequirementPriority((s) => ({ ...s, status: "running" }));
        try {
          const res = await fetch("/api/engines/requirement-priority", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Requirement priority engine failed");
          const data: RequirementPriorityResult = await res.json();
          setRequirementPriority({ status: "done", result: data, error: null });
          return data;
        } catch (err) {
          setRequirementPriority({
            status: "error",
            result: null,
            error: err instanceof Error ? err.message : "Failed",
          });
          return null;
        }
      })();

      const resumeQualityPromise = (async () => {
        setResumeQuality((s) => ({ ...s, status: "running" }));
        try {
          const res = await fetch("/api/engines/resume-quality", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resumeText }),
          });
          if (!res.ok) throw new Error("Resume quality engine failed");
          const data: ResumeQualityResult = await res.json();
          setResumeQuality({ status: "done", result: data, error: null });
          return data;
        } catch (err) {
          setResumeQuality({
            status: "error",
            result: null,
            error: err instanceof Error ? err.message : "Failed",
          });
          return null;
        }
      })();

      // Wait for all engines (main + free analysis)
      const [legacyResult, semanticResult, aiResult] = await Promise.all([
        legacyPromise,
        semanticPromise,
        aiPromise,
        requirementPriorityPromise,
        resumeQualityPromise,
      ]);

      // Compute composite score
      const ls = legacyResult?.score ?? 0;
      const ss = semanticResult?.score ?? 0;
      const as_ = aiResult?.score ?? 0;
      const composite = Math.round(ls * 0.3 + ss * 0.3 + as_ * 0.4);
      setCompositeScore(composite);

      setParseStatus(null);
      setIsProcessing(false);

      // Step 3: Save to Supabase if logged in
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && legacyResult && semanticResult && aiResult) {
          const { data: resumeRow } = await supabase
            .from("resumes")
            .insert({
              user_id: user.id,
              file_name: pdfFile.name,
              parsed_text: resumeText.slice(0, 50000),
            })
            .select("id")
            .single();

          const { data: evalRow } = await supabase
            .from("evaluations")
            .insert({
              user_id: user.id,
              resume_id: resumeRow?.id ?? null,
              job_description: jobDescription.slice(0, 50000),
              legacy_score: legacyResult.score,
              legacy_matched: legacyResult.matchedKeywords,
              legacy_missing: legacyResult.missingKeywords,
              legacy_details: legacyResult,
              semantic_score: semanticResult.score,
              semantic_details: semanticResult,
              ai_score: aiResult.score,
              ai_verdict: aiResult.verdict,
              ai_feedback: aiResult.feedback,
              ai_pros: aiResult.pros,
              ai_cons: aiResult.cons,
              ai_details: aiResult,
              label: label.trim() || null,
            })
            .select("id")
            .single();

          if (evalRow) setSavedId(evalRow.id);
        }
      } catch {
        // Silent fail — saving is optional
      }

      // Step 4: Run post-analysis sequentially (respects Gemini rate limits)
      if (legacyResult && semanticResult && aiResult) {
        // Section scoring
        try {
          setSectionScoring((s) => ({ ...s, status: "running" }));
          const res = await fetch("/api/engines/section-scoring", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const data: SectionScoringResult = await res.json();
            setSectionScoring({ status: "done", result: data, error: null });
          } else {
            setSectionScoring({
              status: "error",
              result: null,
              error: "Section scoring failed",
            });
          }
        } catch {
          setSectionScoring({
            status: "error",
            result: null,
            error: "Section scoring failed",
          });
        }

        // Keyword suggestions
        try {
          setKeywordPlacements((s) => ({ ...s, status: "running" }));
          const res = await fetch("/api/engines/keyword-suggestions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...payload,
              missingKeywords: legacyResult.missingKeywords,
            }),
          });
          if (res.ok) {
            const data: KeywordPlacement[] = await res.json();
            setKeywordPlacements({ status: "done", result: data, error: null });
          } else {
            setKeywordPlacements({
              status: "error",
              result: null,
              error: "Keyword suggestions failed",
            });
          }
        } catch {
          setKeywordPlacements({
            status: "error",
            result: null,
            error: "Keyword suggestions failed",
          });
        }

        // Improvement suggestions
        try {
          setSuggestions((s) => ({ ...s, status: "running" }));
          const res = await fetch("/api/engines/suggestions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...payload,
              legacyResult,
              semanticResult,
              aiRecruiterResult: aiResult,
            }),
          });
          if (res.ok) {
            const data: SuggestionsResult = await res.json();
            setSuggestions({ status: "done", result: data, error: null });
          } else {
            setSuggestions({
              status: "error",
              result: null,
              error: "Suggestions failed",
            });
          }
        } catch {
          setSuggestions({
            status: "error",
            result: null,
            error: "Suggestions failed",
          });
        }
      }
    },
    [label]
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-slate-100">
          Resume Benchmarker
        </h1>
        <p className="text-slate-400 mt-2">
          Upload your resume and paste a job description to get scored by 3 ATS
          engines
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Upload Zone */}
        <div className="lg:col-span-2 animate-fade-in-up delay-100">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-200">Input</h2>
            </CardHeader>
            <CardContent>
              <UploadZone
                onSubmit={handleSubmit}
                isProcessing={isProcessing}
              />
              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., Google SWE Application v2"
                  maxLength={100}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              {parseStatus && (
                <p className="mt-4 text-xs text-slate-400 font-mono">
                  {parseStatus}
                </p>
              )}
              {savedId && (
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="success">Saved</Badge>
                  <a
                    href={`/results/${savedId}`}
                    className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
                  >
                    View saved result →
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Engine Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ScoreCard
              title="Legacy ATS"
              subtitle="Keyword match"
              score={legacy.result?.score ?? null}
              status={legacy.status}
              accentColor="text-amber-500"
              accentBg="bg-amber-500/10"
              icon={<Cpu className="w-4 h-4 text-amber-500" />}
              delay={0}
            >
              {legacy.result && (
                <div className="space-y-2">
                  <ProgressBar
                    value={legacy.result.matchRate * 100}
                    color="from-amber-500 to-amber-400"
                    showLabel
                  />
                  <p className="text-xs text-slate-500">
                    {legacy.result.matchedKeywords.length}/
                    {legacy.result.totalJDKeywords} keywords matched
                  </p>
                </div>
              )}
            </ScoreCard>

            <ScoreCard
              title="Semantic ATS"
              subtitle="Cohere embeddings"
              score={semantic.result?.score ?? null}
              status={semantic.status}
              accentColor="text-sky-400"
              accentBg="bg-sky-500/10"
              icon={<Brain className="w-4 h-4 text-sky-400" />}
              delay={80}
            >
              {semantic.result && (
                <p className="text-xs text-slate-400">
                  {semantic.result.interpretation}
                </p>
              )}
            </ScoreCard>

            <ScoreCard
              title="AI Recruiter"
              subtitle="Gemini Flash"
              score={ai.result?.score ?? null}
              status={ai.status}
              accentColor="text-violet-400"
              accentBg="bg-violet-500/10"
              icon={<Sparkles className="w-4 h-4 text-violet-400" />}
              delay={160}
            >
              {ai.result && (
                <Badge variant="ai">{ai.result.verdict}</Badge>
              )}
            </ScoreCard>
          </div>

          {/* Composite Score */}
          {allDone && compositeScore !== null && (
            <Card className="animate-fade-in-up">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-semibold text-slate-200">
                    Composite Score
                  </h2>
                </div>
              </CardHeader>
              <CardContent>
                <CompositeScore
                  compositeScore={compositeScore}
                  legacyScore={legacy.result?.score ?? 0}
                  semanticScore={semantic.result?.score ?? 0}
                  aiScore={ai.result?.score ?? 0}
                />
              </CardContent>
            </Card>
          )}

          {/* Section Scoring */}
          {sectionScoring.status !== "idle" && (
            <Card className="animate-fade-in-up">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LayoutList className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-semibold text-slate-200">
                    Section-by-Section Scoring
                  </h2>
                  {sectionScoring.status === "running" && (
                    <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {sectionScoring.status === "running" && (
                  <p className="text-sm text-slate-500">
                    Analyzing resume sections...
                  </p>
                )}
                {sectionScoring.status === "done" &&
                  sectionScoring.result && (
                    <SectionScorePanel result={sectionScoring.result} />
                  )}
                {sectionScoring.status === "error" && (
                  <p className="text-sm text-slate-500">
                    Section scoring unavailable
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Keyword Grid */}
          {legacy.status === "done" && legacy.result && (
            <Card className="animate-fade-in-up delay-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-semibold text-slate-200">
                    Keyword Analysis
                  </h2>
                  {keywordPlacements.status === "running" && (
                    <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <KeywordGrid
                  matched={legacy.result.matchedKeywords}
                  missing={legacy.result.missingKeywords}
                  placements={keywordPlacements.result ?? undefined}
                  synonymMatches={legacy.result.synonymMatches}
                />
              </CardContent>
            </Card>
          )}

          {/* Requirement Priority */}
          {requirementPriority.status !== "idle" && (
            <Card className="animate-fade-in-up">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-orange-400" />
                  <h2 className="text-sm font-semibold text-slate-200">
                    Requirement Priority Analysis
                  </h2>
                  {requirementPriority.status === "running" && (
                    <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {requirementPriority.status === "running" && (
                  <p className="text-sm text-slate-500">
                    Analyzing requirement priorities...
                  </p>
                )}
                {requirementPriority.status === "done" &&
                  requirementPriority.result && (
                    <RequirementPriorityPanel
                      result={requirementPriority.result}
                    />
                  )}
                {requirementPriority.status === "error" && (
                  <p className="text-sm text-slate-500">
                    Requirement priority analysis unavailable
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Resume Quality / Impact */}
          {resumeQuality.status !== "idle" && (
            <Card className="animate-fade-in-up">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold text-slate-200">
                    Resume Impact Analysis
                  </h2>
                  {resumeQuality.status === "running" && (
                    <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {resumeQuality.status === "running" && (
                  <p className="text-sm text-slate-500">
                    Analyzing bullet point quality...
                  </p>
                )}
                {resumeQuality.status === "done" &&
                  resumeQuality.result && (
                    <ResumeQualityPanel result={resumeQuality.result} />
                  )}
                {resumeQuality.status === "error" && (
                  <p className="text-sm text-slate-500">
                    Resume quality analysis unavailable
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Feedback */}
          {ai.status === "done" && ai.result && (
            <Card className="animate-fade-in-up delay-300">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <h2 className="text-sm font-semibold text-slate-200">
                    AI Recruiter Feedback
                  </h2>
                </div>
              </CardHeader>
              <CardContent>
                <AIFeedbackPanel result={ai.result} />
              </CardContent>
            </Card>
          )}

          {/* Improvement Suggestions */}
          {suggestions.status !== "idle" && (
            <Card className="animate-fade-in-up">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-slate-200">
                    Improvement Suggestions
                  </h2>
                  {suggestions.status === "running" && (
                    <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {suggestions.status === "running" && (
                  <p className="text-sm text-slate-500">
                    Generating improvement suggestions...
                  </p>
                )}
                {suggestions.status === "done" && suggestions.result && (
                  <SuggestionsPanel
                    suggestions={suggestions.result.suggestions}
                    overallStrategy={suggestions.result.overallStrategy}
                  />
                )}
                {suggestions.status === "error" && (
                  <p className="text-sm text-slate-500">
                    Suggestions unavailable
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
