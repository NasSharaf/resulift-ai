import React from 'react';
import { formatLocation } from "./utils/formatLocation";
import { groupSkills } from "./utils/groupSkills";

export function OnePageTemplate({ jsonResume }) {
  if (!jsonResume) return null;

  const { basics = {}, work = [], education = [], skills = {}, projects = [], publications = [] } = jsonResume;
  const grouped = groupSkills(skills);

  return (
    <div className="resume-template onepage bg-gray-50 text-gray-800 p-4 text-sm">

      {/* HEADER */}
      <header className="text-center border-b-2 border-gray-300 pb-3 mb-4">
        <h1 className="text-2xl font-bold">{basics.name}</h1>
        {basics.label && (
          <p className="text-base text-gray-600">{basics.label}</p>
        )}

        <div className="contact-info mt-1 text-xs flex justify-center space-x-2">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>| {basics.phone}</span>}

          {formatLocation(basics.location) && (
            <span>| {formatLocation(basics.location)}</span>
          )}

          {basics.website && (
            <span>| <a href={basics.website} className="underline text-blue-700">
              {basics.website}
            </a></span>
          )}
        </div>

        {basics.summary && (
          <p className="mt-2 text-gray-700 text-xs">{basics.summary}</p>
        )}
      </header>

      <div className="grid grid-cols-3 gap-4">

        {/* EXPERIENCE (STRICT-LIMITED) */}
        <section className="col-span-2">
          <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">
            Professional Experience
          </h2>

          {work.slice(0, 3).map((job, idx) => (
            <div key={idx} className="mb-2">

              <div className="flex justify-between">
                <h3 className="font-bold">{job.position} – {job.company}</h3>
                <p className="text-xs text-gray-600">
                  {job.startDate} – {job.endDate || "Present"}
                </p>
              </div>

              {job.summary && (
                <p className="italic text-gray-700 text-xs mt-1">{job.summary}</p>
              )}

              {job.highlights?.length > 0 && (
                <ul className="list-disc list-inside text-xs pl-2">
                  {job.highlights.slice(0, 2).map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>

        {/* RIGHT COLUMN */}
        <section>

          {/* SKILLS */}
          <div className="mb-3">
            <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">
              Skills
            </h2>

            <div className="space-y-2">
              {Object.entries(grouped).map(([group, list]) => (
                <p key={group} className="text-xs text-gray-700">
                    <strong>{group.replace(/_/g, " ")}:</strong> {list.join(", ")}
                </p>
                ))}
            </div>
          </div>

          {/* EDUCATION (strict) */}
          <div>
            <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">
              Education
            </h2>

            {education.slice(0, 2).map((edu, idx) => (
              <div key={idx} className="text-xs mb-2">
                <p className="font-bold">{edu.institution}</p>
                <p>{edu.studyType} in {edu.area}</p>
                <p className="text-gray-600">
                  {edu.startDate} – {edu.endDate || "Present"}
                </p>
              </div>
            ))}
          </div>

        </section>
      </div>

      {/* PROJECTS (STRICT) */}
      <section className="mt-4">
        <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">Projects</h2>

        {projects.slice(0, 2).map((proj, idx) => (
          <div key={idx} className="mb-2">
            <h3 className="font-bold">{proj.name}</h3>
            <p className="text-xs text-gray-700">{proj.description}</p>
          </div>
        ))}
      </section>

      {/* PUBLICATIONS (STRICT) */}
      <section className="mt-4">
        <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">
          Publications
        </h2>

        <ul className="list-disc list-inside text-xs text-gray-700">
          {publications.slice(0, 3).map((pub, idx) => (
            <li key={idx}>{pub.citation}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
