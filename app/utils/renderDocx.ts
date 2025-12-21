import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";

export async function renderResumeDocx(jsonResume) {
  const {
    basics = {},
    work = [],
    education = [],
    skills = {},
    projects = [],
    publications = [],
  } = jsonResume;

  const children: (Paragraph | Table)[] = [];

  /* --------------------------------------------------
     HEADER
  -------------------------------------------------- */

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: basics.name || "",
          bold: true,
          size: 32, // 16pt
        }),
      ],
    })
  );

  if (basics.label) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: basics.label,
            italics: true,
          }),
        ],
      })
    );
  }

  const contactLine = [
    basics.email,
    basics.phone,
    basics.location?.city && basics.location?.region
      ? `${basics.location.city}, ${basics.location.region}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  if (contactLine) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        text: contactLine,
      })
    );
  }

  if (basics.summary) {
    children.push(
      new Paragraph({
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: basics.summary,
          }),
        ],
      })
    );
  }

  /* --------------------------------------------------
     EXPERIENCE
  -------------------------------------------------- */

  if (work.length) {
    children.push(
      new Paragraph({
        text: "Professional Experience",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      })
    );

    for (const job of work) {
      // Title + date row
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: job.position,
                          bold: true,
                        }),
                        new TextRun(` — ${job.company}`),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new TextRun({
                          text: `${job.startDate} – ${job.endDate || "Present"}`,
                          italics: true,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );

      if (job.summary) {
        children.push(
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: job.summary,
                italics: true,
              }),
            ],
          })
        );
      }

      if (job.highlights?.length) {
        for (const bullet of job.highlights) {
          children.push(
            new Paragraph({
              text: bullet,
              bullet: { level: 0 },
              spacing: { after: 100 },
            })
          );
        }
      }

      children.push(
        new Paragraph({
          spacing: { after: 200 },
          text: "",
        })
      );
    }
  }

  /* --------------------------------------------------
     EDUCATION
  -------------------------------------------------- */

  if (education.length) {
    children.push(
      new Paragraph({
        text: "Education",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      })
    );

    for (const edu of education) {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: edu.institution, bold: true }),
                        new TextRun(
                          edu.studyType && edu.area
                            ? ` — ${edu.studyType} in ${edu.area}`
                            : ""
                        ),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new TextRun({
                          text: `${edu.startDate} – ${edu.endDate || "Present"}`,
                          italics: true,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    }
  }

  /* --------------------------------------------------
     SKILLS
  -------------------------------------------------- */

  if (Object.keys(skills).length) {
    children.push(
      new Paragraph({
        text: "Skills",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      })
    );

    for (const [group, list] of Object.entries(skills as Record<string, string[]>)) {
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: `${group}: `, bold: true }),
            new TextRun(list.join(", ")),
          ],
        })
      );
    }
  }

  /* --------------------------------------------------
     PROJECTS
  -------------------------------------------------- */

  if (projects.length) {
    children.push(
      new Paragraph({
        text: "Projects",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      })
    );

    for (const proj of projects) {
      children.push(
        new Paragraph({
          spacing: { after: 150 },
          children: [
            new TextRun({ text: proj.name, bold: true }),
            proj.description
              ? new TextRun(` — ${proj.description}`)
              : null,
          ].filter(Boolean),
        })
      );
    }
  }

  /* --------------------------------------------------
     PUBLICATIONS
  -------------------------------------------------- */

  if (publications.length) {
    children.push(
      new Paragraph({
        text: "Publications",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      })
    );

    for (const pub of publications) {
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          text: pub.citation,
        })
      );
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
