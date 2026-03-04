"use client";

import { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  delay?: number;
  className?: string;
  showLabel?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  color = "from-blue-600 to-violet-600",
  delay = 0,
  className = "",
  showLabel = false,
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), delay);
    return () => clearTimeout(timer);
  }, [pct, delay]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
          style={{
            width: `${width}%`,
            transition: `width 800ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono text-slate-400 min-w-[3ch] text-right">
          {Math.round(value)}
        </span>
      )}
    </div>
  );
}
