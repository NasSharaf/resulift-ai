export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { renderResumeHTML } from "@/renderTemplate";

export async function POST(req) {
  try {
    const { jsonResume, theme = "even" } = await req.json();
    if (!jsonResume) {
      return NextResponse.json({ error: "Missing jsonResume" }, { status: 400 });
    }

    const html = await renderResumeHTML(jsonResume, theme);

    const pdfRes = await fetch("https://resulift-pdf.fly.dev/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html }),
    });

    if (!pdfRes.ok) {
      const text = await pdfRes.text();
      console.error("Fly PDF error:", text);
      return NextResponse.json({ error: "PDF service failed" }, { status: 500 });
    }

    const pdf = await pdfRes.arrayBuffer();

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("PDF Error:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
