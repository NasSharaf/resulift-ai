// app/api/tailored-resumes/route.ts
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { tailoredResumes } from "@/db/schema";

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
    const body = await req.json();
    const { resumeId, jobId, tailoredText } = body;

    if (!resumeId || !jobId || !tailoredText) {
      return NextResponse.json({ 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    // Insert tailored resume into database
    const tailoredResumeRecord = await db.insert(tailoredResumes).values({
      id: crypto.randomUUID(),
      userId,
      resumeId,
      jobId,
      tailoredText,
      createdAt: new Date(),
    }).returning({ id: tailoredResumes.id });

    return NextResponse.json({
      success: true,
      tailoredResumeId: tailoredResumeRecord[0].id,
    });

  } catch (err) {
    console.error("TAILORED RESUME CREATION ERROR:", err);
    
    return NextResponse.json({
      error: "Server error",
      details: err.message,
    }, { status: 500 });
  }
}