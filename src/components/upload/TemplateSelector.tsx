"use client";

import { useState, useCallback } from "react";
import { FileText, X, Search, ChevronRight } from "lucide-react";
import { JD_TEMPLATES, JD_CATEGORIES, type JDCategory } from "@/data/jd-templates";
import Button from "@/components/ui/Button";

interface TemplateSelectorProps {
  onSelect: (content: string) => void;
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<JDCategory>("Engineering");
  const [search, setSearch] = useState("");

  const filtered = JD_TEMPLATES.filter((t) => {
    const matchesCategory = !search && t.category === activeCategory;
    const matchesSearch =
      search &&
      (t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory || matchesSearch;
  });

  const handleSelect = useCallback(
    (content: string) => {
      onSelect(content);
      setIsOpen(false);
      setSearch("");
    },
    [onSelect]
  );

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors mb-2"
      >
        <FileText className="w-3.5 h-3.5" />
        Use a template
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          setIsOpen(false);
          setSearch("");
        }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[80vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-slate-950 flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
          <h3 className="text-sm font-semibold text-slate-200">
            Job Description Templates
          </h3>
          <button
            onClick={() => {
              setIsOpen(false);
              setSearch("");
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-slate-800/60">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Category sidebar */}
          {!search && (
            <div className="w-44 shrink-0 border-r border-slate-800/60 py-2">
              {JD_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                    activeCategory === cat
                      ? "text-blue-400 bg-blue-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  {cat}
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              ))}
            </div>
          )}

          {/* Template list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No templates found
              </p>
            ) : (
              filtered.map((template) => (
                <div
                  key={template.id}
                  className="group border border-slate-800 rounded-xl p-4 hover:border-slate-700 hover:bg-slate-800/30 transition-all cursor-pointer"
                  onClick={() => handleSelect(template.content)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                        {template.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {template.description}
                      </p>
                      {search && (
                        <span className="inline-block text-xs text-slate-600 mt-1.5 font-mono">
                          {template.category}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(template.content);
                      }}
                    >
                      Use
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
