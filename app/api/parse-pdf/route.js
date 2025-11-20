import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

// Force Node runtime for binary parsing
export const runtime = "nodejs";

export async function POST(req) {
  try {
    const data = await req.arrayBuffer();
    const buffer = Buffer.from(data);

    const parsed = await pdfParse(buffer);

    return NextResponse.json({ text: parsed.text });
  } catch (err) {
    console.error("PDF parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse PDF" },
      { status: 500 }
    );
  }
}
