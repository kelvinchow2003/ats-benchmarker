"use client";

import { useCallback } from "react";
import { RotateCcw } from "lucide-react";
import type { EngineWeights } from "@/lib/weights";
import { DEFAULT_WEIGHTS, isDefaultWeights } from "@/lib/weights";
import Badge from "@/components/ui/Badge";

interface WeightSlidersProps {
  weights: EngineWeights;
  onChange: (weights: EngineWeights) => void;
}

const ENGINES: {
  key: keyof EngineWeights;
  label: string;
  color: string;
  trackColor: string;
}[] = [
  {
    key: "legacy",
    label: "Legacy ATS",
    color: "#f59e0b",
    trackColor: "accent-amber-500",
  },
  {
    key: "semantic",
    label: "Semantic ATS",
    color: "#38bdf8",
    trackColor: "accent-sky-400",
  },
  {
    key: "ai",
    label: "AI Recruiter",
    color: "#a78bfa",
    trackColor: "accent-violet-400",
  },
];

export default function WeightSliders({
  weights,
  onChange,
}: WeightSlidersProps) {
  const handleChange = useCallback(
    (key: keyof EngineWeights, newValue: number) => {
      const keys = ENGINES.map((e) => e.key);
      const otherKeys = keys.filter((k) => k !== key);
      const delta = newValue - weights[key];
      const otherSum = otherKeys.reduce((s, k) => s + weights[k], 0);

      const next: EngineWeights = { ...weights, [key]: newValue };

      if (otherSum > 0) {
        for (const k of otherKeys) {
          next[k] = Math.max(0, Math.round(weights[k] - (delta * weights[k]) / otherSum));
        }
      } else {
        const remaining = 100 - newValue;
        next[otherKeys[0]] = Math.round(remaining / 2);
        next[otherKeys[1]] = remaining - Math.round(remaining / 2);
      }

      // Fix rounding errors
      const total = next.legacy + next.semantic + next.ai;
      if (total !== 100) {
        const diff = 100 - total;
        // Apply correction to the largest other weight
        const correctionKey = otherKeys.reduce((a, b) =>
          next[a] >= next[b] ? a : b
        );
        next[correctionKey] = Math.max(0, next[correctionKey] + diff);
      }

      onChange(next);
    },
    [weights, onChange]
  );

  const isCustom = !isDefaultWeights(weights);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">
            Engine Weights
          </span>
          {isCustom && <Badge variant="info">Custom</Badge>}
        </div>
        {isCustom && (
          <button
            onClick={() => onChange(DEFAULT_WEIGHTS)}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {ENGINES.map((engine) => (
        <div key={engine.key}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">{engine.label}</span>
            <span
              className="text-xs font-mono font-bold"
              style={{ color: engine.color }}
            >
              {weights[engine.key]}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={weights[engine.key]}
            onChange={(e) =>
              handleChange(engine.key, Number(e.target.value))
            }
            className={`w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer ${engine.trackColor}`}
            style={
              {
                "--thumb-color": engine.color,
              } as React.CSSProperties
            }
          />
        </div>
      ))}
    </div>
  );
}
