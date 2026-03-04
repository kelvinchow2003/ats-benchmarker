"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";

interface UploadZoneProps {
  onSubmit: (pdfFile: File, jobDescription: string) => void;
  isProcessing: boolean;
}

export default function UploadZone({ onSubmit, isProcessing }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((f: File): boolean => {
    if (f.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return false;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB");
      return false;
    }
    setError(null);
    return true;
  }, []);

  function handleDrag(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected && validateFile(selected)) {
      setFile(selected);
    }
  }

  function handleSubmit() {
    if (!file) {
      setError("Please upload a resume PDF");
      return;
    }
    if (!jd.trim()) {
      setError("Please paste a job description");
      return;
    }
    if (jd.trim().length < 50) {
      setError("Job description seems too short — paste the full listing");
      return;
    }
    setError(null);
    onSubmit(file, jd.trim());
  }

  return (
    <div className="space-y-6">
      {/* PDF Drop Zone */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Resume (PDF)
        </label>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-8
            flex flex-col items-center justify-center gap-3
            cursor-pointer transition-all duration-200
            ${
              dragActive
                ? "border-blue-500 bg-blue-500/5"
                : file
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-slate-700 hover:border-slate-600 bg-slate-900/50"
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {file ? (
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="ml-2 p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-500" />
              <div className="text-center">
                <p className="text-sm text-slate-300">
                  Drop your resume here or{" "}
                  <span className="text-blue-400 underline underline-offset-2">
                    browse
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PDF only &middot; Max 10MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Job Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Job Description
        </label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={8}
          className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
        />
        <p className="text-xs text-slate-500 mt-1.5">
          {jd.length > 0
            ? `${jd.split(/\s+/).filter(Boolean).length} words`
            : "Tip: Include the full listing for best results"}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        loading={isProcessing}
        disabled={isProcessing}
        size="lg"
        className="w-full"
      >
        {isProcessing ? "Running 3 ATS engines..." : "Benchmark My Resume"}
      </Button>
    </div>
  );
}
