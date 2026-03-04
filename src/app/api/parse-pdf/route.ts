import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

async function extractWithPdfjs(data: Uint8Array): Promise<{ text: string; pages: number }> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url
  ).toString();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(data),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
    disableFontFace: true,
    disableAutoFetch: true,
    disableStream: true,
  });
  const pdf = await loadingTask.promise;
  const pageTexts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings: string[] = [];
    for (const item of content.items) {
      if ("str" in item && typeof item.str === "string") {
        strings.push(item.str);
      }
    }
    pageTexts.push(strings.join(" "));
  }
  return { text: pageTexts.join("\n\n").trim(), pages: pdf.numPages };
}

async function extractWithPdfParse(buffer: Buffer): Promise<{ text: string; pages: number }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const result = await pdfParse(buffer);
  return { text: (result.text || "").trim(), pages: result.numpages || 1 };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let fullText = "";
    let pageCount = 0;

    // Try pdfjs-dist first, fall back to pdf-parse
    try {
      const result = await extractWithPdfjs(uint8Array);
      fullText = result.text;
      pageCount = result.pages;
    } catch (pdfjsError) {
      console.warn("pdfjs-dist failed, trying pdf-parse:", pdfjsError);
      try {
        const buffer = Buffer.from(arrayBuffer);
        const result = await extractWithPdfParse(buffer);
        fullText = result.text;
        pageCount = result.pages;
      } catch (parseError) {
        console.error("Both PDF parsers failed:", parseError);
        return NextResponse.json(
          { error: "Failed to parse PDF. Try a different file." },
          { status: 500 }
        );
      }
    }

    if (!fullText) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. It may be image-based." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: fullText, pageCount });
  } catch (error) {
    console.error("PDF parse error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to parse PDF: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}