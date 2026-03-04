import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient, getUser } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import CompositeScore from "@/components/results/CompositeScore";
import KeywordGrid from "@/components/results/KeywordGrid";
import AIFeedbackPanel from "@/components/results/AIFeedbackPanel";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  ArrowLeft,
  Cpu,
  Brain,
  Sparkles,
  BarChart3,
  Clock,
} from "lucide-react";
import type { EvaluationRow, AIRecruiterResult } from "@/types/evaluation";

interface ResultsPageProps {
  params: Promise<{ evaluationId: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { evaluationId } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("evaluations")
    .select("*")
    .eq("id", evaluationId)
    .eq("user_id", user.id)
    .single();

  if (!data) notFound();

  const row = data as EvaluationRow;
  const legacyScore = Number(row.legacy_score ?? 0);
  const semanticScore = Number(row.semantic_score ?? 0);
  const aiScore = Number(row.ai_score ?? 0);
  const composite = Number(row.composite_score ?? 0);

  const aiResult: AIRecruiterResult | null = row.ai_details
    ? (row.ai_details as AIRecruiterResult)
    : row.ai_verdict
      ? {
          score: aiScore,
          verdict: row.ai_verdict as AIRecruiterResult["verdict"],
          feedback: row.ai_feedback ?? "",
          pros: row.ai_pros ?? [],
          cons: row.ai_cons ?? [],
        }
      : null;

  const createdAt = new Date(row.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              Evaluation Results
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {createdAt}
            </div>
          </div>
        </div>
        {row.ai_verdict && (
          <Badge variant="ai">{row.ai_verdict}</Badge>
        )}
      </div>

      <div className="space-y-6">
        {/* Composite Score */}
        <Card>
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
              compositeScore={Math.round(composite)}
              legacyScore={Math.round(legacyScore)}
              semanticScore={Math.round(semanticScore)}
              aiScore={Math.round(aiScore)}
            />
          </CardContent>
        </Card>

        {/* Keyword Analysis */}
        {row.legacy_matched && row.legacy_missing && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-slate-200">
                  Keyword Analysis
                </h2>
                <Badge variant="legacy">
                  Score: {Math.round(legacyScore)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <KeywordGrid
                matched={row.legacy_matched}
                missing={row.legacy_missing}
              />
            </CardContent>
          </Card>
        )}

        {/* Semantic */}
        {row.semantic_details && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-semibold text-slate-200">
                  Semantic Analysis
                </h2>
                <Badge variant="semantic">
                  Score: {Math.round(semanticScore)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300">
                {(row.semantic_details as { interpretation?: string })
                  ?.interpretation ?? "Semantic analysis complete."}
              </p>
              <p className="text-xs text-slate-500 mt-2 font-mono">
                Raw similarity:{" "}
                {(
                  (row.semantic_details as { rawSimilarity?: number })
                    ?.rawSimilarity ?? 0
                ).toFixed(4)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* AI Feedback */}
        {aiResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-slate-200">
                  AI Recruiter Feedback
                </h2>
                <Badge variant="ai">
                  Score: {Math.round(aiScore)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <AIFeedbackPanel result={aiResult} />
            </CardContent>
          </Card>
        )}

        {/* Job Description (collapsed) */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-200">
              Job Description
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
              {row.job_description}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
