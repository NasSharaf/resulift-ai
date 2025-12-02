// components/ResumeTemplates/index.js
import { BaseTemplate } from './BaseTemplate';
import { EvenTemplate } from './EvenTemplate';
import { PaperTemplate } from './PaperTemplate';
import { FlatTemplate } from './FlatTemplate';
import { OnePageTemplate } from './OnePageTemplate';
import { ElegantTemplate } from './ElegantTemplate';

export const TEMPLATES = {
  even: EvenTemplate,
  paper: PaperTemplate,
  onepage: OnePageTemplate,
  elegant: ElegantTemplate,
  flat: FlatTemplate
};

// Modify your download utilities
export async function generateThemedHTML(jsonResume, theme = 'even') {
  const Template = TEMPLATES[theme] || TEMPLATES.even;
  
  // Render template to string
  const html = ReactDOMServer.renderToString(<Template jsonResume={jsonResume} />);
  
  // Wrap with basic HTML structure
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1, h2 { color: #333; }
          .job, .education { margin-bottom: 15px; }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;
}
