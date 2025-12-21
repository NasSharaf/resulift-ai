import React from "react";
import { formatLocation } from "./utils/formatLocation";
import { groupSkills } from "./utils/groupSkills";

export function BaseTemplate({
  jsonResume,
  renderTarget = "web",

  /* CONTAINER + GLOBAL CLASSES */
  containerClass = "bg-white text-gray-900 p-8",

  /* HEADER CLASSES */
  headerContainerClass = "text-center mb-6 border-b border-gray-300 pb-4",
  nameClass = "text-3xl font-bold",
  labelClass = "text-lg text-gray-600 mt-1",
  contactClass = "mt-2 text-sm text-gray-700 flex justify-center flex-wrap gap-3",
  summaryClass = "mt-3 text-gray-700",

  /* SECTION CLASSES */
  sectionContainerClass = "mb-6",
  sectionTitleClass = "text-xl font-semibold uppercase tracking-wide border-b border-gray-300 pb-1 mb-3",

  /* ITEM CLASSES */
  itemContainerClass = "mb-4",
  itemTitleClass = "font-semibold text-gray-900",
  itemSubtitleClass = "text-gray-700",
  itemDateClass = "text-sm text-gray-600",
  itemSummaryClass = "italic text-gray-700 mt-2",
  highlightsListClass = "list-disc list-inside mt-2 text-gray-700",

  /* SKILLS */
  skillsTextClass = "text-sm text-gray-700"
}) {
  if (!jsonResume) return null;
  const isWord = renderTarget === "word";

  const {
    basics = {},
    work = [],
    education = [],
    skills = {},
    projects = [],
    publications = [],
  } = jsonResume;

  const grouped = groupSkills(skills);

  // Word-safe inline styles that emulate the Tailwind intent
  const word = {
    container: {
      fontFamily: "Calibri, Arial, Helvetica, sans-serif",
      fontSize: "12pt",
      color: "#111",
      padding: "24pt",
    },
    header: {
      textAlign: "center",
      marginBottom: "16pt",
      paddingBottom: "10pt",
      borderBottom: "1px solid #d1d5db",
    },
    name: { fontSize: "22pt", fontWeight: 700, margin: "0 0 4pt 0" },
    label: { fontSize: "12pt", color: "#4b5563", margin: "0 0 6pt 0" },
    contact: { fontSize: "10.5pt", color: "#374151", marginTop: "6pt" },
    summary: { marginTop: "10pt", color: "#374151" },

    section: { marginBottom: "16pt" },
    sectionTitle: {
      fontSize: "12.5pt",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "1px solid #d1d5db",
      paddingBottom: "4pt",
      marginBottom: "10pt",
    },

    item: { marginBottom: "12pt" },
    itemTitle: { fontWeight: 700, color: "#111827", margin: "0 0 2pt 0" },
    itemSubtitle: { color: "#374151", margin: "0" },
    itemDate: { fontSize: "10.5pt", color: "#6b7280" },
    itemSummary: { fontStyle: "italic", color: "#374151", marginTop: "6pt" },

    ul: {
      marginTop: "6pt",
      marginLeft: "18pt",
      paddingLeft: "0",
      listStyleType: "disc",
      color: "#374151",
    },
    li: { marginBottom: "4pt" },

    skillsP: { margin: "4pt 0", color: "#374151", fontSize: "11pt" },
  };

  return (
    <div className={containerClass} style={isWord ? word.container : undefined}>
      {/* HEADER */}
      <header className={headerContainerClass} style={isWord ? word.header : undefined}>
        <h1 className={nameClass} style={isWord ? word.name : undefined}>
          {basics.name}
        </h1>

        {basics.label && (
          <p className={labelClass} style={isWord ? word.label : undefined}>
            {basics.label}
          </p>
        )}

        <div
          className={contactClass}
          style={
            isWord
              ? {
                  ...word.contact,
                  // kill flex/gap in Word
                  display: "block",
                }
              : undefined
          }
        >
          {[basics.email, basics.phone, formatLocation(basics.location), basics.website]
            .filter(Boolean)
            .join(" · ")}
        </div>

        {basics.summary && (
          <p className={summaryClass} style={isWord ? word.summary : undefined}>
            {basics.summary}
          </p>
        )}
      </header>

      {/* EXPERIENCE */}
      {work.length > 0 && (
        <section className={sectionContainerClass} style={isWord ? word.section : undefined}>
          <h2 className={sectionTitleClass} style={isWord ? word.sectionTitle : undefined}>
            Professional Experience
          </h2>

          {work.map((job, i) => (
            <div key={i} className={itemContainerClass} style={isWord ? word.item : undefined}>
              {isWord ? (
                <table width="100%" cellPadding="0" cellSpacing="0">
                  <tbody>
                    <tr>
                      <td>
                        <h3 className={itemTitleClass} style={word.itemTitle}>{job.position}</h3>
                        <p className={itemSubtitleClass} style={word.itemSubtitle}>{job.company}</p>
                      </td>
                      <td align="right" className={itemDateClass} style={word.itemDate}>
                        {job.startDate} – {job.endDate || "Present"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={itemTitleClass}>{job.position}</h3>
                    <p className={itemSubtitleClass}>{job.company}</p>
                  </div>
                  <p className={itemDateClass}>
                    {job.startDate} – {job.endDate || "Present"}
                  </p>
                </div>
              )}

              {job.summary && (
                <p className={itemSummaryClass} style={isWord ? word.itemSummary : undefined}>
                  {job.summary}
                </p>
              )}

              {job.highlights?.length > 0 && (
                <ul className={highlightsListClass} style={isWord ? word.ul : undefined}>
                  {job.highlights.map((h, j) => (
                    <li key={j} style={isWord ? word.li : undefined}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* EDUCATION */}
      {education.length > 0 && (
        <section className={sectionContainerClass} style={isWord ? word.section : undefined}>
          <h2 className={sectionTitleClass} style={isWord ? word.sectionTitle : undefined}>
            Education
          </h2>

          {education.map((edu, i) => (
            <div key={i} className={itemContainerClass} style={isWord ? word.item : undefined}>
              <h3 className={itemTitleClass} style={isWord ? word.itemTitle : undefined}>{edu.institution}</h3>
              <p className={itemSubtitleClass} style={isWord ? word.itemSubtitle : undefined}>
                {edu.studyType} in {edu.area}
              </p>
              <p className={itemDateClass} style={isWord ? word.itemDate : undefined}>
                {edu.startDate} – {edu.endDate || "Present"}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* SKILLS */}
      {Object.keys(grouped).length > 0 && (
        <section className={sectionContainerClass} style={isWord ? word.section : undefined}>
          <h2 className={sectionTitleClass} style={isWord ? word.sectionTitle : undefined}>
            Skills
          </h2>
          <div className="space-y-1">
            {Object.entries(grouped).map(([group, list]) => (
              <p
                key={group}
                className={skillsTextClass}
                style={isWord ? word.skillsP : undefined}
              >
                <strong className="capitalize">{group.replace(/_/g, " ")}:</strong>{" "}
                {list.join(", ")}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* PROJECTS */}
      {projects.length > 0 && (
        <section className={sectionContainerClass} style={isWord ? word.section : undefined}>
          <h2 className={sectionTitleClass} style={isWord ? word.sectionTitle : undefined}>
            Projects
          </h2>

          {projects.map((proj, i) => (
            <div key={i} className={itemContainerClass} style={isWord ? word.item : undefined}>
              <h3 className={itemTitleClass} style={isWord ? word.itemTitle : undefined}>{proj.name}</h3>
              {proj.description && (
                <p className={itemSubtitleClass} style={isWord ? word.itemSubtitle : undefined}>
                  {proj.description}
                </p>
              )}
              {proj.technologies && (
                <p className="text-sm text-gray-600 mt-1" style={isWord ? { marginTop: "4pt", color: "#6b7280", fontSize: "10.5pt" } : undefined}>
                  <strong>Tech:</strong> {proj.technologies}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* PUBLICATIONS */}
      {publications.length > 0 && (
        <section className={sectionContainerClass} style={isWord ? word.section : undefined}>
          <h2 className={sectionTitleClass} style={isWord ? word.sectionTitle : undefined}>
            Publications
          </h2>
          <ul className="list-disc list-inside text-gray-700" style={isWord ? word.ul : undefined}>
            {publications.map((pub, i) => (
              <li key={i} style={isWord ? word.li : undefined}>{pub.citation}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
