"use client";

import { useState } from "react";
import {
  Linkedin,
  Loader2,
  AlertCircle,
  AlertTriangle,
  FileText,
  Globe,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import LinkedInReviewPanel from "@/components/results/LinkedInReviewPanel";
import type { LinkedInReviewResult, EngineState } from "@/types/evaluation";

type InputMode = "url" | "paste";

export default function LinkedInReviewPage() {
  const [mode, setMode] = useState<InputMode>("url");
  const [linkedinInput, setLinkedinInput] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [reviewState, setReviewState] = useState<
    EngineState<LinkedInReviewResult>
  >({
    status: "idle",
    result: null,
    error: null,
  });

  const canSubmitUrl =
    reviewState.status !== "running" && linkedinInput.trim().length > 0;
  const canSubmitPaste =
    reviewState.status !== "running" && pasteText.trim().length > 0;

  async function handleUrlSubmit() {
    if (!canSubmitUrl) return;

    setReviewState({ status: "running", result: null, error: null });
    setFetchError(null);

    try {
      const res = await fetch("/api/engines/linkedin-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinUrl: linkedinInput.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errorMessage = errData.error || "LinkedIn review failed";

        // Check if this is a fetch/access error → show warning + switch to paste
        if (
          errorMessage.includes("paste your profile text") ||
          errorMessage.includes("Could not access") ||
          errorMessage.includes("requiring sign-in") ||
          errorMessage.includes("Could not extract")
        ) {
          setFetchError(errorMessage);
          setMode("paste");
          setReviewState({ status: "idle", result: null, error: null });
          return;
        }

        throw new Error(errorMessage);
      }

      const data: LinkedInReviewResult = await res.json();
      setReviewState({ status: "done", result: data, error: null });
    } catch (err) {
      setReviewState({
        status: "error",
        result: null,
        error: err instanceof Error ? err.message : "LinkedIn review failed",
      });
    }
  }

  async function handlePasteSubmit() {
    if (!canSubmitPaste) return;

    setReviewState({ status: "running", result: null, error: null });

    try {
      const res = await fetch("/api/engines/linkedin-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileText: pasteText.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "LinkedIn review failed");
      }

      const data: LinkedInReviewResult = await res.json();
      setReviewState({ status: "done", result: data, error: null });
    } catch (err) {
      setReviewState({
        status: "error",
        result: null,
        error: err instanceof Error ? err.message : "LinkedIn review failed",
      });
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 mb-4">
          <Linkedin className="w-6 h-6 text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100">
          LinkedIn Profile Review
        </h1>
        <p className="text-slate-400 mt-2 max-w-lg mx-auto">
          Get an AI-powered review of your LinkedIn profile with actionable
          suggestions to improve your professional presence.
        </p>
      </div>

      {/* Input Card */}
      <Card className="mb-8 animate-fade-in-up delay-100">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-200">
            LinkedIn Profile
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mode toggle tabs */}
            <div className="flex rounded-xl bg-slate-900/50 border border-slate-700 p-1 gap-1">
              <button
                onClick={() => {
                  setMode("url");
                  setFetchError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
                  mode === "url"
                    ? "bg-slate-700/70 text-slate-100 font-medium shadow-sm"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Profile URL
              </button>
              <button
                onClick={() => setMode("paste")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
                  mode === "paste"
                    ? "bg-slate-700/70 text-slate-100 font-medium shadow-sm"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Paste Text
              </button>
            </div>

            {/* URL input mode */}
            {mode === "url" && (
              <div className="space-y-3">
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={linkedinInput}
                    onChange={(e) => setLinkedinInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canSubmitUrl) {
                        handleUrlSubmit();
                      }
                    }}
                    placeholder="e.g., johndoe or https://linkedin.com/in/johndoe"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Enter a LinkedIn profile URL or username.{" "}
                  <span className="text-slate-500/70">
                    Note: LinkedIn may block access — if so, use the Paste Text
                    tab instead.
                  </span>
                </p>

                <Button
                  onClick={handleUrlSubmit}
                  loading={reviewState.status === "running"}
                  disabled={!canSubmitUrl}
                  className="w-full"
                >
                  {reviewState.status === "running"
                    ? "Fetching profile..."
                    : "Review Profile"}
                </Button>
              </div>
            )}

            {/* Paste text mode */}
            {mode === "paste" && (
              <div className="space-y-3">
                {/* Show warning if switched from failed URL fetch */}
                {fetchError && (
                  <div className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-200/80">
                      {fetchError} You can paste your profile text below
                      instead.
                    </p>
                  </div>
                )}

                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste your LinkedIn profile text here — include your headline, summary, experience, skills, and education..."
                  rows={10}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-y"
                />

                {/* How to copy instructions */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg px-4 py-3">
                  <p className="text-xs font-medium text-slate-300 mb-2">
                    How to copy your LinkedIn profile text:
                  </p>
                  <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside">
                    <li>
                      Open your{" "}
                      <a
                        href="https://www.linkedin.com/in/me"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                      >
                        LinkedIn profile
                      </a>{" "}
                      in a browser
                    </li>
                    <li>
                      Scroll down to load all sections (Experience, Education,
                      Skills, etc.)
                    </li>
                    <li>Select all text on the page (Ctrl+A / Cmd+A)</li>
                    <li>Copy (Ctrl+C / Cmd+C) and paste it above</li>
                  </ol>
                </div>

                <Button
                  onClick={handlePasteSubmit}
                  loading={reviewState.status === "running"}
                  disabled={!canSubmitPaste}
                  className="w-full"
                >
                  {reviewState.status === "running"
                    ? "Reviewing profile..."
                    : "Review Profile"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {reviewState.status === "running" && (
        <Card className="animate-fade-in-up">
          <CardContent>
            <div className="flex items-center gap-3 py-4 justify-center text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-sm">Running AI review...</p>
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
              <Linkedin className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-slate-200">
                Profile Review
              </h2>
              <span className="text-xs text-slate-500 ml-auto">
                Score: {reviewState.result.score}/100
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <LinkedInReviewPanel result={reviewState.result} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
