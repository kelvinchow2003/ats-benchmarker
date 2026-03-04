"use client";

import { useEffect, useState } from "react";
import type { EngineStatus } from "@/types/evaluation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ScoreCardProps {
  title: string;
  subtitle: string;
  score: number | null;
  status: EngineStatus;
  accentColor: string;
  accentBg: string;
  icon: React.ReactNode;
  delay?: number;
  children?: React.ReactNode;
}

export default function ScoreCard({
  title,
  subtitle,
  score,
  status,
  accentColor,
  accentBg,
  icon,
  delay = 0,
  children,
}: ScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (status !== "done" || score === null) return;

    const timer = setTimeout(() => {
      let frame: number;
      const start = performance.now();
      const duration = 900;

      function tick(now: number) {
        const elapsed = now - start;
        const t = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setDisplayScore(Math.round((score ?? 0) * ease));
        if (t < 1) frame = requestAnimationFrame(tick);
      }

      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }, delay);

    return () => clearTimeout(timer);
  }, [status, score, delay]);

  return (
    <div
      className={`
        bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden
        transition-all duration-300
        ${status === "done" ? "opacity-100 translate-y-0" : ""}
        ${status === "running" ? "opacity-90" : ""}
        ${status === "error" ? "border-red-500/30" : ""}
      `}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${accentBg} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${accentColor}`}>{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {status === "running" && (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          )}
          {status === "done" && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          {status === "error" && (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
        </div>
      </div>

      {/* Score */}
      <div className="px-5 py-6 flex items-center justify-center">
        {status === "idle" && (
          <span className="text-slate-600 text-sm">Waiting...</span>
        )}
        {status === "running" && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
            <span className="text-xs text-slate-500">Analyzing...</span>
          </div>
        )}
        {status === "done" && score !== null && (
          <span
            className={`text-5xl font-bold font-mono ${accentColor}`}
            style={{
              opacity: displayScore > 0 ? 1 : 0.3,
              transition: "opacity 400ms",
            }}
          >
            {displayScore}
          </span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-400">Engine failed</span>
        )}
      </div>

      {/* Extra content */}
      {children && status === "done" && (
        <div className="px-5 pb-5 border-t border-slate-800/40 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}
