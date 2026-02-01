import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { tailoredResumes, applications, jobs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { extractJobDetails } from "@/app/utils/extractJobDetails";

/**
 * Helper to parse cookies from Request object.
 */
function parseCookies(req) {
  const header = req.headers.get("cookie") || "";
  const parts = header.split("; ").filter(Boolean);

  return Object.fromEntries(
    parts.map((p) => {
      const [key, ...rest] = p.split("=");
      return [key, rest.join("=")];
    })
  );
}

export async function POST(req) {
  const { userId } = getAuth(req);

  // Parse cookies manually
  const cookies = parseCookies(req);
  let visitorId = cookies["resumatch_vid"];

  let needsSetCookie = false;

  if (!userId && !visitorId) {
    visitorId = crypto.randomUUID();
    needsSetCookie = true;
  }

  const data = await req.json();
  const { resumeId, jobId, tailoredText, atsScoreBefore, atsScoreAfter } = data;

  if (!resumeId || !jobId || !tailoredText) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const ownerId = userId || visitorId;

  // Save tailored resume with ATS scores
  const recordId = crypto.randomUUID();
  await db.insert(tailoredResumes).values({
    id: recordId,
    userId: ownerId,
    resumeId,
    jobId,
    tailoredText,
    atsScoreBefore: atsScoreBefore || null,
    atsScoreAfter: atsScoreAfter || null,
    createdAt: new Date(),
  });

  // Only create application for authenticated users
  if (userId) {
    try {
      // Fetch job description to extract details
      const [job] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId))
        .limit(1);

      let companyName = null;
      let jobTitle = null;

      if (job && job.description) {
        const extracted = extractJobDetails(job.description);
        companyName = extracted.companyName;
        jobTitle = extracted.jobTitle;
      }

      // Create application entry
      const applicationId = `app_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const now = new Date();

      await db.insert(applications).values({
        id: applicationId,
        userId: userId,
        jobId: jobId,
        tailoredResumeId: recordId,
        companyName: companyName,
        jobTitle: jobTitle,
        applicationStatus: "generated",
        atsScoreBefore: atsScoreBefore || null,
        atsScoreAfter: atsScoreAfter || null,
        appliedAt: null,
        notes: null,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      // Log error but don't fail the request
      console.error("Failed to create application entry:", error);
    }
  }

  // Build the response
  const response = NextResponse.json({
    success: true,
    id: recordId,
  });

  // Set cookie for anonymous visitor, if needed
  if (needsSetCookie) {
    response.cookies.set("resumatch_vid", visitorId, {
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }

  return response;
}
