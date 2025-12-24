// app/api/download-pdf/route.jsx
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { renderResumeHTML } from "@/renderTemplate";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// Comprehensive environment detection
const isProd = process.env.NODE_ENV === "production";
const isVercel = !!process.env.VERCEL;

export async function POST(req) {
  try {
    const { jsonResume, theme = "even" } = await req.json();
    if (!jsonResume) {
      return NextResponse.json({ error: "Missing jsonResume" }, { status: 400 });
    }

    // Render React → HTML
    const html = await renderResumeHTML(jsonResume, theme);

    // Detailed browser launch configuration
    const launchOptions = isVercel 
      ? {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
          // Additional Vercel-specific options
          ignoreDefaultArgs: ['--disable-extensions'],
        }
      : {
          channel: "chrome", // Fallback for local development
          headless: "new",
        };

    // Enhanced logging for diagnostics
    console.log("Launch Options:", JSON.stringify({
      isProd,
      isVercel,
      executablePath: launchOptions.executablePath || 'Not set',
      args: launchOptions.args ? launchOptions.args.length : 0
    }, null, 2));

    // Launch browser with comprehensive error handling
    let browser;
    try {
      browser = await puppeteer.launch(launchOptions);
    } catch (launchError) {
      console.error("Browser Launch Error:", launchError);
      
      // Attempt alternative launch method
      if (isVercel) {
        try {
          browser = await puppeteer.launch({
            channel: "chrome",
            headless: "new",
          });
        } catch (fallbackError) {
          console.error("Fallback Launch Error:", fallbackError);
          throw launchError; // Rethrow original error if fallback fails
        }
      } else {
        throw launchError;
      }
    }

    const page = await browser.newPage();
    
    // Enhanced page content setting
    await page.setContent(html, { 
      waitUntil: "networkidle0",
      timeout: 10000 // 10-second timeout
    });

    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
      preferCSSPageSize: true, // Respect CSS page size if defined
    });

    await browser.close();

    const uint8 = new Uint8Array(pdf);

    return new Response(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
        "Content-Length": uint8.byteLength.toString(),
        "Cache-Control": "no-store, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0"
      },
    });
  } catch (err) {
    // Comprehensive error logging
    console.error("PDF Generation Error:", {
      message: err.message,
      name: err.name,
      stack: err.stack,
      environment: {
        isProd,
        isVercel,
        nodeVersion: process.version,
        platform: process.platform
      }
    });

    return NextResponse.json({ 
      error: "PDF generation failed", 
      details: err.message 
    }, { status: 500 });
  }
}