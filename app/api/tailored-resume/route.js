import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { tailoredResumes } from "@/db/schema";
import { eq } from "drizzle-orm";

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
  const { resumeId, jobId, tailoredText } = data;

  if (!resumeId || !jobId || !tailoredText) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const ownerId = userId || visitorId;

  // Save tailored resume
  const recordId = crypto.randomUUID();
  await db.insert(tailoredResumes).values({
    id: recordId,
    userId: ownerId,
    resumeId,
    jobId,
    tailoredText,
    createdAt: new Date(),
  });

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
