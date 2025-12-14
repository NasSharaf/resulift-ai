import fs from "fs";
import path from "path";
import React from "react";
import { TEMPLATES } from "@/app/components/resume-templates";

export async function renderResumeHTML(jsonResume, theme = "even") {
  const { renderToStaticMarkup } = await import("react-dom/server");

  const css = fs.readFileSync(
    path.join(process.cwd(), "public/tailwind-pdf.css"),
    "utf8"
  );

  const Template = TEMPLATES[theme] || TEMPLATES.even;

  const markup = renderToStaticMarkup(
    <div id="pdfroot">
      <Template jsonResume={jsonResume} />
    </div>
  );

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charSet="utf-8">
      <style>${css}</style>
    </head>
    <body class="pdf">
      ${markup}
    </body>
  </html>
  `;
}
