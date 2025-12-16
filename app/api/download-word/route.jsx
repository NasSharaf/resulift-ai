export const runtime = "nodejs";

import { NextResponse } from "next/server";
import htmlToDocx from "html-to-docx";
import { renderResumeHTML } from "@/renderTemplate";

export async function POST(req) {
  try {
    const { jsonResume, theme = "even" } = await req.json();

    if (!jsonResume) {
      return NextResponse.json(
        { error: "Missing jsonResume" },
        { status: 400 }
      );
    }

    // 🔑 SAME SOURCE AS PDF
    const html = await renderResumeHTML(jsonResume, theme);

    const docxBuffer = await htmlToDocx(html, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    return new Response(docxBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": "attachment; filename=resume.docx",
      },
    });
  } catch (err) {
    console.error("Word Error:", err);
    return NextResponse.json(
      { error: "Word generation failed" },
      { status: 500 }
    );
  }
}
