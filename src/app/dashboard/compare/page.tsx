import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient, getUser } from "@/lib/supabase/server";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import type { EvaluationRow } from "@/types/evaluation";
import ComparisonView from "@/components/dashboard/ComparisonView";

interface ComparePageProps {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { a, b } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/login");

  if (!a || !b) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-slate-400 mb-4">
          Select two evaluations from the dashboard to compare.
        </p>
        <Link href="/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const supabase = await createServerSupabaseClient();

  const [resA, resB] = await Promise.all([
    supabase
      .from("evaluations")
      .select("*")
      .eq("id", a)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("evaluations")
      .select("*")
      .eq("id", b)
      .eq("user_id", user.id)
      .single(),
  ]);

  if (!resA.data || !resB.data) notFound();

  const evalA = resA.data as EvaluationRow;
  const evalB = resB.data as EvaluationRow;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            Compare Evaluations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Side-by-side analysis of two evaluations
          </p>
        </div>
      </div>

      <ComparisonView evalA={evalA} evalB={evalB} />
    </div>
  );
}
