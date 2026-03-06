import type { EngineWeights } from "@/lib/weights";

export interface PDFExportData {
  compositeScore: number;
  legacyScore: number;
  semanticScore: number;
  aiScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  aiVerdict: string;
  aiFeedback: string;
  aiPros: string[];
  aiCons: string[];
  label?: string;
  date: string;
  weights?: EngineWeights;
}

// Colors (RGB tuples for jsPDF)
const BG = [2, 4, 9] as const;
const CARD_BG = [15, 23, 42] as const;
const BORDER = [30, 41, 59] as const;
const TEXT_PRIMARY = [226, 232, 240] as const;
const TEXT_SECONDARY = [148, 163, 184] as const;
const TEXT_MUTED = [100, 116, 139] as const;
const AMBER = [245, 158, 11] as const;
const SKY = [56, 189, 248] as const;
const VIOLET = [167, 139, 250] as const;
const EMERALD = [52, 211, 153] as const;
const RED = [248, 113, 113] as const;

function getScoreColor(score: number): readonly [number, number, number] {
  if (score >= 80) return EMERALD;
  if (score >= 60) return SKY;
  if (score >= 40) return AMBER;
  return RED;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

export async function generateEvaluationPDF(data: PDFExportData): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = 210;
  const pageH = 297;
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  function setColor(c: readonly [number, number, number]) {
    pdf.setTextColor(c[0], c[1], c[2]);
  }

  function drawCard(x: number, yPos: number, w: number, h: number) {
    pdf.setFillColor(CARD_BG[0], CARD_BG[1], CARD_BG[2]);
    pdf.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    pdf.roundedRect(x, yPos, w, h, 3, 3, "FD");
  }

  function checkPageBreak(needed: number) {
    if (y + needed > pageH - margin) {
      pdf.addPage();
      pdf.setFillColor(BG[0], BG[1], BG[2]);
      pdf.rect(0, 0, pageW, pageH, "F");
      y = margin;
    }
  }

  // Background
  pdf.setFillColor(BG[0], BG[1], BG[2]);
  pdf.rect(0, 0, pageW, pageH, "F");

  // Header
  pdf.setFontSize(18);
  setColor(TEXT_PRIMARY);
  pdf.setFont("helvetica", "bold");
  pdf.text("ATS Evaluation Report", margin, y + 6);
  y += 10;

  pdf.setFontSize(9);
  setColor(TEXT_MUTED);
  pdf.setFont("helvetica", "normal");
  const titleLine = data.label ? `${data.label}  •  ${data.date}` : data.date;
  pdf.text(titleLine, margin, y + 4);
  y += 12;

  // Divider
  pdf.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  pdf.line(margin, y, pageW - margin, y);
  y += 8;

  // ── Composite Score ──
  const scoreColor = getScoreColor(data.compositeScore);
  const scoreLabel = getScoreLabel(data.compositeScore);

  drawCard(margin, y, contentW, 35);

  pdf.setFontSize(11);
  setColor(TEXT_SECONDARY);
  pdf.setFont("helvetica", "normal");
  pdf.text("Composite Score", margin + 6, y + 8);

  pdf.setFontSize(32);
  setColor(scoreColor);
  pdf.setFont("helvetica", "bold");
  pdf.text(String(data.compositeScore), margin + 6, y + 25);

  pdf.setFontSize(11);
  pdf.text(scoreLabel, margin + 30, y + 25);

  // AI Verdict badge
  if (data.aiVerdict) {
    pdf.setFontSize(9);
    setColor(VIOLET);
    pdf.text(data.aiVerdict, pageW - margin - 6, y + 8, { align: "right" });
  }

  y += 40;

  // ── Engine Breakdown ──
  const engines = [
    { name: "Legacy ATS", score: data.legacyScore, color: AMBER, weight: data.weights?.legacy ?? 30 },
    { name: "Semantic ATS", score: data.semanticScore, color: SKY, weight: data.weights?.semantic ?? 30 },
    { name: "AI Recruiter", score: data.aiScore, color: VIOLET, weight: data.weights?.ai ?? 40 },
  ];

  drawCard(margin, y, contentW, 38);

  pdf.setFontSize(10);
  setColor(TEXT_SECONDARY);
  pdf.setFont("helvetica", "normal");
  pdf.text("Engine Breakdown", margin + 6, y + 8);

  const barY = y + 13;
  const barW = contentW - 55;

  engines.forEach((engine, i) => {
    const ey = barY + i * 8;

    pdf.setFontSize(8);
    setColor(TEXT_SECONDARY);
    pdf.text(`${engine.name} (${engine.weight}%)`, margin + 6, ey + 3);

    // Bar background
    pdf.setFillColor(BORDER[0], BORDER[1], BORDER[2]);
    pdf.roundedRect(margin + 50, ey, barW, 4, 1, 1, "F");

    // Bar fill
    pdf.setFillColor(engine.color[0], engine.color[1], engine.color[2]);
    const fillW = Math.max(1, (engine.score / 100) * barW);
    pdf.roundedRect(margin + 50, ey, fillW, 4, 1, 1, "F");

    // Score text
    pdf.setFontSize(8);
    setColor(engine.color);
    pdf.setFont("helvetica", "bold");
    pdf.text(String(engine.score), margin + 50 + barW + 3, ey + 3.5);
  });

  pdf.setFont("helvetica", "normal");
  y += 43;

  // ── Keywords ──
  checkPageBreak(50);

  const matchedCount = data.matchedKeywords.length;
  const missingCount = data.missingKeywords.length;
  const kwCardH = Math.max(30, 18 + Math.ceil(Math.max(matchedCount, missingCount) / 3) * 5 + 5);

  drawCard(margin, y, contentW, Math.min(kwCardH, 70));

  pdf.setFontSize(10);
  setColor(TEXT_SECONDARY);
  pdf.text("Keyword Analysis", margin + 6, y + 8);

  const halfW = contentW / 2;
  let kwY = y + 14;

  // Matched
  pdf.setFontSize(8);
  setColor(EMERALD);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Matched (${matchedCount})`, margin + 6, kwY);
  pdf.setFont("helvetica", "normal");
  kwY += 4;

  const maxKwLines = 8;
  const matchedDisplay = data.matchedKeywords.slice(0, maxKwLines * 3);
  for (let i = 0; i < matchedDisplay.length; i += 3) {
    const row = matchedDisplay.slice(i, i + 3).join(",  ");
    pdf.setFontSize(7);
    setColor(TEXT_MUTED);
    pdf.text(row, margin + 6, kwY + 3, { maxWidth: halfW - 10 });
    kwY += 4;
  }

  // Missing
  let missingY = y + 14;
  pdf.setFontSize(8);
  setColor(RED);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Missing (${missingCount})`, margin + halfW + 4, missingY);
  pdf.setFont("helvetica", "normal");
  missingY += 4;

  const missingDisplay = data.missingKeywords.slice(0, maxKwLines * 3);
  for (let i = 0; i < missingDisplay.length; i += 3) {
    const row = missingDisplay.slice(i, i + 3).join(",  ");
    pdf.setFontSize(7);
    setColor(TEXT_MUTED);
    pdf.text(row, margin + halfW + 4, missingY + 3, { maxWidth: halfW - 10 });
    missingY += 4;
  }

  y += Math.min(kwCardH, 70) + 5;

  // ── AI Feedback ──
  checkPageBreak(60);

  // Calculate needed height for AI feedback
  pdf.setFontSize(8);
  const feedbackLines = pdf.splitTextToSize(data.aiFeedback, contentW - 16);
  const prosText = data.aiPros.map((p) => `+ ${p}`);
  const consText = data.aiCons.map((c) => `- ${c}`);
  const aiCardH = 18 + feedbackLines.length * 4 + 8 + prosText.length * 4 + 4 + consText.length * 4 + 8;
  const clampedH = Math.min(aiCardH, pageH - y - margin - 15);

  drawCard(margin, y, contentW, clampedH);

  pdf.setFontSize(10);
  setColor(TEXT_SECONDARY);
  pdf.setFont("helvetica", "normal");
  pdf.text("AI Recruiter Feedback", margin + 6, y + 8);

  let aiY = y + 15;

  // Feedback text
  pdf.setFontSize(8);
  setColor(TEXT_PRIMARY);
  feedbackLines.slice(0, 6).forEach((line: string) => {
    if (aiY < y + clampedH - 5) {
      pdf.text(line, margin + 8, aiY);
      aiY += 4;
    }
  });

  aiY += 3;

  // Pros
  if (prosText.length > 0 && aiY < y + clampedH - 10) {
    pdf.setFontSize(8);
    setColor(EMERALD);
    pdf.setFont("helvetica", "bold");
    pdf.text("Strengths", margin + 8, aiY);
    pdf.setFont("helvetica", "normal");
    aiY += 4;

    prosText.slice(0, 5).forEach((line) => {
      if (aiY < y + clampedH - 5) {
        setColor(TEXT_SECONDARY);
        pdf.text(line, margin + 10, aiY, { maxWidth: contentW - 24 });
        aiY += 4;
      }
    });
    aiY += 2;
  }

  // Cons
  if (consText.length > 0 && aiY < y + clampedH - 10) {
    pdf.setFontSize(8);
    setColor(RED);
    pdf.setFont("helvetica", "bold");
    pdf.text("Areas for Improvement", margin + 8, aiY);
    pdf.setFont("helvetica", "normal");
    aiY += 4;

    consText.slice(0, 5).forEach((line) => {
      if (aiY < y + clampedH - 5) {
        setColor(TEXT_SECONDARY);
        pdf.text(line, margin + 10, aiY, { maxWidth: contentW - 24 });
        aiY += 4;
      }
    });
  }

  y += clampedH + 5;

  // ── Footer ──
  checkPageBreak(10);
  pdf.setFontSize(7);
  setColor(TEXT_MUTED);
  pdf.text(
    "Generated by ATS Resume Benchmarker",
    pageW / 2,
    pageH - 8,
    { align: "center" }
  );

  // Save
  const slug = data.label
    ? data.label.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()
    : "evaluation";
  pdf.save(`ats-report-${slug}.pdf`);
}
