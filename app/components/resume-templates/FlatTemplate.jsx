import React from 'react';
import { formatLocation } from "./utils/formatLocation";
import { groupSkills } from "./utils/groupSkills";

export function FlatTemplate({ jsonResume }) {
  if (!jsonResume) return null;

  const { basics = {}, work = [], education = [], skills = {}, projects = [], publications = [] } = jsonResume;
  const grouped = groupSkills(skills);

  return (
    <div className="resume-template flat bg-gray-100 text-gray-900 p-8">

      {/* HEADER */}
      <header className="text-center uppercase tracking-widest pb-4 border-b-4 border-black mb-8">
        <h1 className="text-4xl font-bold text-black">{basics.name}</h1>

        {basics.label && (
          <p className="text-xl text-gray-700 mt-2">{basics.label}</p>
        )}

        <div className="contact-info mt-4 text-sm flex justify-center space-x-4">

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
          <p className="mt-4 italic text-gray-700">{basics.summary}</p>
        )}
      </header>

      {/* EXPERIENCE */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold border-b-4 border-black pb-2 mb-4">
          Professional Experience
        </h2>

        {work.map((job, idx) => (
          <div key={idx} className="mb-6 pb-4 border-b border-gray-300 last:border-b-0">

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-black">{job.position}</h3>
                <p className="text-gray-800">{job.company}</p>
              </div>

              <p className="text-sm text-gray-600">
                {job.startDate} – {job.endDate || "Present"}
              </p>
            </div>

            {job.summary && (
              <p className="italic text-gray-700 mt-2">{job.summary}</p>
            )}

            {job.highlights?.length > 0 && (
              <ul className="list-none pl-0 text-gray-700 mt-2">
                {job.highlights.map((h, i) => (
                  <li key={i} className="mb-1 before:content-['▸'] before:mr-2 before:text-black">
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-2 gap-8">

        {/* EDUCATION */}
        <section>
          <h2 className="text-2xl font-bold border-b-4 border-black pb-2 mb-4">
            Education
          </h2>

          {education.map((edu, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="text-xl font-bold text-black">{edu.institution}</h3>
              <p className="text-gray-800">{edu.studyType} in {edu.area}</p>
              <p className="text-sm text-gray-600">
                {edu.startDate} – {edu.endDate || "Present"}
              </p>
            </div>
          ))}
        </section>

        {/* SKILLS */}
        <section>
          <h2 className="text-2xl font-bold border-b-4 border-black pb-2 mb-4">
            Skills
          </h2>

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
      </div>

      {/* PROJECTS */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold border-b-4 border-black pb-2 mb-4">Projects</h2>

        {projects.map((proj, idx) => (
          <div key={idx} className="mb-4">
            <h3 className="text-xl font-bold text-black">{proj.name}</h3>
            <p className="text-gray-800">{proj.description}</p>

            {proj.technologies && (
              <p className="text-sm text-gray-700 mt-1">
                <strong>Tech:</strong> {proj.technologies}
              </p>
            )}
          </div>
        ))}
      </section>

      {/* PUBLICATIONS */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold border-b-4 border-black pb-2 mb-4">
          Publications
        </h2>

        <ul className="list-disc list-inside text-gray-800">
          {publications.map((pub, idx) => <li key={idx}>{pub.citation}</li>)}
        </ul>
      </section>
    </div>
  );
}
