"use client";

import { useState } from "react";
import {
  ChevronDown,
  ThumbsUp,
  ArrowUpCircle,
  Star,
  ExternalLink,
  GitFork,
  Users,
  BookOpen,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { GitHubReviewResult } from "@/types/evaluation";

interface GitHubReviewPanelProps {
  result: GitHubReviewResult;
}

function verdictVariant(
  verdict: string
): "success" | "info" | "warning" | "danger" {
  switch (verdict) {
    case "Strong Match":
    case "Excellent":
      return "success";
    case "Moderate Match":
    case "Good":
      return "info";
    case "Weak Match":
    case "Needs Work":
      return "warning";
    case "Not a Fit":
    case "Getting Started":
      return "danger";
    default:
      return "info";
  }
}

export default function GitHubReviewPanel({ result }: GitHubReviewPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [showRepos, setShowRepos] = useState(true);
  const { profileData } = result;

  return (
    <div className="space-y-4">
      {/* Profile Summary */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant={verdictVariant(result.verdict)}>{result.verdict}</Badge>
        <a
          href={profileData.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          @{profileData.username}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          {profileData.publicRepos} repos
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {profileData.followers} followers
        </span>
        {profileData.bio && (
          <span className="text-slate-500 truncate max-w-[200px]">
            {profileData.bio}
          </span>
        )}
      </div>

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

      {/* Repo Highlights */}
      {result.repoHighlights.length > 0 && (
        <>
          <button
            onClick={() => setShowRepos(!showRepos)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                showRepos ? "rotate-180" : ""
              }`}
            />
            {showRepos ? "Hide" : "Show"} repo highlights (
            {result.repoHighlights.length})
          </button>

          {showRepos && (
            <div className="space-y-2">
              {result.repoHighlights.map((repo, i) => {
                // Find matching repo from profile data for extra info
                const repoData = profileData.repos.find(
                  (r) => r.name.toLowerCase() === repo.name.toLowerCase()
                );

                return (
                  <div
                    key={i}
                    className="bg-slate-800/40 border border-slate-700/50 rounded-lg px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <GitFork className="w-3.5 h-3.5 text-slate-500" />
                      {repoData ? (
                        <a
                          href={repoData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-400 hover:text-blue-300"
                        >
                          {repo.name}
                        </a>
                      ) : (
                        <span className="text-sm font-medium text-slate-200">
                          {repo.name}
                        </span>
                      )}
                      {repoData?.language && (
                        <span className="text-xs text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
                          {repoData.language}
                        </span>
                      )}
                      {repoData && repoData.stars > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-500">
                          <Star className="w-3 h-3" />
                          {repoData.stars}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{repo.relevance}</p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
