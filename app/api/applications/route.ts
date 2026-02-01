// app/api/applications/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query params for sorting
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Fetch applications for this user
    const userApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(
        sortOrder === "asc"
          ? asc(applications[sortBy as keyof typeof applications] || applications.createdAt)
          : desc(applications[sortBy as keyof typeof applications] || applications.createdAt)
      );

    // Calculate ATS improvement percentage
    const applicationsWithImprovement = userApplications.map(app => ({
      ...app,
      atsImprovement: app.atsScoreBefore && app.atsScoreAfter
        ? Math.round(((app.atsScoreAfter - app.atsScoreBefore) / app.atsScoreBefore) * 100)
        : null,
    }));

    return NextResponse.json({
      applications: applicationsWithImprovement,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      jobId,
      tailoredResumeId,
      companyName,
      jobTitle,
      atsScoreBefore,
      atsScoreAfter,
    } = body;

    // Validate required fields
    if (!jobId || !tailoredResumeId) {
      return NextResponse.json(
        { error: "jobId and tailoredResumeId are required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const applicationId = `app_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create application
    await db.insert(applications).values({
      id: applicationId,
      userId,
      jobId,
      tailoredResumeId,
      companyName: companyName || null,
      jobTitle: jobTitle || null,
      applicationStatus: "generated",
      atsScoreBefore: atsScoreBefore || null,
      atsScoreAfter: atsScoreAfter || null,
      appliedAt: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    });

    // Fetch the created application
    const [createdApp] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1);

    return NextResponse.json(createdApp, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
