"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Check, X } from "lucide-react";
import ProgressBar from "@/components/ui/ProgressBar";
import type { RequirementPriorityResult, RequirementPriority } from "@/types/evaluation";

interface RequirementPriorityPanelProps {
  result: RequirementPriorityResult;
}

const PRIORITY_CONFIG: Record<
  RequirementPriority,
  { label: string; color: string; barColor: string; weight: string }
> = {
  required: {
    label: "Required",
    color: "text-red-400 bg-red-500/10 border-red-500/20",
    barColor: "from-red-500 to-red-400",
    weight: "60%",
  },
  preferred: {
    label: "Preferred",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    barColor: "from-amber-500 to-amber-400",
    weight: "30%",
  },
  bonus: {
    label: "Bonus",
    color: "text-slate-400 bg-slate-500/10 border-slate-500/20",
    barColor: "from-slate-500 to-slate-400",
    weight: "10%",
  },
};

const PRIORITY_ORDER: RequirementPriority[] = ["required", "preferred", "bonus"];

export default function RequirementPriorityPanel({
  result,
}: RequirementPriorityPanelProps) {
  const [expandedPriority, setExpandedPriority] = useState<RequirementPriority | null>(null);

  const grouped = PRIORITY_ORDER.map((priority) => {
    const items = result.requirements.filter((r) => r.priority === priority);
    const matched = items.filter((r) => r.matched).length;
    const total = items.length;
    const rate =
      priority === "required"
        ? result.requiredMatchRate
        : priority === "preferred"
          ? result.preferredMatchRate
          : result.bonusMatchRate;
    return { priority, items, matched, total, rate };
  });

  return (
    <div className="space-y-4">
      {/* Weighted score summary */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">
          Weighted Priority Score
        </span>
        <span className="text-2xl font-bold font-mono text-slate-100">
          {result.weightedScore}
          <span className="text-sm text-slate-500 font-normal">/100</span>
        </span>
      </div>

      <ProgressBar
        value={result.weightedScore}
        color={
          result.weightedScore >= 70
            ? "from-emerald-500 to-emerald-400"
            : result.weightedScore >= 40
              ? "from-amber-500 to-amber-400"
              : "from-red-500 to-red-400"
        }
      />

      {/* Priority breakdown */}
      <div className="space-y-2 pt-2">
        {grouped.map(({ priority, items, matched, total, rate }) => {
          if (total === 0) return null;
          const config = PRIORITY_CONFIG[priority];
          const isExpanded = expandedPriority === priority;

          return (
            <div
              key={priority}
              className="border border-slate-700/50 rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedPriority(isExpanded ? null : priority)
                }
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded border ${config.color} shrink-0`}
                >
                  {config.label}
                </span>
                <div className="flex-1">
                  <ProgressBar
                    value={rate * 100}
                    color={config.barColor}
                  />
                </div>
                <span className="text-xs text-slate-400 font-mono shrink-0">
                  {matched}/{total}
                </span>
                <span className="text-[10px] text-slate-600 shrink-0">
                  ({config.weight})
                </span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 space-y-1.5">
                  {items.map((req, i) => (
                    <div
                      key={`${req.keyword}-${i}`}
                      className="flex items-start gap-2 text-xs"
                    >
                      {req.matched ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`font-mono ${
                          req.matched ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {req.keyword}
                      </span>
                      {req.context && (
                        <span className="text-slate-600 truncate max-w-[300px]">
                          {req.context}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
