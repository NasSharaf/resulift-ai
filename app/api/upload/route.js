// app/api/upload/route.js
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { extractResumeText } from "@/app/utils/pdfExtraction";
import mammoth from "mammoth";

export const runtime = "nodejs";

export async function POST(req) {
  const { userId } = getAuth(req);
  const isIncognito = req.headers.get("x-incognito") === "true";

  if (isIncognito) {
    return NextResponse.json(
      { error: "Resumatch is not available in private browsing mode." },
      { status: 403 }
    );
  }

  // ------------------------------------
  // CREATE ANONYMOUS VISITOR COOKIE
  // ------------------------------------
  const cookieStore = await cookies();
  let visitorId = cookieStore.get("resumatch_vid")?.value;

  if (!userId && !visitorId) {
    visitorId = crypto.randomUUID();
    cookieStore.set("resumatch_vid", visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365
    });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    // -------------------------------------------------
    // CASE 1: NEW FILE UPLOAD (multipart/form-data)
    // -------------------------------------------------
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");

      if (!file || typeof file === "string" || file.size === 0) {
        return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
      }

      const isPDF = file.type === "application/pdf";
      const isDOCX =
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (!isPDF && !isDOCX) {
        return NextResponse.json(
          { error: "Only PDF or Word documents allowed." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const blob = await put(file.name, buffer, {
        access: "public",
        contentType: file.type
      });

      let extractedText = "";

      try {
        if (isPDF) {
          extractedText = await extractResumeText(blob.url);
        } else if (isDOCX) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const { value } = await mammoth.extractRawText({ buffer });
          extractedText = value;
        }
      } catch (err) {
        console.error("Resume extraction failed:", err);
      }

      // LOGGED-IN USERS GET DB ENTRY
      if (userId) {
        const inserted = await db
          .insert(resumes)
          .values({
            id: crypto.randomUUID(),
            userId,
            title: file.name,
            blobUrl: blob.url,
            extractedText,
            createdAt: new Date()
          })
          .returning({ id: resumes.id });

        return NextResponse.json({
          success: true,
          resumeURL: blob.url,
          resumeId: inserted[0].id,
          extractedText,
          fileName: file.name,
          fileSize: file.size
        });
      }

      // ANONYMOUS USERS: NO DB WRITE
      return NextResponse.json({
        success: true,
        resumeURL: blob.url,
        resumeId: null,
        extractedText,
        fileName: file.name,
        fileSize: file.size
      });
    }

    // -------------------------------------------------
    // CASE 2: EXISTING RESUME SELECTION (JSON)
    // -------------------------------------------------
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { resumeId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Anonymous users cannot load saved resumes." },
        { status: 403 }
      );
    }

    if (!resumeId) {
      return NextResponse.json({ error: "No resumeId provided" }, { status: 400 });
    }

    const rows = await db.select().from(resumes).where(eq(resumes.id, resumeId)).limit(1);
    const existingResume = rows[0];

    if (!existingResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      resumeURL: existingResume.blobUrl,
      resumeId: existingResume.id,
      extractedText: existingResume.extractedText,
      fileName: existingResume.title
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: "Server error", details: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
