"use client";

import { useEffect, useState } from "react";

interface CompositeScoreProps {
  compositeScore: number;
  legacyScore: number;
  semanticScore: number;
  aiScore: number;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#34d399"; // emerald-400
  if (score >= 60) return "#38bdf8"; // sky-400
  if (score >= 40) return "#fbbf24"; // amber-400
  return "#f87171"; // red-400
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

export default function CompositeScore({
  compositeScore,
  legacyScore,
  semanticScore,
  aiScore,
}: CompositeScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1200;

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // Elastic ease-out
      const ease = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(compositeScore * ease));
      if (t < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [compositeScore]);

  const color = getScoreColor(compositeScore);
  const label = getScoreLabel(compositeScore);

  // SVG arc parameters
  const size = 200;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270 degrees
  const offset = arcLength - (arcLength * animatedScore) / 100;

  const engines = [
    { name: "Legacy", score: legacyScore, color: "#f59e0b", weight: "30%" },
    { name: "Semantic", score: semanticScore, color: "#38bdf8", weight: "30%" },
    { name: "AI Recruiter", score: aiScore, color: "#a78bfa", weight: "40%" },
  ];

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Gauge */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-[135deg]"
        >
          {/* Background arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Score arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${color}40)`,
              transition:
                "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-bold font-mono"
            style={{ color }}
          >
            {animatedScore}
          </span>
          <span className="text-sm text-slate-400 mt-1">{label}</span>
        </div>
      </div>

      {/* Bar breakdown */}
      <div className="w-full max-w-sm space-y-4">
        {engines.map((engine, i) => (
          <EngineBar key={engine.name} {...engine} delay={i * 120} />
        ))}
      </div>
    </div>
  );
}

function EngineBar({
  name,
  score,
  color,
  weight,
  delay,
}: {
  name: string;
  score: number;
  color: string;
  weight: string;
  delay: number;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), delay + 200);
    return () => clearTimeout(timer);
  }, [score, delay]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-slate-300">{name}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">{weight}</span>
          <span className="text-sm font-mono font-bold" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            backgroundColor: color,
            transition: `width 800ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
            boxShadow: `0 0 12px ${color}30`,
          }}
        />
      </div>
    </div>
  );
}
