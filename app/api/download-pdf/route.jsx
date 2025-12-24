// app/api/download-pdf/route.jsx
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { renderResumeHTML } from "@/renderTemplate";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const isVercel = !!process.env.VERCEL;

export async function POST(req) {
  try {
    const { jsonResume, theme = "even" } = await req.json();
    if (!jsonResume) {
      return NextResponse.json({ error: "Missing jsonResume" }, { status: 400 });
    }

    // Render React → HTML
    const html = await renderResumeHTML(jsonResume, theme);

    // Launch Puppeteer
    const browser = await puppeteer.launch(
      isVercel
        ? {
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
          }
        : {
            channel: "chrome",
            headless: "new",
          }
    );

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await browser.close();

    const uint8 = new Uint8Array(pdf);

    return new Response(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
        "Content-Length": uint8.byteLength.toString(),
        "Cache-Control": "no-store",
      },
});
  } catch (err) {
    console.error("PDF Error:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
