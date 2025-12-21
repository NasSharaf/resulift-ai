import ReactDOMServer from 'react-dom/server';
import { TEMPLATES } from '../components/resume-templates';

export async function generateThemedHTML(jsonResume, theme = 'even', {target = "web"} = {}) {
  const Template = TEMPLATES[theme] || TEMPLATES.even;
  
  // Render template to string
  const html = ReactDOMServer.renderToString(
    <Template jsonResume={jsonResume} renderTarget={target}/>
  );

  // Render word
  if (target === "word") {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 12pt;
              color: #111;
            }
            h1 { font-size: 20pt; margin-bottom: 8px; }
            h2 { font-size: 14pt; margin-bottom: 6px; }
            p  { margin: 4px 0; }
            ul { margin-left: 18px; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  }
  
  // Wrap with basic HTML structure and Tailwind
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-white">
        ${html}
      </body>
    </html>
  `;
}

export async function downloadPDF(jsonResume, theme = "even") {
  const res = await fetch("/api/download-pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ jsonResume, theme }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("PDF download error:", res.status, text);
    throw new Error("Failed to generate PDF");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "resume.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadWord(jsonResume, theme = "even") {
  const res = await fetch("/api/download-word", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonResume, theme }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Word download error:", res.status, text);
    throw new Error("Failed to generate Word doc");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume.docx";
  a.click();
  URL.revokeObjectURL(url);
}
