"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface ChartEvaluation {
  id: string;
  compositeScore: number;
  legacyScore: number;
  semanticScore: number;
  aiScore: number;
  label: string | null;
  createdAt: string;
}

interface ScoreHistoryChartProps {
  evaluations: ChartEvaluation[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getDotColor(score: number): string {
  if (score >= 80) return "#34d399";
  if (score >= 60) return "#38bdf8";
  if (score >= 40) return "#fbbf24";
  return "#f87171";
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: { composite: number };
}

function CustomDot({ cx, cy, payload }: CustomDotProps) {
  if (cx == null || cy == null || !payload) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={getDotColor(payload.composite)}
      stroke="#0f172a"
      strokeWidth={2}
    />
  );
}

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color: string;
  name: string;
  payload?: Record<string, unknown>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {typeof data?.label === "string" && data.label && (
        <p className="text-xs text-slate-300 font-medium mb-2 truncate max-w-[180px]">
          {data.label}
        </p>
      )}
      {payload.map((item) => (
        <div key={item.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-slate-400">{item.name}:</span>
          <span className="font-mono font-bold" style={{ color: item.color }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ScoreHistoryChart({
  evaluations,
}: ScoreHistoryChartProps) {
  const [mounted, setMounted] = useState(false);
  const [showEngines, setShowEngines] = useState({
    legacy: false,
    semantic: false,
    ai: false,
  });

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-[280px] bg-slate-800/30 rounded-xl animate-pulse" />;
  }

  // Sort chronologically and take last 20
  const data = [...evaluations]
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    .slice(-20)
    .map((e) => ({
      date: formatDate(e.createdAt),
      composite: Math.round(e.compositeScore),
      legacy: Math.round(e.legacyScore),
      semantic: Math.round(e.semanticScore),
      ai: Math.round(e.aiScore),
      label: e.label,
    }));

  const toggles = [
    { key: "legacy" as const, label: "Legacy", color: "#f59e0b" },
    { key: "semantic" as const, label: "Semantic", color: "#38bdf8" },
    { key: "ai" as const, label: "AI", color: "#a78bfa" },
  ];

  return (
    <div>
      {/* Toggle buttons */}
      <div className="flex items-center gap-3 mb-4">
        {toggles.map((t) => (
          <button
            key={t.key}
            onClick={() =>
              setShowEngines((prev) => ({ ...prev, [t.key]: !prev[t.key] }))
            }
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              showEngines[t.key]
                ? "border-slate-600 bg-slate-800"
                : "border-slate-800 bg-transparent text-slate-600 hover:text-slate-400"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: showEngines[t.key] ? t.color : "#475569",
              }}
            />
            {t.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#1e293b" }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Composite line - always visible */}
          <Line
            type="monotone"
            dataKey="composite"
            name="Composite"
            stroke="url(#compositeGradient)"
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={{ r: 6, stroke: "#0f172a", strokeWidth: 2 }}
          />

          {/* Optional engine lines */}
          {showEngines.legacy && (
            <Line
              type="monotone"
              dataKey="legacy"
              name="Legacy"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          )}
          {showEngines.semantic && (
            <Line
              type="monotone"
              dataKey="semantic"
              name="Semantic"
              stroke="#38bdf8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          )}
          {showEngines.ai && (
            <Line
              type="monotone"
              dataKey="ai"
              name="AI Recruiter"
              stroke="#a78bfa"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          )}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="compositeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
