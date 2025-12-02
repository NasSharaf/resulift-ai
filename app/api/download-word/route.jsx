import { NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun } from "docx";

export async function POST(req) {
  try {
    const { jsonResume } = await req.json();
    if (!jsonResume) {
      return NextResponse.json({ error: "Missing jsonResume" }, { status: 400 });
    }

    const { basics = {}, work = [], education = [], skills = [] } = jsonResume;

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: basics.name || "",
                  bold: true,
                  size: 32,
                }),
              ],
            }),

            basics.label
              ? new Paragraph({
                  spacing: { before: 200 },
                  children: [
                    new TextRun({
                      text: basics.label,
                      italics: true,
                      size: 24,
                    }),
                  ],
                })
              : null,

            basics.email
              ? new Paragraph({
                  spacing: { before: 200 },
                  children: [
                    new TextRun({ text: basics.email, size: 22 }),
                  ],
                })
              : null,

            // ---- EXPERIENCE SECTION ----
            new Paragraph({
              spacing: { before: 400 },
              children: [
                new TextRun({ text: "Experience", bold: true, size: 26 }),
              ],
            }),

            ...work.flatMap((job) => [
              new Paragraph({
                spacing: { before: 200 },
                children: [
                  new TextRun({
                    text: `${job.position} — ${job.name}`,
                    bold: true,
                    size: 22,
                  }),
                ],
              }),
              job.summary
                ? new Paragraph({
                    children: [new TextRun({ text: job.summary, size: 20 })],
                  })
                : null,
            ]),

            // ---- EDUCATION SECTION ----
            new Paragraph({
              spacing: { before: 400 },
              children: [
                new TextRun({ text: "Education", bold: true, size: 26 }),
              ],
            }),

            ...education.flatMap((edu) => [
              new Paragraph({
                spacing: { before: 200 },
                children: [
                  new TextRun({
                    text: `${edu.degree || edu.studyType} in ${edu.area} — ${edu.institution}`,
                    size: 22,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Graduated: ${edu.endDate || "Present"}`,
                    size: 20,
                  }),
                ],
              }),
            ]),

            // ---- SKILLS ----
            new Paragraph({
              spacing: { before: 400 },
              children: [
                new TextRun({ text: "Skills", bold: true, size: 26 }),
              ],
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: skills
                    .map((s) =>
                      typeof s === "string" ? s : s.name
                    )
                    .join(", "),
                  size: 20,
                }),
              ],
            }),
          ].filter(Boolean),
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": "attachment; filename=resume.docx",
      },
    });
  } catch (e) {
    console.error("Word Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
