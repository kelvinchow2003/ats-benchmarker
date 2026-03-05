"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { SuggestionItem } from "@/types/evaluation";

interface SuggestionsPanelProps {
  suggestions: SuggestionItem[];
  overallStrategy: string;
}

function PriorityBadge({ priority }: { priority: SuggestionItem["priority"] }) {
  const variants: Record<string, "danger" | "warning" | "default"> = {
    high: "danger",
    medium: "warning",
    low: "default",
  };
  return <Badge variant={variants[priority] ?? "default"}>{priority}</Badge>;
}

export default function SuggestionsPanel({
  suggestions,
  overallStrategy,
}: SuggestionsPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-300">{overallStrategy}</p>

      <div className="space-y-2">
        {suggestions.map((item, i) => {
          const isExpanded = expandedIndex === i;
          return (
            <div
              key={i}
              className="border border-slate-700/50 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded shrink-0">
                  {item.section}
                </span>
                <span className="text-sm text-slate-200 truncate flex-1">
                  {item.reasoning}
                </span>
                <PriorityBadge priority={item.priority} />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {item.currentText && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">
                        Current
                      </p>
                      <p className="text-sm text-red-400/80 line-through leading-relaxed bg-red-500/5 rounded-lg px-3 py-2">
                        {item.currentText}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Suggested
                    </p>
                    <p className="text-sm text-emerald-400/90 leading-relaxed bg-emerald-500/5 rounded-lg px-3 py-2">
                      {item.suggestedRewrite}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
