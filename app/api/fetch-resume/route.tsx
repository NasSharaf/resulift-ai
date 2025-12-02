// app/api/fetch-resume/route.ts
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { resumes } from "@/db/schema";

export async function GET(req) {
  // Temporarily hardcode user ID
  // Get the authenticated user
  const { userId } = getAuth(req);
  console.log(userId);
  // If no user is authenticated, return unauthorized
  if (!userId) {
    return NextResponse.json({
      error: "Unauthorized",
    }, { status: 401 });
  }

  try {
    // Fetch all resumes for the user
    const userResumes = await db.select({
      id: resumes.id,
      title: resumes.title,
      blobUrl: resumes.blobUrl,
      createdAt: resumes.createdAt
    })
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(resumes.createdAt); // Optional: order by creation date

    return NextResponse.json({
      success: true,
      resumes: userResumes
    });

  } catch (err) {
    console.error("RESUME RETRIEVAL ERROR:", err);
    
    return NextResponse.json({
      error: "Server error",
      details: err.message,
    }, { status: 500 });
  }
}