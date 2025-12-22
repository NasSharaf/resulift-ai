import React from "react";

const content = {
  about: {
    title: "About Resulift",
    body: `
Resulift helps job seekers tailor resumes to specific roles by aligning them with job descriptions and applicant tracking system (ATS) criteria.

The goal is simple: reduce guesswork and help candidates understand how well their resume matches a role before applying.

Resulift is built for speed, clarity, and privacy.
    `,
  },
  terms: {
    title: "Terms of Service",
    body: `
Resulift provides automated resume analysis and rewriting tools for informational purposes only. We do not guarantee interviews, job offers, or employment outcomes.

You are responsible for reviewing all generated content before use. The service is provided “as is” without warranties of any kind.

We reserve the right to modify or discontinue the service at any time.
    `,
  },
  privacy: {
    title: "Privacy Policy",
    body: `
Resulift processes resumes and job descriptions solely to provide resume optimization services.

Uploaded content is not sold or shared with third parties. We collect only the minimum information required to operate the service.

Payment information is handled securely by third-party providers.
    `,
  },
};

const BoilerplateModal = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          {content[type].title}
        </h2>
        <p className="text-sm text-gray-700 whitespace-pre-line">
          {content[type].body}
        </p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-black text-sm font-semibold hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoilerplateModal;
