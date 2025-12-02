// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { extractResumeText } from "@/app/utils/pdfExtraction";

export async function POST(req) {
  // Temporarily hardcode user ID
  // Get the authenticated user
    const { userId } = getAuth(req);
    // If no user is authenticated, return unauthorized
    if (!userId) {
      return NextResponse.json({
        error: "Unauthorized",
      }, { status: 401 });
    }

  try {
    const contentType = req.headers.get('content-type');

    if (contentType?.includes('multipart/form-data')) {
      // New file upload
      const form = await req.formData();
      
      // Log form contents
      for (const [key, value] of form.entries()) {
        console.log(`${key}:`, value);
      }

      const file = form.get("file");

      if (!file || file.size === 0) {
        console.error("No file or empty file");
        return NextResponse.json({ 
          error: "No file uploaded.", 
          details: "File is empty or not provided" 
        }, { status: 400 });
      }

      // More detailed file logging
      console.log("File Details:", {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Validate file type
      if (file.type !== 'application/pdf') {
        console.error("Invalid file type", file.type);
        return NextResponse.json({ 
          error: "Invalid file type", 
          details: "Only PDF files are allowed" 
        }, { status: 400 });
      }

      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Upload PDF to blob storage
      const blob = await put(file.name, buffer, { 
        access: "public",
        contentType: file.type 
      });

      // Extract text from PDF
      let extractedText = '';
      try {
        extractedText = await extractResumeText(blob.url);
      } catch (extractionError) {
        console.error("Text Extraction Failed:", extractionError);
      }

      // Save to database
      const resumeRecord = await db.insert(resumes).values({
        id: crypto.randomUUID(),
        userId,
        title: file.name,
        blobUrl: blob.url,
        extractedText,
        createdAt: new Date(),
      }).returning({ id: resumes.id });

      return NextResponse.json({
        success: true,
        resumeURL: blob.url,
        resumeId: resumeRecord[0].id,
        extractedText,
        fileSize: file.size,
        fileName: file.name,
      });

    } else {
      // Existing resume selection
      const body = await req.json();

      const resumeId = body?.resumeId;

      if (!resumeId) {
        console.error("No resume ID provided");
        return NextResponse.json({ 
          error: "No resume selected", 
          details: "Please provide a valid resumeId" 
        }, { status: 400 });
      }

      // Fetch existing resume
      const existingResume = await db.select()
        .from(resumes)
        .where(eq(resumes.id, resumeId))
        .get();

      if (!existingResume) {
        console.error("Resume not found", resumeId);
        return NextResponse.json({ 
          error: "Resume not found", 
          details: "Selected resume does not exist" 
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        resumeURL: existingResume.blobUrl,
        resumeId: existingResume.id,
        extractedText: existingResume.extractedText,
        fileName: existingResume.title,
      });
    }
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    
    return NextResponse.json({
      error: "Server error",
      details: err.message,
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';