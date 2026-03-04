"use client";

import { useState } from "react";
import { ChevronDown, ThumbsUp, ThumbsDown } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { AIRecruiterResult } from "@/types/evaluation";

interface AIFeedbackPanelProps {
  result: AIRecruiterResult;
}

function verdictVariant(
  verdict: string
): "success" | "info" | "warning" | "danger" {
  switch (verdict) {
    case "Strong Match":
      return "success";
    case "Moderate Match":
      return "info";
    case "Weak Match":
      return "warning";
    case "Not a Fit":
      return "danger";
    default:
      return "info";
  }
}

export default function AIFeedbackPanel({ result }: AIFeedbackPanelProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="space-y-4">
      {/* Verdict */}
      <div className="flex items-center gap-3">
        <Badge variant={verdictVariant(result.verdict)}>
          {result.verdict}
        </Badge>
      </div>

      {/* Feedback */}
      <p className="text-sm text-slate-300 leading-relaxed">
        {result.feedback}
      </p>

      {/* Collapsible Pros/Cons */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
        {expanded ? "Hide" : "Show"} detailed pros &amp; cons
      </button>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pros */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Strengths
              </span>
            </div>
            <ul className="space-y-1.5">
              {result.pros.map((pro, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-300 pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-emerald-500/60"
                  style={{
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  {pro}
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-400">
              <ThumbsDown className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Gaps
              </span>
            </div>
            <ul className="space-y-1.5">
              {result.cons.map((con, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-300 pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-red-500/60"
                  style={{
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
