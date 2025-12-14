import React from "react";
import { formatLocation } from "./utils/formatLocation";
import { groupSkills } from "./utils/groupSkills";

export function BaseTemplate({
  jsonResume,

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

  /* ITEM CLASSES (experience, education, projects) */
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

  const {
    basics = {},
    work = [],
    education = [],
    skills = {},
    projects = [],
    publications = [],
  } = jsonResume;

  const grouped = groupSkills(skills);

  return (
    <div className={containerClass}>

      {/* HEADER */}
      <header className={headerContainerClass}>
        <h1 className={nameClass}>{basics.name}</h1>
        {basics.label && <p className={labelClass}>{basics.label}</p>}

        <div className={contactClass}>
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {formatLocation(basics.location) && (
            <span>{formatLocation(basics.location)}</span>
          )}
          {basics.website && (
            <a href={basics.website} className="underline">
              {basics.website}
            </a>
          )}
        </div>

        {basics.summary && <p className={summaryClass}>{basics.summary}</p>}
      </header>

      {/* EXPERIENCE */}
      {work.length > 0 && (
        <section className={sectionContainerClass}>
          <h2 className={sectionTitleClass}>Professional Experience</h2>

          {work.map((job, i) => (
            <div key={i} className={itemContainerClass}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={itemTitleClass}>{job.position}</h3>
                  <p className={itemSubtitleClass}>{job.company}</p>
                </div>
                <p className={itemDateClass}>
                  {job.startDate} – {job.endDate || "Present"}
                </p>
              </div>

              {job.summary && (
                <p className={itemSummaryClass}>{job.summary}</p>
              )}

              {job.highlights?.length > 0 && (
                <ul className={highlightsListClass}>
                  {job.highlights.map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* EDUCATION */}
      {education.length > 0 && (
        <section className={sectionContainerClass}>
          <h2 className={sectionTitleClass}>Education</h2>

          {education.map((edu, i) => (
            <div key={i} className={itemContainerClass}>
              <h3 className={itemTitleClass}>{edu.institution}</h3>
              <p className={itemSubtitleClass}>
                {edu.studyType} in {edu.area}
              </p>
              <p className={itemDateClass}>
                {edu.startDate} – {edu.endDate || "Present"}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* SKILLS */}
      {Object.keys(grouped).length > 0 && (
        <section className={sectionContainerClass}>
          <h2 className={sectionTitleClass}>Skills</h2>
          <div className="space-y-1">
            {Object.entries(grouped).map(([group, list]) => (
              <p key={group} className={skillsTextClass}>
                <strong className="capitalize">{group.replace(/_/g, " ")}:</strong>{" "}
                {list.join(", ")}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* PROJECTS */}
      {projects.length > 0 && (
        <section className={sectionContainerClass}>
          <h2 className={sectionTitleClass}>Projects</h2>

          {projects.map((proj, i) => (
            <div key={i} className={itemContainerClass}>
              <h3 className={itemTitleClass}>{proj.name}</h3>
              {proj.description && (
                <p className={itemSubtitleClass}>{proj.description}</p>
              )}
              {proj.technologies && (
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Tech:</strong> {proj.technologies}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* PUBLICATIONS */}
      {publications.length > 0 && (
        <section className={sectionContainerClass}>
          <h2 className={sectionTitleClass}>Publications</h2>
          <ul className="list-disc list-inside text-gray-700">
            {publications.map((pub, i) => (
              <li key={i}>{pub.citation}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
