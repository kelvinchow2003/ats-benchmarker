"use client";

import { useState } from "react";
import { Github, Loader2, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import GitHubReviewPanel from "@/components/results/GitHubReviewPanel";
import type { GitHubReviewResult, EngineState } from "@/types/evaluation";

export default function GitHubReviewPage() {
  const [githubInput, setGithubInput] = useState("");
  const [reviewState, setReviewState] = useState<
    EngineState<GitHubReviewResult>
  >({
    status: "idle",
    result: null,
    error: null,
  });

  async function handleSubmit() {
    const trimmed = githubInput.trim();
    if (!trimmed) return;

    setReviewState({ status: "running", result: null, error: null });

    try {
      const res = await fetch("/api/engines/github-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUsername: trimmed }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "GitHub review failed");
      }

      const data: GitHubReviewResult = await res.json();
      setReviewState({ status: "done", result: data, error: null });
    } catch (err) {
      setReviewState({
        status: "error",
        result: null,
        error: err instanceof Error ? err.message : "GitHub review failed",
      });
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 mb-4">
          <Github className="w-6 h-6 text-slate-300" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100">
          GitHub Profile Review
        </h1>
        <p className="text-slate-400 mt-2 max-w-lg mx-auto">
          Get an AI-powered portfolio review of any public GitHub profile with
          actionable suggestions to improve your presence.
        </p>
      </div>

      {/* Input Card */}
      <Card className="mb-8 animate-fade-in-up delay-100">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-200">
            GitHub Profile
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={githubInput}
                onChange={(e) => setGithubInput(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    reviewState.status !== "running" &&
                    githubInput.trim()
                  ) {
                    handleSubmit();
                  }
                }}
                placeholder="e.g., octocat or https://github.com/octocat"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              />
            </div>
            <p className="text-xs text-slate-500">
              Enter a GitHub username or profile URL to review
            </p>
            <Button
              onClick={handleSubmit}
              loading={reviewState.status === "running"}
              disabled={
                reviewState.status === "running" || !githubInput.trim()
              }
              className="w-full"
            >
              {reviewState.status === "running"
                ? "Reviewing profile..."
                : "Review Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {reviewState.status === "running" && (
        <Card className="animate-fade-in-up">
          <CardContent>
            <div className="flex items-center gap-3 py-4 justify-center text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-sm">
                Fetching profile and running AI review...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {reviewState.status === "error" && (
        <Card className="animate-fade-in-up">
          <CardContent>
            <div className="flex items-center gap-2 text-red-400 text-sm py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{reviewState.error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {reviewState.status === "done" && reviewState.result && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-slate-300" />
              <h2 className="text-sm font-semibold text-slate-200">
                Profile Review
              </h2>
              <span className="text-xs text-slate-500 ml-auto">
                Score: {reviewState.result.score}/100
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <GitHubReviewPanel result={reviewState.result} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
