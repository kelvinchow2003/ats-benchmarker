"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EvaluationLabel from "@/components/dashboard/EvaluationLabel";
import {
  Clock,
  ArrowRight,
  GitCompareArrows,
  X,
} from "lucide-react";
import type { EvaluationRow } from "@/types/evaluation";

interface ComparisonSelectorProps {
  evaluations: EvaluationRow[];
}

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

export default function ComparisonSelector({
  evaluations,
}: ComparisonSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelection(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 2) {
          // Remove the first selected to make room
          const first = next.values().next().value;
          if (first) next.delete(first);
        }
        next.add(id);
      }
      return next;
    });
  }

  const selectedIds = Array.from(selected);
  const canCompare = selectedIds.length === 2;

  return (
    <>
      <div className="space-y-3">
        {evaluations.map((row) => {
          const isSelected = selected.has(row.id);

          return (
            <div key={row.id} className="relative group">
              {/* Selection checkbox */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSelection(row.id);
                }}
                className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-500"
                    : "border-slate-700 bg-slate-900 opacity-0 group-hover:opacity-100"
                }`}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              <Link href={`/results/${row.id}`}>
                <Card
                  hover
                  className={`group transition-all ${
                    isSelected ? "ring-1 ring-blue-500/40 ml-4" : ""
                  }`}
                >
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
                      <EvaluationLabel
                        evaluationId={row.id}
                        initialLabel={row.label}
                        fallbackText={
                          row.job_description.slice(0, 80) + "..."
                        }
                      />
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(row.created_at)}
                        </div>
                        {row.ai_verdict && (
                          <Badge
                            variant={getScoreBadgeVariant(
                              row.ai_score as number | null
                            )}
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
            </div>
          );
        })}
      </div>

      {/* Floating compare bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in-up">
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-full px-5 py-3 shadow-2xl shadow-slate-950">
            <span className="text-xs text-slate-400">
              {selected.size}/2 selected
            </span>

            {canCompare ? (
              <Link
                href={`/dashboard/compare?a=${selectedIds[0]}&b=${selectedIds[1]}`}
              >
                <Button size="sm">
                  <GitCompareArrows className="w-4 h-4" />
                  Compare
                </Button>
              </Link>
            ) : (
              <span className="text-xs text-slate-600">
                Select one more to compare
              </span>
            )}

            <button
              onClick={() => setSelected(new Set())}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
