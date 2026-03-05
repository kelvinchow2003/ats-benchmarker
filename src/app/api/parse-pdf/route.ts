import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";
export const maxDuration = 30;

async function extractText(data: Uint8Array): Promise<{ text: string; pages: number }> {
  const parser = new PDFParse({ data: data as unknown as ArrayBuffer });
  try {
    const result = await parser.getText();
    const info = await parser.getInfo();
    return {
      text: (result.text || "").trim(),
      pages: info.total || 1,
    };
  } finally {
    await parser.destroy();
  }
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

    try {
      const result = await extractText(uint8Array);
      fullText = result.text;
      pageCount = result.pages;
    } catch (parseError) {
      console.error("PDF parsing failed:", parseError);
      return NextResponse.json(
        { error: "Failed to parse PDF. Try a different file." },
        { status: 500 }
      );
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