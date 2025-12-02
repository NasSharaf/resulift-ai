import React from 'react';
import { formatLocation } from "./utils/formatLocation";
import { groupSkills } from "./utils/groupSkills";

export function ElegantTemplate({ jsonResume }) {
  if (!jsonResume) return null;

  const { basics = {}, work = [], education = [], skills = {}, projects = [], publications = [] } = jsonResume;
  const grouped = groupSkills(skills);

  return (
    <div className="resume-template elegant bg-white text-gray-900 font-serif p-8 max-w-4xl mx-auto">

      {/* HEADER */}
      <header className="text-center border-b-4 border-gray-700 pb-6 mb-8">
        <h1 className="text-4xl font-light tracking-wide">{basics.name}</h1>
        {basics.label && <p className="text-xl text-gray-600 mt-2">{basics.label}</p>}

        <div className="contact-info mt-4 text-sm text-gray-700 flex justify-center space-x-4">

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
          <p className="mt-4 text-gray-700 italic">{basics.summary}</p>
        )}
      </header>

      {/* EXPERIENCE */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b-2 border-gray-300 pb-2 mb-4 text-gray-800">
          Professional Experience
        </h2>

        {work.map((job, idx) => (
          <div key={idx} className="mb-6 pb-4 border-b border-gray-200 last:border-b-0">

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{job.position}</h3>
                <p className="text-gray-700">{job.company}</p>
              </div>

              <p className="text-sm text-gray-600">
                {job.startDate} – {job.endDate || "Present"}
              </p>
            </div>

            {job.summary && (
              <p className="italic mt-2 text-gray-700">{job.summary}</p>
            )}

            {job.highlights?.length > 0 && (
              <ul className="list-disc list-outside pl-5 text-gray-700 mt-2">
                {job.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-2 gap-8">

        {/* EDUCATION */}
        <section>
          <h2 className="text-2xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">
            Education
          </h2>

          {education.map((edu, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{edu.institution}</h3>
              <p className="text-gray-700">{edu.studyType} in {edu.area}</p>
              <p className="text-sm text-gray-600">{edu.startDate} – {edu.endDate || "Present"}</p>
            </div>
          ))}
        </section>

        {/* SKILLS */}
        <section>
          <h2 className="text-2xl font-semibold border-b-2 border-gray-300 pb-2 mb-4 text-gray-800">
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
        <h2 className="text-2xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">Projects</h2>

        {projects.map((proj, idx) => (
          <div key={idx} className="mb-4">
            <h3 className="text-xl font-semibold">{proj.name}</h3>
            <p className="text-gray-700">{proj.description}</p>

            {proj.technologies && (
              <p className="text-sm mt-1"><strong>Tech:</strong> {proj.technologies}</p>
            )}
          </div>
        ))}
      </section>

      {/* PUBLICATIONS */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">Publications</h2>

        <ul className="list-disc list-inside text-gray-700">
          {publications.map((pub, idx) => <li key={idx}>{pub.citation}</li>)}
        </ul>
      </section>
    </div>
  );
}
