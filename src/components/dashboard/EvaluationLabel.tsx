"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pencil, Check } from "lucide-react";

interface EvaluationLabelProps {
  evaluationId: string;
  initialLabel: string | null;
  fallbackText: string;
}

export default function EvaluationLabel({
  evaluationId,
  initialLabel,
  fallbackText,
}: EvaluationLabelProps) {
  const [label, setLabel] = useState(initialLabel ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase
        .from("evaluations")
        .update({ label: label.trim() || null })
        .eq("id", evaluationId);
    } catch {
      // Silent fail
    }
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <div
        className="flex items-center gap-2"
        onClick={(e) => e.preventDefault()}
      >
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setEditing(false);
          }}
          maxLength={100}
          autoFocus
          className="flex-1 min-w-0 bg-slate-800/50 border border-slate-600 rounded-lg px-2 py-1 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          placeholder="Add a label..."
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="p-1 rounded-lg hover:bg-slate-700 text-emerald-400 transition-colors cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group min-w-0">
      <p className="text-sm text-slate-200 truncate">
        {label.trim() || fallbackText}
      </p>
      <button
        onClick={(e) => {
          e.preventDefault();
          setEditing(true);
        }}
        className="p-1 rounded-lg hover:bg-slate-700 text-slate-600 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  );
}
