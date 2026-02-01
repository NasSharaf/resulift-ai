// app/api/applications/export/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";

    // Fetch all applications for this user
    const userApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId));

    // Generate CSV
    if (format === "csv") {
      const headers = [
        "Company",
        "Position",
        "Status",
        "Applied Date",
        "ATS Before",
        "ATS After",
        "Improvement %",
        "Notes",
        "Created Date",
      ];

      const rows = userApplications.map(app => {
        const improvement = app.atsScoreBefore && app.atsScoreAfter
          ? Math.round(((app.atsScoreAfter - app.atsScoreBefore) / app.atsScoreBefore) * 100)
          : "";

        return [
          app.companyName || "",
          app.jobTitle || "",
          app.applicationStatus || "",
          app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "",
          app.atsScoreBefore || "",
          app.atsScoreAfter || "",
          improvement ? `${improvement}%` : "",
          app.notes || "",
          new Date(app.createdAt).toLocaleDateString(),
        ];
      });

      // Build CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map(row =>
          row.map(cell => {
            // Escape quotes and wrap in quotes if contains comma or newline
            const cellStr = String(cell);
            if (cellStr.includes(",") || cellStr.includes("\n") || cellStr.includes('"')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          }).join(",")
        ),
      ].join("\n");

      const filename = `my-applications-${new Date().toISOString().split('T')[0]}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // For XLSX format, we'll need to install a library
    // For now, return error
    return NextResponse.json(
      { error: "XLSX format not yet implemented. Please use CSV." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error exporting applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
