"use client";

import { useState } from "react";
import {
  Check,
  X,
  Minus,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Info,
} from "lucide-react";
import ProgressBar from "@/components/ui/ProgressBar";
import type { StructureScoringResult } from "@/types/evaluation";

interface StructureScorePanelProps {
  result: StructureScoringResult;
}

const IMPORTANCE_STYLES = {
  critical: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Critical" },
  important: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Important" },
  optional: { text: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", label: "Optional" },
};

const LENGTH_CONFIG = {
  too_short: { label: "Too Short", color: "text-red-400", description: "Resume may lack sufficient detail. Aim for at least 400-500 words." },
  ideal: { label: "Ideal", color: "text-emerald-400", description: "Resume length is appropriate." },
  slightly_long: { label: "Slightly Long", color: "text-amber-400", description: "Consider trimming less relevant content. Most resumes should be 1-2 pages." },
  too_long: { label: "Too Long", color: "text-red-400", description: "Resume is too verbose. Recruiters spend 6-7 seconds on initial scan. Focus on most impactful content." },
};

export default function StructureScorePanel({ result }: StructureScorePanelProps) {
  const [showIssues, setShowIssues] = useState(false);

  const lengthInfo = LENGTH_CONFIG[result.lengthAssessment];

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Structure Score</span>
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
          <p className="text-lg font-bold font-mono text-slate-100">
            ~{result.estimatedPages}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Pages
          </p>
        </div>
        <div className="bg-slate-800/30 rounded-xl px-3 py-2.5 text-center">
          <p className="text-lg font-bold font-mono text-sky-400">
            {result.totalWords}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Words
          </p>
        </div>
        <div className="bg-slate-800/30 rounded-xl px-3 py-2.5 text-center">
          <p className="text-lg font-bold font-mono text-emerald-400">
            {result.bulletCount}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Bullets
          </p>
        </div>
        <div className="bg-slate-800/30 rounded-xl px-3 py-2.5 text-center">
          <p className={`text-lg font-bold font-mono ${lengthInfo.color}`}>
            {lengthInfo.label}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Length
          </p>
        </div>
      </div>

      {/* Section checklist */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Section Checklist</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {result.sections.map((section) => {
            const style = IMPORTANCE_STYLES[section.importance];
            return (
              <div
                key={section.name}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/20"
              >
                {section.found ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : section.importance === "optional" ? (
                  <Minus className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                )}
                <span
                  className={`text-xs font-medium ${
                    section.found
                      ? "text-slate-300"
                      : section.importance === "optional"
                        ? "text-slate-600"
                        : "text-red-400"
                  }`}
                >
                  {section.name}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0 rounded border ml-auto ${style.text} ${style.bg} ${style.border}`}
                >
                  {style.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 text-[10px] text-slate-500 pt-1">
          <span>
            Critical: {result.criticalSectionsFound}/{result.criticalSectionsTotal}
          </span>
          <span>
            Important: {result.importantSectionsFound}/{result.importantSectionsTotal}
          </span>
          <span>
            Optional: {result.optionalSectionsFound} found
          </span>
        </div>
      </div>

      {/* Length assessment */}
      <div className="bg-slate-800/30 rounded-xl px-4 py-3">
        <p className="text-xs text-slate-500 mb-1">Length Assessment</p>
        <p className={`text-sm font-medium ${lengthInfo.color}`}>
          {lengthInfo.description}
        </p>
        <p className="text-xs text-slate-600 mt-1">
          {result.totalWords} words · {result.totalLines} lines · avg {result.avgLineLength} chars/line
        </p>
      </div>

      {/* Formatting issues */}
      {result.formattingIssues.length > 0 && (
        <div className="border border-slate-700/50 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowIssues(!showIssues)}
            className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors cursor-pointer"
          >
            {showIssues ? (
              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-sm font-medium text-amber-400">
              Formatting Issues ({result.formattingIssues.length})
            </span>
          </button>

          {showIssues && (
            <div className="px-4 pb-3 space-y-2">
              {result.formattingIssues.map((issue, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs"
                >
                  {issue.severity === "warning" ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  )}
                  <span
                    className={
                      issue.severity === "warning"
                        ? "text-amber-400"
                        : "text-blue-400"
                    }
                  >
                    {issue.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {result.formattingIssues.length === 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-sm text-emerald-400">
            No formatting issues detected
          </span>
        </div>
      )}
    </div>
  );
}
