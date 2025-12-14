// app/api/fetch-resume/route.ts
import { NextResponse, NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { cookies } from "next/headers";
import { resumes } from "@/db/schema";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  const cookieStore = await cookies();
  let visitorId = cookieStore.get("resumatch_vid")?.value;

  if (!userId && !visitorId) {
    visitorId = crypto.randomUUID();
    const tempRes = NextResponse.next();
    tempRes.cookies.set("resumatch_vid", visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  try {
    const userResumes = await db
      .select({
        id: resumes.id,
        title: resumes.title,
        blobUrl: resumes.blobUrl,
        createdAt: resumes.createdAt,
      })
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(resumes.createdAt);

    return NextResponse.json({
      success: true,
      resumes: userResumes,
    });
  } catch (err: any) {
    console.error("RESUME RETRIEVAL ERROR:", err);
    return NextResponse.json(
      {
        error: "Server error",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
