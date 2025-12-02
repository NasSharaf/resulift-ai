import React from 'react';
import { formatLocation } from "./utils/formatLocation";
import { groupSkills } from "./utils/groupSkills";

export function EvenTemplate({ jsonResume }) {
  if (!jsonResume) return null;

  const { basics = {}, work = [], education = [], skills = {}, projects = [], publications = [] } = jsonResume;
  const grouped = groupSkills(skills);

  return (
    <div className="resume-template even bg-white text-gray-800 font-sans p-8">

      {/* HEADER */}
      <header className="text-center border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-3xl font-bold">{basics.name}</h1>
        {basics.label && <p className="text-xl text-gray-600">{basics.label}</p>}

        <div className="contact-info mt-2 text-sm space-y-1">
          {basics.email && <p>{basics.email}</p>}
          {basics.phone && <p>{basics.phone}</p>}

          {formatLocation(basics.location) && (
            <p>{formatLocation(basics.location)}</p>
          )}

          {basics.website && (
            <p>
              <a href={basics.website} className="text-blue-600 underline">
                {basics.website}
              </a>
            </p>
          )}
        </div>

        {basics.summary && (
          <p className="mt-4 text-gray-700">{basics.summary}</p>
        )}
      </header>

      {/* EXPERIENCE */}
      <section>
        <h2 className="text-2xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">
          Professional Experience
        </h2>

        {work.map((job, idx) => (
          <div key={idx} className="mb-4 pb-2 border-b border-gray-200">

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{job.position}</h3>
                <p className="text-gray-600">{job.company}</p>
              </div>

              <p className="text-sm text-gray-500">
                {job.startDate} – {job.endDate || "Present"}
              </p>
            </div>

            {job.summary && (
              <p className="italic text-gray-700 mt-2">{job.summary}</p>
            )}

            {job.highlights?.length > 0 && (
              <ul className="list-disc list-inside text-gray-700 mt-2 pl-4">
                {job.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* SKILLS */}
      <section className="mt-6">
        <h2 className="text-2xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">
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

      {/* EDUCATION */}
      <section className="mt-6">
        <h2 className="text-2xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">
          Education
        </h2>

        {education.map((edu, idx) => (
          <div key={idx} className="mb-4">
            <h3 className="text-xl font-bold">{edu.institution}</h3>
            <p className="text-gray-700">{edu.studyType} in {edu.area}</p>
            <p className="text-sm text-gray-600">
              {edu.startDate} – {edu.endDate || "Present"}
            </p>
          </div>
        ))}
      </section>

      {/* PROJECTS */}
      <section className="mt-6">
        <h2 className="text-2xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">
          Projects
        </h2>

        {projects.map((proj, idx) => (
          <div key={idx} className="mb-4">
            <h3 className="text-xl font-bold">{proj.name}</h3>
            <p className="text-gray-700">{proj.description}</p>

            {proj.technologies && (
              <p className="text-sm text-gray-600 mt-1">
                <strong>Tech:</strong> {proj.technologies}
              </p>
            )}
          </div>
        ))}
      </section>

      {/* PUBLICATIONS */}
      <section className="mt-6">
        <h2 className="text-2xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">
          Publications
        </h2>

        <ul className="list-disc list-inside text-gray-700">
          {publications.map((pub, idx) => <li key={idx}>{pub.citation}</li>)}
        </ul>
      </section>
    </div>
  );
}
