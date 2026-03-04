"use client";

import { useState } from "react";
import { Search, Check, X } from "lucide-react";

interface KeywordGridProps {
  matched: string[];
  missing: string[];
}

export default function KeywordGrid({ matched, missing }: KeywordGridProps) {
  const [filter, setFilter] = useState("");
  const [view, setView] = useState<"all" | "matched" | "missing">("all");

  const filteredMatched = matched.filter((k) =>
    k.toLowerCase().includes(filter.toLowerCase())
  );
  const filteredMissing = missing.filter((k) =>
    k.toLowerCase().includes(filter.toLowerCase())
  );

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
          filteredMissing.map((kw) => (
            <span
              key={`x-${kw}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg"
            >
              <X className="w-3 h-3" />
              {kw}
            </span>
          ))}
      </div>

      {filteredMatched.length === 0 && filteredMissing.length === 0 && (
        <p className="text-sm text-slate-600 text-center py-4">
          No keywords match your search
        </p>
      )}
    </div>
  );
}
