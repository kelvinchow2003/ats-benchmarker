"use client";

import { useState } from "react";
import {
  ChevronDown,
  ThumbsUp,
  ArrowUpCircle,
  Linkedin,
  Briefcase,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { LinkedInReviewResult } from "@/types/evaluation";

interface LinkedInReviewPanelProps {
  result: LinkedInReviewResult;
}

function verdictVariant(
  verdict: string
): "success" | "info" | "warning" | "danger" {
  switch (verdict) {
    case "Excellent":
      return "success";
    case "Good":
      return "info";
    case "Needs Work":
      return "warning";
    case "Getting Started":
      return "danger";
    default:
      return "info";
  }
}

export default function LinkedInReviewPanel({
  result,
}: LinkedInReviewPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [showSections, setShowSections] = useState(true);
  const { profileData } = result;

  return (
    <div className="space-y-4">
      {/* Profile Summary */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant={verdictVariant(result.verdict)}>{result.verdict}</Badge>
        {profileData.name && (
          <div className="flex items-center gap-1.5 text-sm text-slate-300">
            <Linkedin className="w-3.5 h-3.5 text-blue-400" />
            {profileData.name}
          </div>
        )}
      </div>

      {/* Headline */}
      {profileData.headline && (
        <p className="text-xs text-slate-400">{profileData.headline}</p>
      )}

      {/* Feedback */}
      <p className="text-sm text-slate-300 leading-relaxed">
        {result.feedback}
      </p>

      {/* Collapsible Strengths / Improvements */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
        {expanded ? "Hide" : "Show"} detailed analysis
      </button>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Strengths
              </span>
            </div>
            <ul className="space-y-1.5">
              {result.strengths.map((item, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-300 pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-emerald-500/60"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <ArrowUpCircle className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Improvements
              </span>
            </div>
            <ul className="space-y-1.5">
              {result.improvements.map((item, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-300 pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-amber-500/60"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Section Highlights */}
      {result.sectionHighlights.length > 0 && (
        <>
          <button
            onClick={() => setShowSections(!showSections)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                showSections ? "rotate-180" : ""
              }`}
            />
            {showSections ? "Hide" : "Show"} section feedback (
            {result.sectionHighlights.length})
          </button>

          {showSections && (
            <div className="space-y-2">
              {result.sectionHighlights.map((highlight, i) => (
                <div
                  key={i}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-lg px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-sm font-medium text-slate-200">
                      {highlight.section}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{highlight.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
