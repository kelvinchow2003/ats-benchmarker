"use client";

import { useState } from "react";
import { Search, Check, X } from "lucide-react";
import type { KeywordPlacement } from "@/types/evaluation";

interface KeywordGridProps {
  matched: string[];
  missing: string[];
  placements?: KeywordPlacement[];
}

const IMPORTANCE_ORDER = { critical: 0, important: 1, "nice-to-have": 2 };
const IMPORTANCE_COLORS = {
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  important: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "nice-to-have": "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

export default function KeywordGrid({
  matched,
  missing,
  placements,
}: KeywordGridProps) {
  const [filter, setFilter] = useState("");
  const [view, setView] = useState<"all" | "matched" | "missing">("all");
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);

  const placementMap = new Map(
    (placements ?? []).map((p) => [p.keyword.toLowerCase(), p])
  );

  const filteredMatched = matched.filter((k) =>
    k.toLowerCase().includes(filter.toLowerCase())
  );

  let filteredMissing = missing.filter((k) =>
    k.toLowerCase().includes(filter.toLowerCase())
  );

  // Sort by importance if placements are available
  if (placements && placements.length > 0) {
    filteredMissing = [...filteredMissing].sort((a, b) => {
      const pa = placementMap.get(a.toLowerCase());
      const pb = placementMap.get(b.toLowerCase());
      const ia = pa ? IMPORTANCE_ORDER[pa.importance] : 1;
      const ib = pb ? IMPORTANCE_ORDER[pb.importance] : 1;
      return ia - ib;
    });
  }

  const showMatched = view === "all" || view === "matched";
  const showMissing = view === "all" || view === "missing";

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search keywords..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl">
          {(["all", "matched", "missing"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                view === v
                  ? "bg-slate-700 text-slate-200"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {v}{" "}
              {v === "all"
                ? `(${matched.length + missing.length})`
                : v === "matched"
                  ? `(${matched.length})`
                  : `(${missing.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        {showMatched &&
          filteredMatched.map((kw) => (
            <span
              key={`m-${kw}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg"
            >
              <Check className="w-3 h-3" />
              {kw}
            </span>
          ))}
        {showMissing &&
          filteredMissing.map((kw) => {
            const placement = placementMap.get(kw.toLowerCase());
            const isExpanded = expandedKeyword === kw;

            return (
              <div key={`x-${kw}`} className="relative">
                <button
                  onClick={() =>
                    placement &&
                    setExpandedKeyword(isExpanded ? null : kw)
                  }
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg transition-colors ${
                    placement
                      ? "cursor-pointer hover:bg-red-500/20"
                      : ""
                  }`}
                >
                  <X className="w-3 h-3" />
                  {kw}
                  {placement && (
                    <span
                      className={`ml-1 px-1.5 py-0 text-[10px] rounded border ${IMPORTANCE_COLORS[placement.importance]}`}
                    >
                      {placement.importance}
                    </span>
                  )}
                </button>

                {isExpanded && placement && (
                  <div className="absolute z-10 top-full left-0 mt-1 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">
                        Add to: {placement.suggestedSection}
                      </span>
                      <button
                        onClick={() => setExpandedKeyword(null)}
                        className="text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-900/50 rounded-lg px-2.5 py-2 font-mono leading-relaxed">
                      &ldquo;{placement.examplePhrase}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {filteredMatched.length === 0 && filteredMissing.length === 0 && (
        <p className="text-sm text-slate-600 text-center py-4">
          No keywords match your search
        </p>
      )}
    </div>
  );
}
