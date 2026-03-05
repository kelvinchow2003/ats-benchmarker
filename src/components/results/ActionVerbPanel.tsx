"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import ProgressBar from "@/components/ui/ProgressBar";
import type { ActionVerbAnalysisResult } from "@/types/evaluation";

interface ActionVerbPanelProps {
  result: ActionVerbAnalysisResult;
}

const CATEGORY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  leadership:    { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  achievement:   { text: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
  creation:      { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  optimization:  { text: "text-sky-400",    bg: "bg-sky-500/10",    border: "border-sky-500/20" },
  analysis:      { text: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  communication: { text: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20" },
  technical:     { text: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20" },
  execution:     { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  other:         { text: "text-slate-400",  bg: "bg-slate-500/10",  border: "border-slate-500/20" },
};

function getCatStyle(cat: string) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.other;
}

export default function ActionVerbPanel({ result }: ActionVerbPanelProps) {
  const [showWeakPhrases, setShowWeakPhrases] = useState(false);
  const [showOverused, setShowOverused] = useState(false);

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Verb Strength Score</span>
        <span className="text-2xl font-bold font-mono text-slate-100">
          {result.score}
          <span className="text-sm text-slate-500 font-normal">/100</span>
        </span>
      </div>

      <ProgressBar
        value={result.score}
        color={
          result.score >= 70
            ? "from-emerald-500 to-emerald-400"
            : result.score >= 40
              ? "from-amber-500 to-amber-400"
              : "from-red-500 to-red-400"
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="bg-slate-800/30 rounded-xl px-3 py-2.5 text-center">
          <p className="text-lg font-bold font-mono text-emerald-400">
            {result.strongVerbCount}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Strong Verbs
          </p>
        </div>
        <div className="bg-slate-800/30 rounded-xl px-3 py-2.5 text-center">
          <p className="text-lg font-bold font-mono text-red-400">
            {result.weakPhraseCount}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Weak Phrases
          </p>
        </div>
        <div className="bg-slate-800/30 rounded-xl px-3 py-2.5 text-center">
          <p className="text-lg font-bold font-mono text-sky-400">
            {result.uniqueVerbCount}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Unique Verbs
          </p>
        </div>
        <div className="bg-slate-800/30 rounded-xl px-3 py-2.5 text-center">
          <p className="text-lg font-bold font-mono text-amber-400">
            {Math.round(result.verbDiversity * 100)}%
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Diversity
          </p>
        </div>
      </div>

      {/* Category breakdown */}
      {result.categoryBreakdown.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">Verb Categories</p>
          <div className="flex flex-wrap gap-2">
            {result.categoryBreakdown.map(({ category, count }) => {
              const style = getCatStyle(category);
              return (
                <span
                  key={category}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border capitalize ${style.text} ${style.bg} ${style.border}`}
                >
                  {category}
                  <span className="font-mono text-[10px] opacity-70">{count}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Top verbs */}
      {result.topVerbs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">Most Used Verbs</p>
          <div className="flex flex-wrap gap-1.5">
            {result.topVerbs.map(({ verb, count }) => (
              <span
                key={verb}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-slate-800/50 text-slate-300 border border-slate-700/50 rounded-md"
              >
                {verb}
                <span className="text-[10px] text-slate-500">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Overused verbs warning */}
      {result.overusedVerbs.length > 0 && (
        <div className="border border-slate-700/50 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowOverused(!showOverused)}
            className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors cursor-pointer"
          >
            {showOverused ? (
              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <RefreshCw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-sm font-medium text-amber-400">
              Overused Verbs ({result.overusedVerbs.length})
            </span>
          </button>

          {showOverused && (
            <div className="px-4 pb-3 space-y-1.5">
              <p className="text-xs text-slate-500 mb-2">
                These verbs appear 3+ times. Vary your language for stronger impact.
              </p>
              {result.overusedVerbs.map(({ verb, count }) => (
                <div
                  key={verb}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="font-mono text-amber-400 w-20">{verb}</span>
                  <span className="text-slate-600">×{count}</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500/60 rounded-full"
                      style={{ width: `${Math.min(100, (count / result.totalBullets) * 100 * 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Weak phrases with suggestions */}
      {result.weakPhrases.length > 0 && (
        <div className="border border-red-500/20 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowWeakPhrases(!showWeakPhrases)}
            className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors cursor-pointer"
          >
            {showWeakPhrases ? (
              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="text-sm font-medium text-red-400">
              Weak Phrasing ({result.weakPhrases.length})
            </span>
          </button>

          {showWeakPhrases && (
            <div className="px-4 pb-3 space-y-3">
              {result.weakPhrases.map((wp, i) => (
                <div
                  key={i}
                  className="space-y-1.5 pb-2.5 border-b border-slate-800/50 last:border-0 last:pb-0"
                >
                  <p className="text-xs text-slate-400 font-mono break-words">
                    {wp.text}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded line-through">
                      {wp.weakPhrase}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                    {wp.alternatives.map((alt) => (
                      <span
                        key={alt}
                        className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded"
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
