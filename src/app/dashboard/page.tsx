import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient, getUser } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { BarChart3, Clock, ArrowRight, FileSearch } from "lucide-react";
import type { EvaluationRow } from "@/types/evaluation";

function getScoreBadgeVariant(
  score: number | null
): "success" | "info" | "warning" | "danger" {
  if (!score) return "danger";
  if (score >= 70) return "success";
  if (score >= 50) return "info";
  if (score >= 30) return "warning";
  return "danger";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createServerSupabaseClient();
  const { data: evaluations } = await supabase
    .from("evaluations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = (evaluations ?? []) as EvaluationRow[];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Your evaluation history
          </p>
        </div>
        <Link href="/evaluate">
          <Button size="sm">
            <FileSearch className="w-4 h-4" />
            New evaluation
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BarChart3 className="w-10 h-10 text-slate-700 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-300 mb-2">
              No evaluations yet
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Run your first resume benchmark to see results here.
            </p>
            <Link href="/evaluate">
              <Button>Start benchmarking</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <Link key={row.id} href={`/results/${row.id}`}>
              <Card hover className="group">
                <CardContent className="flex items-center gap-4">
                  {/* Composite Score */}
                  <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold font-mono text-slate-200">
                      {row.composite_score != null
                        ? Math.round(row.composite_score)
                        : "—"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">
                      {row.job_description.slice(0, 80)}...
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {formatDate(row.created_at)}
                      </div>
                      {row.ai_verdict && (
                        <Badge
                          variant={getScoreBadgeVariant(row.ai_score as number | null)}
                        >
                          {row.ai_verdict}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="hidden sm:flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Legacy</p>
                      <p className="text-sm font-mono font-bold text-amber-500">
                        {row.legacy_score != null
                          ? Math.round(Number(row.legacy_score))
                          : "—"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Semantic</p>
                      <p className="text-sm font-mono font-bold text-sky-400">
                        {row.semantic_score != null
                          ? Math.round(Number(row.semantic_score))
                          : "—"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">AI</p>
                      <p className="text-sm font-mono font-bold text-violet-400">
                        {row.ai_score != null
                          ? Math.round(Number(row.ai_score))
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
