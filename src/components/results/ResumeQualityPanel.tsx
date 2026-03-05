"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Zap,
  Hash,
  AlertCircle,
} from "lucide-react";
import ProgressBar from "@/components/ui/ProgressBar";
import type { ResumeQualityResult, BulletAnalysis } from "@/types/evaluation";

interface ResumeQualityPanelProps {
  result: ResumeQualityResult;
}

const RATING_CONFIG = {
  strong: {
    label: "Strong",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    dotColor: "bg-emerald-400",
  },
  moderate: {
    label: "Moderate",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    dotColor: "bg-amber-400",
  },
  weak: {
    label: "Needs Work",
    color: "text-red-400 bg-red-500/10 border-red-500/20",
    dotColor: "bg-red-400",
  },
};

function BulletItem({ bullet }: { bullet: BulletAnalysis }) {
  const config = RATING_CONFIG[bullet.rating];

  return (
    <div className="flex items-start gap-2 text-xs py-1.5 border-b border-slate-800/50 last:border-0">
      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${config.dotColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-slate-300 font-mono leading-relaxed break-words">
          {bullet.text}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {bullet.hasActionVerb && bullet.actionVerb && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded">
              <Zap className="w-2.5 h-2.5" />
              {bullet.actionVerb}
            </span>
          )}
          {bullet.metrics.map((m, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-0.5 px-1.5 py-0 text-[10px] text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded"
            >
              <Hash className="w-2.5 h-2.5" />
              {m}
            </span>
          ))}
          {bullet.rating === "weak" && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded">
              <AlertCircle className="w-2.5 h-2.5" />
              Add metrics & strong verb
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResumeQualityPanel({
  result,
}: ResumeQualityPanelProps) {
  const [showBullets, setShowBullets] = useState(false);
  const [bulletFilter, setBulletFilter] = useState<"all" | "strong" | "moderate" | "weak">("all");

  const overallConfig = RATING_CONFIG[result.overallRating];

  const strongCount = result.bullets.filter((b) => b.rating === "strong").length;
  const moderateCount = result.bullets.filter((b) => b.rating === "moderate").length;
  const weakCount = result.bullets.filter((b) => b.rating === "weak").length;

  const filteredBullets =
    bulletFilter === "all"
      ? result.bullets
      : result.bullets.filter((b) => b.rating === bulletFilter);

  return (
    <div className="space-y-4">
      {/* Score + overall rating */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Impact Score</span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded border ${overallConfig.color}`}
          >
            {overallConfig.label}
          </span>
        </div>
        <span className="text-2xl font-bold font-mono text-slate-100">
          {result.score}
          <span className="text-sm text-slate-500 font-normal">/100</span>
        </span>
      </div>

      <ProgressBar
        value={result.score}
        color={
          result.score >= 60
            ? "from-emerald-500 to-emerald-400"
            : result.score >= 30
              ? "from-amber-500 to-amber-400"
              : "from-red-500 to-red-400"
        }
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="bg-slate-800/30 rounded-xl px-3 py-2.5 text-center">
          <p className="text-lg font-bold font-mono text-slate-100">
            {result.totalBullets}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Bullets
          </p>
        </div>
        <div className="bg-slate-800/30 rounded-xl px-3 py-2.5 text-center">
          <p className="text-lg font-bold font-mono text-sky-400">
            {Math.round(result.metricsRate * 100)}%
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            With Metrics
          </p>
        </div>
        <div className="bg-slate-800/30 rounded-xl px-3 py-2.5 text-center">
          <p className="text-lg font-bold font-mono text-emerald-400">
            {Math.round(result.actionVerbRate * 100)}%
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Action Verbs
          </p>
        </div>
        <div className="bg-slate-800/30 rounded-xl px-3 py-2.5 text-center">
          <p className="text-lg font-bold font-mono text-amber-400">
            {strongCount}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Strong Bullets
          </p>
        </div>
      </div>

      {/* Breakdown bar */}
      {result.totalBullets > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500">Bullet Rating Distribution</p>
          <div className="flex h-3 rounded-full overflow-hidden bg-slate-800">
            {strongCount > 0 && (
              <div
                className="bg-emerald-500 transition-all duration-700"
                style={{
                  width: `${(strongCount / result.totalBullets) * 100}%`,
                }}
              />
            )}
            {moderateCount > 0 && (
              <div
                className="bg-amber-500 transition-all duration-700"
                style={{
                  width: `${(moderateCount / result.totalBullets) * 100}%`,
                }}
              />
            )}
            {weakCount > 0 && (
              <div
                className="bg-red-500 transition-all duration-700"
                style={{
                  width: `${(weakCount / result.totalBullets) * 100}%`,
                }}
              />
            )}
          </div>
          <div className="flex gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Strong ({strongCount})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Moderate ({moderateCount})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Weak ({weakCount})
            </span>
          </div>
        </div>
      )}

      {/* Expandable bullet list */}
      {result.bullets.length > 0 && (
        <div className="border border-slate-700/50 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowBullets(!showBullets)}
            className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors cursor-pointer"
          >
            {showBullets ? (
              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <span className="text-sm font-medium text-slate-300">
              View Bullet Analysis ({result.bullets.length})
            </span>
          </button>

          {showBullets && (
            <div className="px-4 pb-3 space-y-2">
              {/* Filter tabs */}
              <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg w-fit">
                {(["all", "strong", "moderate", "weak"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setBulletFilter(f)}
                    className={`px-2.5 py-1 text-[10px] font-medium rounded capitalize transition-colors cursor-pointer ${
                      bulletFilter === f
                        ? "bg-slate-700 text-slate-200"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {f}{" "}
                    {f === "all"
                      ? `(${result.bullets.length})`
                      : f === "strong"
                        ? `(${strongCount})`
                        : f === "moderate"
                          ? `(${moderateCount})`
                          : `(${weakCount})`}
                  </button>
                ))}
              </div>

              {/* Bullet list */}
              <div className="max-h-80 overflow-y-auto pr-1">
                {filteredBullets.map((bullet, i) => (
                  <BulletItem key={i} bullet={bullet} />
                ))}
                {filteredBullets.length === 0 && (
                  <p className="text-xs text-slate-600 py-3 text-center">
                    No bullets in this category
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
