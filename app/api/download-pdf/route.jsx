// app/api/download-pdf/route.jsx
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { renderResumeHTML } from "@/renderTemplate";

export async function POST(req) {
  try {
    const { jsonResume, theme = "even" } = await req.json();
    if (!jsonResume) {
      return NextResponse.json({ error: "Missing jsonResume" }, { status: 400 });
    }

    // Render React → HTML
    const html = await renderResumeHTML(jsonResume, theme);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await browser.close();

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resume.pdf",
      },
    });
  } catch (err) {
    console.error("PDF Error:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
