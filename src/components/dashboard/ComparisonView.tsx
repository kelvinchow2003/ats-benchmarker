"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Equal,
} from "lucide-react";
import type { EvaluationRow } from "@/types/evaluation";

interface ComparisonViewProps {
  evalA: EvaluationRow;
  evalB: EvaluationRow;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-sky-400";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
}

function DeltaIndicator({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-emerald-400 text-sm font-mono font-bold">
        <ArrowUp className="w-3.5 h-3.5" />+{delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-red-400 text-sm font-mono font-bold">
        <ArrowDown className="w-3.5 h-3.5" />{delta}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-slate-500 text-sm font-mono">
      <Minus className="w-3.5 h-3.5" />0
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ComparisonView({
  evalA,
  evalB,
}: ComparisonViewProps) {
  const aComposite = Math.round(Number(evalA.composite_score ?? 0));
  const bComposite = Math.round(Number(evalB.composite_score ?? 0));
  const aLegacy = Math.round(Number(evalA.legacy_score ?? 0));
  const bLegacy = Math.round(Number(evalB.legacy_score ?? 0));
  const aSemantic = Math.round(Number(evalA.semantic_score ?? 0));
  const bSemantic = Math.round(Number(evalB.semantic_score ?? 0));
  const aAI = Math.round(Number(evalA.ai_score ?? 0));
  const bAI = Math.round(Number(evalB.ai_score ?? 0));

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const labelA = evalA.label || formatDate(evalA.created_at);
  const labelB = evalB.label || formatDate(evalB.created_at);

  // Radar chart data
  const radarData = [
    { engine: "Legacy", A: aLegacy, B: bLegacy },
    { engine: "Semantic", A: aSemantic, B: bSemantic },
    { engine: "AI Recruiter", A: aAI, B: bAI },
  ];

  // Keyword analysis
  const { gained, lost, shared } = useMemo(() => {
    const matchedA = new Set(evalA.legacy_matched ?? []);
    const matchedB = new Set(evalB.legacy_matched ?? []);

    const gained: string[] = [];
    const lost: string[] = [];
    const shared: string[] = [];

    matchedB.forEach((kw) => {
      if (matchedA.has(kw)) shared.push(kw);
      else gained.push(kw);
    });
    matchedA.forEach((kw) => {
      if (!matchedB.has(kw)) lost.push(kw);
    });

    return { gained, lost, shared };
  }, [evalA.legacy_matched, evalB.legacy_matched]);

  const engines = [
    { name: "Legacy ATS", scoreA: aLegacy, scoreB: bLegacy, color: "#f59e0b" },
    { name: "Semantic ATS", scoreA: aSemantic, scoreB: bSemantic, color: "#38bdf8" },
    { name: "AI Recruiter", scoreA: aAI, scoreB: bAI, color: "#a78bfa" },
  ];

  return (
    <div className="space-y-6">
      {/* Composite Score Comparison */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-200">
            Composite Score Comparison
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Eval A */}
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-2 truncate">{labelA}</p>
              <span
                className={`text-4xl font-bold font-mono ${getScoreColor(aComposite)}`}
              >
                {aComposite}
              </span>
            </div>

            {/* Delta */}
            <div className="text-center">
              <DeltaIndicator delta={bComposite - aComposite} />
            </div>

            {/* Eval B */}
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-2 truncate">{labelB}</p>
              <span
                className={`text-4xl font-bold font-mono ${getScoreColor(bComposite)}`}
              >
                {bComposite}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engine Breakdown Comparison */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-200">
            Engine Breakdown
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {engines.map((engine) => (
              <div key={engine.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">
                    {engine.name}
                  </span>
                  <DeltaIndicator delta={engine.scoreB - engine.scoreA} />
                </div>
                <div className="space-y-1.5">
                  {/* Bar A */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 w-6 shrink-0 font-mono">
                      A
                    </span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${engine.scoreA}%`,
                          backgroundColor: engine.color,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-mono font-bold w-8 text-right"
                      style={{ color: engine.color }}
                    >
                      {engine.scoreA}
                    </span>
                  </div>
                  {/* Bar B */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 w-6 shrink-0 font-mono">
                      B
                    </span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full opacity-60"
                        style={{
                          width: `${engine.scoreB}%`,
                          backgroundColor: engine.color,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-mono font-bold w-8 text-right opacity-60"
                      style={{ color: engine.color }}
                    >
                      {engine.scoreB}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              Engine Score Radar
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full bg-blue-400" />
                <span className="text-xs text-slate-500">A</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full bg-violet-400" />
                <span className="text-xs text-slate-500">B</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {mounted ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis
                  dataKey="engine"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Radar
                  name="A"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name="B"
                  dataKey="B"
                  stroke="#a78bfa"
                  fill="#a78bfa"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] bg-slate-800/30 rounded-xl animate-pulse" />
          )}
        </CardContent>
      </Card>

      {/* Keyword Overlap */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-200">
            Keyword Changes (A → B)
          </h2>
        </CardHeader>
        <CardContent>
          {/* Summary */}
          <div className="flex items-center gap-4 mb-5">
            <Badge variant="success">
              <Plus className="w-3 h-3" />
              {gained.length} gained
            </Badge>
            <Badge variant="danger">
              <Minus className="w-3 h-3" />
              {lost.length} lost
            </Badge>
            <Badge variant="default">
              <Equal className="w-3 h-3" />
              {shared.length} shared
            </Badge>
          </div>

          {/* Gained */}
          {gained.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-emerald-400 font-medium mb-2">
                Keywords Gained
              </p>
              <div className="flex flex-wrap gap-1.5">
                {gained.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-md border border-emerald-500/20"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Lost */}
          {lost.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-red-400 font-medium mb-2">
                Keywords Lost
              </p>
              <div className="flex flex-wrap gap-1.5">
                {lost.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-md border border-red-500/20"
                  >
                    <Minus className="w-2.5 h-2.5" />
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shared */}
          {shared.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 font-medium mb-2">
                Shared Keywords
              </p>
              <div className="flex flex-wrap gap-1.5">
                {shared.slice(0, 30).map((kw) => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-md border border-slate-700"
                  >
                    {kw}
                  </span>
                ))}
                {shared.length > 30 && (
                  <span className="text-xs text-slate-600">
                    +{shared.length - 30} more
                  </span>
                )}
              </div>
            </div>
          )}

          {gained.length === 0 && lost.length === 0 && shared.length === 0 && (
            <p className="text-sm text-slate-500">
              No keyword data available for comparison.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
