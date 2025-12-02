import React from 'react';
import { formatLocation } from "./utils/formatLocation";
import { groupSkills } from "./utils/groupSkills";

export function BaseTemplate({
  jsonResume,
  templateClasses = '',
  containerClasses = 'p-8 max-w-4xl mx-auto',
  headerClasses = 'text-center mb-6',
  sectionHeaderClasses = 'text-2xl font-semibold border-b-2 border-gray-300 pb-2 mb-4'
}) {
  if (!jsonResume) return null;

  const { basics = {}, work = [], education = [], skills = {}, projects = [], publications = [] } = jsonResume;
  const grouped = groupSkills(skills);

  return (
    <div className={`resume-container ${containerClasses} ${templateClasses}`}>

      {/* BASICS */}
      <header className={headerClasses}>
        <h1 className="text-3xl font-bold">{basics.name}</h1>
        {basics.label && <p className="text-xl text-gray-600">{basics.label}</p>}

        <div className="contact-info mt-2 text-sm space-y-1">
          {basics.email && <p>{basics.email}</p>}
          {basics.phone && <p>{basics.phone}</p>}
          {formatLocation(basics.location) && <p>{formatLocation(basics.location)}</p>}
          {basics.website && (
            <p><a className="text-blue-600 underline" href={basics.website}>{basics.website}</a></p>
          )}
        </div>

        {basics.summary && <p className="mt-4 text-gray-700">{basics.summary}</p>}
      </header>

      {/* EXPERIENCE */}
      {work?.length > 0 && (
        <section className="mb-6">
          <h2 className={sectionHeaderClasses}>Professional Experience</h2>

          {work.map((job, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between">
                <h3 className="text-xl font-bold">{job.position} — {job.company}</h3>
                <p className="text-gray-600">{job.startDate} – {job.endDate || 'Present'}</p>
              </div>

              {job.summary && <p className="italic text-gray-700 mt-2">{job.summary}</p>}

              {job.highlights?.length > 0 && (
                <ul className="list-disc list-inside mt-2 text-gray-700">
                  {job.highlights.map((h, j) => <li key={j}>{h}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* EDUCATION */}
      {education?.length > 0 && (
        <section className="mb-6">
          <h2 className={sectionHeaderClasses}>Education</h2>

          {education.map((edu, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between">
                <h3 className="text-xl font-bold">{edu.institution}</h3>
                <p className="text-gray-600">{edu.startDate} – {edu.endDate || "Present"}</p>
              </div>
              <p className="text-gray-700">{edu.studyType} in {edu.area}</p>
            </div>
          ))}
        </section>
      )}

      {/* SKILLS */}
      {Object.keys(grouped)?.length > 0 && (
        <section className="mb-6">
          <h2 className={sectionHeaderClasses}>Skills</h2>

          <div className="space-y-4">
            {Object.entries(grouped).map(([group, list]) => (
                <p key={group} className="text-gray-700 text-sm">
                    <span className="font-semibold capitalize">
                    {group.replace(/_/g, " ")}:
                    </span>{" "}
                    {list.join(", ")}
                </p>
                ))}
          </div>
        </section>
      )}

      {/* PROJECTS */}
      {projects?.length > 0 && (
        <section className="mb-6">
          <h2 className={sectionHeaderClasses}>Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} className="mb-4">
              <h3 className="text-xl font-semibold">{proj.name}</h3>
              {proj.description && <p className="text-gray-700">{proj.description}</p>}
              {proj.technologies && (
                <p className="text-sm text-gray-600 mt-1"><strong>Tech:</strong> {proj.technologies}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* PUBLICATIONS */}
      {publications?.length > 0 && (
        <section>
          <h2 className={sectionHeaderClasses}>Publications</h2>
          <ul className="list-disc list-inside text-gray-700">
            {publications.map((pub, i) => <li key={i}>{pub.citation}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
