import ReactDOMServer from 'react-dom/server';
import { TEMPLATES } from '../components/resume-templates';

export async function generateThemedHTML(jsonResume, theme = 'even') {
  const Template = TEMPLATES[theme] || TEMPLATES.even;
  
  // Render template to string
  const html = ReactDOMServer.renderToString(
    <Template jsonResume={jsonResume} />
  );
  
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
