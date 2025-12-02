// app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { jobs } from "@/db/schema";

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
    const { description } = body;

    if (!description) {
      return NextResponse.json({ 
        error: "Job description is required" 
      }, { status: 400 });
    }

    // Insert job into database
    const jobRecord = await db.insert(jobs).values({
      id: crypto.randomUUID(),
      userId,
      description,
      createdAt: new Date(),
    }).returning({ id: jobs.id });

    return NextResponse.json({
      success: true,
      jobId: jobRecord[0].id,
    });

  } catch (err) {
    console.error("JOB CREATION ERROR:", err);
    
    return NextResponse.json({
      error: "Server error",
      details: err.message,
    }, { status: 500 });
  }
}