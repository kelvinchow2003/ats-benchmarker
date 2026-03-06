import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient, getUser } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { BarChart3, FileSearch, TrendingUp } from "lucide-react";
import type { EvaluationRow } from "@/types/evaluation";
import ComparisonSelector from "@/components/dashboard/ComparisonSelector";
import ScoreHistoryChart from "@/components/dashboard/ScoreHistoryChart";

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

      {/* Score History Chart */}
      {rows.length >= 2 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-slate-200">
                Score History
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <ScoreHistoryChart
              evaluations={rows.map((row) => ({
                id: row.id,
                compositeScore: Number(row.composite_score ?? 0),
                legacyScore: Number(row.legacy_score ?? 0),
                semanticScore: Number(row.semantic_score ?? 0),
                aiScore: Number(row.ai_score ?? 0),
                label: row.label,
                createdAt: row.created_at,
              }))}
            />
          </CardContent>
        </Card>
      )}

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
        <ComparisonSelector evaluations={rows} />
      )}
    </div>
  );
}
