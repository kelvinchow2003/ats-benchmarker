"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
  Briefcase,
} from "lucide-react";
import ProgressBar from "@/components/ui/ProgressBar";
import type { ExperienceMatchResult } from "@/types/evaluation";

interface ExperienceMatchPanelProps {
  result: ExperienceMatchResult;
}

const FIT_CONFIG = {
  good_match: {
    label: "Good Match",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: Check,
    description: "Your experience level aligns well with the role requirements.",
  },
  under_qualified: {
    label: "Under-Qualified",
    color: "text-red-400 bg-red-500/10 border-red-500/20",
    icon: ArrowDown,
    description: "Your experience falls short of some requirements. Emphasize relevant skills and projects.",
  },
  over_qualified: {
    label: "Over-Qualified",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    icon: ArrowUp,
    description: "You exceed the experience requirements. Consider emphasizing leadership and mentoring skills.",
  },
  no_data: {
    label: "No Data",
    color: "text-slate-400 bg-slate-500/10 border-slate-500/20",
    icon: Minus,
    description: "No specific experience requirements found in the job description.",
  },
};

const SENIORITY_LABELS: Record<string, string> = {
  intern: "Intern",
  entry: "Entry Level",
  mid: "Mid Level",
  "mid-senior": "Mid-Senior",
  senior: "Senior",
  lead: "Lead / Manager",
  executive: "Executive / Director",
  unknown: "Unknown",
};

export default function ExperienceMatchPanel({ result }: ExperienceMatchPanelProps) {
  const [showTimeline, setShowTimeline] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  const fitConfig = FIT_CONFIG[result.overallFit];
  const FitIcon = fitConfig.icon;

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Experience Match</span>
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border ${fitConfig.color}`}
          >
            <FitIcon className="w-3 h-3" />
            {fitConfig.label}
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
          result.score >= 70
            ? "from-emerald-500 to-emerald-400"
            : result.score >= 40
              ? "from-amber-500 to-amber-400"
              : "from-red-500 to-red-400"
        }
      />

      {/* Fit description */}
      <p className="text-xs text-slate-400">{fitConfig.description}</p>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="bg-slate-800/30 rounded-xl px-3 py-2.5 text-center">
          <p className="text-lg font-bold font-mono text-slate-100">
            {result.totalYears}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Total Years
          </p>
        </div>
        <div className="bg-slate-800/30 rounded-xl px-3 py-2.5 text-center">
          <p className="text-lg font-bold font-mono text-sky-400">
            {result.resumeEntries.length}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Positions
          </p>
        </div>
        <div className="bg-slate-800/30 rounded-xl px-3 py-2.5 text-center">
          <p className="text-sm font-bold font-mono text-violet-400">
            {SENIORITY_LABELS[result.candidateSeniority] || result.candidateSeniority}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Your Level
          </p>
        </div>
        <div className="bg-slate-800/30 rounded-xl px-3 py-2.5 text-center">
          <p className="text-sm font-bold font-mono text-amber-400">
            {SENIORITY_LABELS[result.jdSeniority] || result.jdSeniority}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            JD Level
          </p>
        </div>
      </div>

      {/* Requirement matches */}
      {result.requirementMatches.length > 0 && (
        <div className="border border-slate-700/50 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowRequirements(!showRequirements)}
            className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors cursor-pointer"
          >
            {showRequirements ? (
              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-sm font-medium text-slate-300">
              JD Requirements ({result.requirementMatches.length})
            </span>
          </button>

          {showRequirements && (
            <div className="px-4 pb-3 space-y-2">
              {result.requirementMatches.map((match, i) => {
                const statusConfig = {
                  meets: { icon: Check, color: "text-emerald-400", label: "Meets" },
                  exceeds: { icon: ArrowUp, color: "text-sky-400", label: "Exceeds" },
                  below: { icon: X, color: "text-red-400", label: "Below" },
                };
                const sc = statusConfig[match.status];
                const StatusIcon = sc.icon;

                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-xs bg-slate-800/20 rounded-lg px-3 py-2"
                  >
                    <StatusIcon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${sc.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 font-mono">
                        {match.requirement.rawText}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                        <span>
                          Required: <span className="text-slate-400 font-mono">{match.requirement.minYears}+ yrs</span>
                        </span>
                        <span>
                          You: <span className="text-slate-400 font-mono">{match.candidateYears} yrs</span>
                        </span>
                        <span className={sc.color}>
                          {match.gap >= 0 ? "+" : ""}{Math.round(match.gap * 10) / 10} yrs ({sc.label})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {result.jdRequirements.length === 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <Minus className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-xs text-slate-500">
            No specific experience-year requirements found in the job description.
          </span>
        </div>
      )}

      {/* Resume timeline */}
      {result.resumeEntries.length > 0 && (
        <div className="border border-slate-700/50 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors cursor-pointer"
          >
            {showTimeline ? (
              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-sm font-medium text-slate-300">
              Experience Timeline ({result.resumeEntries.length} positions)
            </span>
          </button>

          {showTimeline && (
            <div className="px-4 pb-3 space-y-2">
              {result.resumeEntries.map((entry, i) => {
                const startStr = new Date(entry.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                });
                const endStr = entry.isCurrent
                  ? "Present"
                  : new Date(entry.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    });

                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-xs"
                  >
                    <div className="flex items-center gap-1.5 shrink-0">
                      {entry.isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      <span className="font-mono text-slate-400 w-32">
                        {startStr} — {endStr}
                      </span>
                    </div>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          entry.isCurrent
                            ? "bg-emerald-500"
                            : "bg-sky-500/60"
                        }`}
                        style={{
                          width: `${Math.min(100, (entry.durationYears / Math.max(result.totalYears, 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="font-mono text-slate-500 shrink-0 w-12 text-right">
                      {entry.durationYears}y
                    </span>
                  </div>
                );
              })}
              <div className="flex justify-end pt-1">
                <span className="text-[10px] text-slate-500 font-mono">
                  Total (merged): {result.totalYears} years
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {result.resumeEntries.length === 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <X className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-xs text-red-400">
            No date ranges detected in resume. Ensure positions include start and end dates.
          </span>
        </div>
      )}
    </div>
  );
}
