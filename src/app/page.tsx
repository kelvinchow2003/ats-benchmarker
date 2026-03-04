import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  Brain,
  Sparkles,
  BarChart3,
} from "lucide-react";
import Button from "@/components/ui/Button";

const engines = [
  {
    icon: <Cpu className="w-5 h-5 text-amber-500" />,
    title: "Legacy Keyword ATS",
    description:
      "Classic keyword extraction with compound phrase preservation. Simulates traditional applicant tracking systems.",
    accent: "border-amber-500/20 bg-amber-500/5",
    tag: "No API",
    tagColor: "text-amber-500",
  },
  {
    icon: <Brain className="w-5 h-5 text-sky-400" />,
    title: "Semantic ATS",
    description:
      "Cohere embeddings with cosine similarity. Understands meaning, not just keywords.",
    accent: "border-sky-500/20 bg-sky-500/5",
    tag: "Cohere",
    tagColor: "text-sky-400",
  },
  {
    icon: <Sparkles className="w-5 h-5 text-violet-400" />,
    title: "AI Recruiter",
    description:
      "Gemini 1.5 Flash structured evaluation. Provides verdict, feedback, pros and cons.",
    accent: "border-violet-500/20 bg-violet-500/5",
    tag: "Gemini",
    tagColor: "text-violet-400",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <section className="py-24 sm:py-32 text-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-full mb-8">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-medium text-slate-400">
              3 engines &middot; 1 composite score
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-100 leading-[1.1]">
            Benchmark your resume
            <br />
            <span className="gradient-text">against any job.</span>
          </h1>

          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload your PDF resume and paste a job description. We run it through
            3 distinct ATS simulation engines in parallel and return a detailed
            scoring breakdown.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/evaluate">
              <Button size="lg">
                Start benchmarking
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign in to save results
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Engine Cards */}
      <section className="pb-24 sm:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {engines.map((engine, i) => (
            <div
              key={engine.title}
              className={`
                animate-fade-in-up border rounded-2xl p-6 space-y-4
                ${engine.accent}
              `}
              style={{ animationDelay: `${(i + 1) * 120}ms` }}
            >
              <div className="flex items-center justify-between">
                {engine.icon}
                <span
                  className={`text-xs font-mono font-medium ${engine.tagColor}`}
                >
                  {engine.tag}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-200">
                {engine.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {engine.description}
              </p>
            </div>
          ))}
        </div>

        {/* Composite formula */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs font-mono text-slate-500">
              Composite =
            </span>
            <span className="text-xs font-mono text-amber-500">
              Legacy × 0.30
            </span>
            <span className="text-xs text-slate-600">+</span>
            <span className="text-xs font-mono text-sky-400">
              Semantic × 0.30
            </span>
            <span className="text-xs text-slate-600">+</span>
            <span className="text-xs font-mono text-violet-400">
              AI × 0.40
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
