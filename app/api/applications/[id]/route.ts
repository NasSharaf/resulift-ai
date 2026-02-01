// app/api/applications/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: applicationId } = await params;
    const body = await req.json();

    // Fetch the application to verify ownership
    const [existingApp] = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.id, applicationId),
          eq(applications.userId, userId)
        )
      )
      .limit(1);

    if (!existingApp) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Update application with partial data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update fields that are provided
    if (body.companyName !== undefined) updateData.companyName = body.companyName;
    if (body.jobTitle !== undefined) updateData.jobTitle = body.jobTitle;
    if (body.applicationStatus !== undefined) updateData.applicationStatus = body.applicationStatus;
    if (body.appliedAt !== undefined) updateData.appliedAt = body.appliedAt ? new Date(body.appliedAt) : null;
    if (body.notes !== undefined) updateData.notes = body.notes;

    await db
      .update(applications)
      .set(updateData)
      .where(
        and(
          eq(applications.id, applicationId),
          eq(applications.userId, userId)
        )
      );

    // Fetch updated application
    const [updatedApp] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1);

    return NextResponse.json(updatedApp);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: applicationId } = await params;

    // Delete application (only if owned by user)
    const result = await db
      .delete(applications)
      .where(
        and(
          eq(applications.id, applicationId),
          eq(applications.userId, userId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
