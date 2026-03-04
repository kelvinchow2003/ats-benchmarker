import type { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "legacy"
  | "semantic"
  | "ai";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-800 text-slate-300 border-slate-700",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  danger: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  legacy: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  semantic: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  ai: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1
        text-xs font-medium font-mono
        border rounded-lg
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
