"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import Button from "@/components/ui/Button";
import type { PDFExportData } from "@/lib/pdf-export";

interface ExportButtonProps {
  data: PDFExportData;
}

export default function ExportButton({ data }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const { generateEvaluationPDF } = await import("@/lib/pdf-export");
      await generateEvaluationPDF(data);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      loading={loading}
      onClick={handleExport}
    >
      <Download className="w-3.5 h-3.5" />
      Export PDF
    </Button>
  );
}
