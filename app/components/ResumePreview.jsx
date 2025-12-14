import React from "react";
import { TEMPLATES } from "./resume-templates/index"

export default function ResumePreview({ jsonResume, theme }) {
  const Template = TEMPLATES[theme] || TEMPLATES.even;

  if (!jsonResume) {
    return <p className="text-gray-500 text-sm">No resume preview available.</p>;
  }

  return (
    <div className="w-full flex justify-center">
      <div className="bg-white w-full max-w-3xl shadow-sm border border-gray-100">
        <Template jsonResume={jsonResume} />
      </div>
    </div>
  );
}