import { Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/40 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Cpu className="w-3.5 h-3.5" />
          <span className="text-xs font-mono">
            ATS Resume Benchmarker
          </span>
        </div>
        <p className="text-xs text-slate-600">
          3 engines &middot; Keyword &middot; Semantic &middot; AI &middot;
          One composite score
        </p>
      </div>
    </footer>
  );
}
