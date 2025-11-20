"use client";

import React from "react";

const SectionTitle = ({ children }) => (
  <h2 className="font-semibold text-xs tracking-wide uppercase mb-1 mt-4 text-gray-700">
    {children}
  </h2>
);

const ResumePreview = ({ jsonResume }) => {
  if (!jsonResume) {
    return (
      <div className="text-gray-500 text-sm">
        Your tailored resume will appear here.
      </div>
    );
  }

  const {
    basics = {},
    work = [],
    education = [],
    skills = [],
    projects = [],
    certificates: rawCertificates = [],
    certifications: altCertificates = [],
    awards = [],
    publications = [],
    volunteer = [],
    languages = [],
    interests = [],
    references = [],
  } = jsonResume;

  // Normalize certificates (schema uses "certificates", your JSON used "certifications")
  const certificates =
    rawCertificates && rawCertificates.length
      ? rawCertificates
      : altCertificates || [];

  // ---------- HELPERS TO BUILD FALLBACK HTML (NO JSON) ----------
  const buildFallbackHTML = () => {
    const esc = (str) =>
      String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const workHTML = work
      .map((job) => {
        const start = job.startDate || "";
        const end = job.endDate || "Present";
        return `
        <div style="margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;font-weight:bold;">
            <span>${esc(job.position)} · ${esc(job.name)}</span>
            <span style="font-size:11px;color:#666;">${esc(
              `${start} – ${end}`
            )}</span>
          </div>
          ${
            job.summary
              ? `<div style="font-size:12px;color:#444;margin-top:2px;">${esc(
                  job.summary
                )}</div>`
              : ""
          }
          ${
            job.highlights && job.highlights.length
              ? `<ul style="margin:4px 0 0 18px;font-size:12px;color:#333;">${job.highlights
                  .map((h) => `<li>${esc(h)}</li>`)
                  .join("")}</ul>`
              : ""
          }
        </div>
      `;
      })
      .join("");

    const eduHTML = education
      .map((edu) => {
        const degree = edu.degree || edu.studyType || "";
        const gpa = edu.score || edu.gpa || "";
        const end = edu.endDate || "Present";
        return `
        <div style="margin-bottom:8px;">
          <div style="font-weight:bold;">
            ${esc(degree)} in ${esc(edu.area)} — ${esc(edu.institution)}
          </div>
          <div style="font-size:11px;color:#666;">
            ${esc(end)}
          </div>
          ${
            gpa
              ? `<div style="font-size:12px;color:#444;">GPA: ${esc(
                  gpa
                )}</div>`
              : ""
          }
        </div>
      `;
      })
      .join("");

    const skillsHTML =
      skills && skills.length
        ? `<div>${skills
            .map((s) => {
              if (typeof s === "string") {
                return `<span style="font-size:12px;color:#444;display:inline-block;margin-right:8px;">${esc(
                  s
                )}</span>`;
              }
              const name = s.name || "";
              const kws = Array.isArray(s.keywords)
                ? s.keywords.join(", ")
                : "";
              const text = [name, kws].filter(Boolean).join(" — ");
              return `<span style="font-size:12px;color:#444;display:inline-block;margin-right:8px;">${esc(
                text
              )}</span>`;
            })
            .join("")}</div>`
        : "";

    const projectsHTML = projects
      .map((p) => {
        return `
        <div style="margin-bottom:8px;">
          <div style="font-weight:bold;">${esc(p.name)}</div>
          ${
            p.description
              ? `<div style="font-size:12px;color:#444;">${esc(
                  p.description
                )}</div>`
              : ""
          }
        </div>
      `;
      })
      .join("");

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Resume</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              font-size: 12px;
              color: #111;
              margin: 24px;
            }
            h1 {
              font-size: 22px;
              margin: 0;
            }
            .subtitle {
              color: #555;
              margin-top: 2px;
            }
            .contact {
              color: #666;
              font-size: 11px;
              margin-top: 2px;
            }
            h2 {
              font-size: 11px;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: #555;
              margin: 16px 0 4px;
            }
            .section {
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          <header>
            <h1>${esc(basics.name)}</h1>
            ${
              basics.label
                ? `<div class="subtitle">${esc(basics.label)}</div>`
                : ""
            }
            <div class="contact">
              ${esc(basics.email || "")}
              ${basics.phone ? " · " + esc(basics.phone) : ""}
              ${
                basics.location && basics.location.city
                  ? " · " + esc(basics.location.city)
                  : ""
              }
            </div>
          </header>

          ${
            basics.summary
              ? `
            <section class="section">
              <h2>Summary</h2>
              <div>${esc(basics.summary)}</div>
            </section>
          `
              : ""
          }

          ${
            workHTML
              ? `
            <section class="section">
              <h2>Experience</h2>
              ${workHTML}
            </section>
          `
              : ""
          }

          ${
            eduHTML
              ? `
            <section class="section">
              <h2>Education</h2>
              ${eduHTML}
            </section>
          `
              : ""
          }

          ${
            skillsHTML
              ? `
            <section class="section">
              <h2>Skills</h2>
              ${skillsHTML}
            </section>
          `
              : ""
          }

          ${
            projectsHTML
              ? `
            <section class="section">
              <h2>Projects</h2>
              ${projectsHTML}
            </section>
          `
              : ""
          }
        </body>
      </html>
    `;
  };

  // ---------- THEME HTML VIA /api/render-theme (SERVER) ----------
  const generateThemedHTML = async () => {
    try {
      const res = await fetch("/api/render-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonResume }),
      });

      if (!res.ok) {
        throw new Error("Theme render failed");
      }

      const data = await res.json();
      if (!data.html) {
        throw new Error("No HTML returned from theme");
      }

      return data.html;
    } catch (e) {
      console.error("Theme rendering failed, using fallback HTML:", e);
      return buildFallbackHTML();
    }
  };

  const handleDownloadPDF = async () => {
    if (typeof window === "undefined") return;

    const html = await generateThemedHTML();
    const { default: html2pdf } = await import("html2pdf.js");

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    await html2pdf()
      .from(container)
      .set({
        margin: 10,
        filename: "resume.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save();

    document.body.removeChild(container);
  };

  const handleDownloadWord = async () => {
    if (typeof window === "undefined") return;

    const html = await generateThemedHTML();
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.doc";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ---------- INLINE REACT PREVIEW ----------
  return (
    <div className="bg-white text-black p-8 rounded-3xl shadow-lg text-sm space-y-4 overflow-auto max-h-[90vh]">
      {/* HEADER + ACTIONS */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">{basics.name}</h1>
          {basics.label && <p className="text-gray-700">{basics.label}</p>}
          {(basics.email || basics.phone || basics.location?.city) && (
            <p className="text-gray-600 text-xs">
              {basics.email ? basics.email : ""}
              {basics.phone ? ` · ${basics.phone}` : ""}
              {basics.location?.city ? ` · ${basics.location.city}` : ""}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleDownloadPDF}
            className="px-3 py-1 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800"
          >
            Download PDF
          </button>
          <button
            onClick={handleDownloadWord}
            className="px-3 py-1 rounded-full bg-white border border-gray-400 text-xs font-semibold hover:bg-gray-100"
          >
            Download Word
          </button>
        </div>
      </div>

      {/* Summary */}
      {basics.summary && (
        <section>
          <SectionTitle>Summary</SectionTitle>
          <p className="text-gray-800">{basics.summary}</p>
        </section>
      )}

      {/* Experience */}
      {work.length > 0 && (
        <section>
          <SectionTitle>Experience</SectionTitle>
          <div className="space-y-4">
            {work.map((job, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <div className="font-semibold">
                    {job.position} · {job.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {job.startDate} – {job.endDate || "Present"}
                  </div>
                </div>
                {job.summary && (
                  <p className="text-xs text-gray-700">{job.summary}</p>
                )}
                {job.highlights && job.highlights.length > 0 && (
                  <ul className="list-disc pl-5 text-xs text-gray-800">
                    {job.highlights.map((h, hi) => (
                      <li key={hi}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section>
          <SectionTitle>Education</SectionTitle>
          <div className="space-y-3">
            {education.map((edu, i) => {
              const degree = edu.degree || edu.studyType || "";
              const gpa = edu.score || edu.gpa || "";
              return (
                <div key={i}>
                  <div className="font-semibold">
                    {degree} in {edu.area} — {edu.institution}
                  </div>
                  <div className="text-xs text-gray-500">
                    {edu.endDate || "Present"}
                  </div>
                  {gpa && (
                    <p className="text-xs text-gray-700">GPA: {gpa}</p>
                  )}
                  {edu.courses && edu.courses.length > 0 && (
                    <ul className="list-disc pl-5 text-xs mt-1 text-gray-800">
                      {edu.courses.map((c, ci) => (
                        <li key={ci}>{c}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <SectionTitle>Skills</SectionTitle>
          {skills.map((skill, i) => {
            if (typeof skill === "string") {
              return (
                <div key={i} className="mb-2">
                  <p className="text-xs text-gray-700">{skill}</p>
                </div>
              );
            }
            const kws = Array.isArray(skill.keywords)
              ? skill.keywords.join(", ")
              : "";
            return (
              <div key={i} className="mb-2">
                <div className="font-semibold text-xs">{skill.name}</div>
                {kws && (
                  <p className="text-xs text-gray-700">
                    {kws}
                  </p>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section>
          <SectionTitle>Projects</SectionTitle>
          <div className="space-y-3">
            {projects.map((proj, i) => (
              <div key={i}>
                <div className="font-semibold">{proj.name}</div>
                {proj.description && (
                  <p className="text-xs text-gray-700">{proj.description}</p>
                )}
                {proj.highlights && proj.highlights.length > 0 && (
                  <ul className="list-disc pl-5 text-xs text-gray-800 mt-1">
                    {proj.highlights.map((h, hi) => (
                      <li key={hi}>{h}</li>
                    ))}
                  </ul>
                )}
                {proj.url && (
                  <a
                    className="text-xs text-blue-600"
                    href={proj.url}
                    target="_blank"
                  >
                    {proj.url}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <section>
          <SectionTitle>Certificates</SectionTitle>
          {certificates.map((cert, i) => {
            const title = cert.name || cert.title;
            const issuer = cert.issuer || cert.publisher || "";
            const date = cert.date || cert.releaseDate || "";
            return (
              <div key={i} className="mb-2">
                <div className="font-semibold">{title}</div>
                {(issuer || date) && (
                  <p className="text-xs text-gray-700">
                    {[issuer, date].filter(Boolean).join(" — ")}
                  </p>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <section>
          <SectionTitle>Awards</SectionTitle>
          {awards.map((award, i) => (
            <div key={i} className="mb-2">
              <div className="font-semibold">
                {award.title || award.name}
              </div>
              {(award.awarder || award.date) && (
                <p className="text-xs text-gray-700">
                  {[award.awarder, award.date].filter(Boolean).join(" — ")}
                </p>
              )}
              {award.summary && (
                <p className="text-xs text-gray-800">{award.summary}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Publications */}
      {publications.length > 0 && (
        <section>
          <SectionTitle>Publications</SectionTitle>
          {publications.map((pub, i) => {
            const title = pub.title || pub.name;
            const publisher =
              pub.publisher || pub.journal || pub.conference || "";
            const date = pub.date || pub.releaseDate || "";
            return (
              <div key={i} className="mb-2">
                <div className="font-semibold">{title}</div>
                {(publisher || date) && (
                  <p className="text-xs text-gray-700">
                    {[publisher, date].filter(Boolean).join(" — ")}
                  </p>
                )}
                {pub.summary && (
                  <p className="text-xs text-gray-800">{pub.summary}</p>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Volunteer */}
      {volunteer.length > 0 && (
        <section>
          <SectionTitle>Volunteer</SectionTitle>
          {volunteer.map((v, i) => (
            <div key={i} className="mb-2">
              <div className="font-semibold">{v.organization}</div>
              <p className="text-xs text-gray-700">
                {v.position} — {v.startDate} to {v.endDate || "Present"}
              </p>
              {v.summary && (
                <p className="text-xs text-gray-800">{v.summary}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section>
          <SectionTitle>Languages</SectionTitle>
          {languages.map((lang, i) => (
            <p key={i} className="text-xs text-gray-800">
              <span className="font-semibold">{lang.language}</span>:{" "}
              {lang.fluency}
            </p>
          ))}
        </section>
      )}

      {/* Interests */}
      {interests.length > 0 && (
        <section>
          <SectionTitle>Interests</SectionTitle>
          {interests.map((int, i) => (
            <p key={i} className="text-xs text-gray-800">
              <span className="font-semibold">{int.name}</span>:{" "}
              {int.keywords?.join(", ")}
            </p>
          ))}
        </section>
      )}

      {/* References */}
      {references.length > 0 && (
        <section>
          <SectionTitle>References</SectionTitle>
          {references.map((ref, i) => (
            <div key={i} className="text-xs text-gray-800">
              <div className="font-semibold">{ref.name}</div>
              <p>{ref.reference}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ResumePreview;
