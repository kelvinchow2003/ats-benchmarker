"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Trophy, AlertTriangle } from "lucide-react";
import ProgressBar from "@/components/ui/ProgressBar";
import type { SectionScoringResult } from "@/types/evaluation";

interface SectionScorePanelProps {
  result: SectionScoringResult;
}

const SECTION_COLORS: Record<string, string> = {
  Experience: "from-amber-500 to-amber-400",
  Skills: "from-sky-500 to-sky-400",
  Education: "from-violet-500 to-violet-400",
  Summary: "from-emerald-500 to-emerald-400",
  Projects: "from-blue-500 to-blue-400",
};

function getSectionColor(name: string): string {
  for (const [key, color] of Object.entries(SECTION_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return "from-slate-500 to-slate-400";
}

export default function SectionScorePanel({ result }: SectionScorePanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {result.sections.map((section) => {
        const isExpanded = expandedSection === section.sectionName;
        const isStrongest = section.sectionName === result.strongestSection;
        const isWeakest = section.sectionName === result.weakestSection;

        return (
          <div
            key={section.sectionName}
            className={`border rounded-xl overflow-hidden ${
              isStrongest
                ? "border-emerald-500/30"
                : isWeakest
                  ? "border-red-500/30"
                  : "border-slate-700/50"
            }`}
          >
            <button
              onClick={() =>
                setExpandedSection(isExpanded ? null : section.sectionName)
              }
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="text-sm font-medium text-slate-200 w-28 shrink-0 flex items-center gap-1.5">
                {section.sectionName}
                {isStrongest && (
                  <Trophy className="w-3 h-3 text-emerald-400" />
                )}
                {isWeakest && (
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                )}
              </span>
              <div className="flex-1">
                <ProgressBar
                  value={section.score}
                  color={getSectionColor(section.sectionName)}
                />
              </div>
              <span className="text-sm font-mono font-bold text-slate-300 w-10 text-right shrink-0">
                {section.score}
              </span>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-3">
                <p className="text-sm text-slate-400">{section.feedback}</p>

                {section.relevantKeywords.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1.5">
                      Matched Keywords
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {section.relevantKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-mono"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {section.missingKeywords.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1.5">
                      Missing Keywords
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {section.missingKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md font-mono"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
