import React from "react";
import { TEMPLATES } from "./resume-templates/index"

export default function ResumePreview({ jsonResume, theme, themedHTML }) {
  const Template = TEMPLATES[theme] || TEMPLATES.even;

  if (!jsonResume) {
    return <p className="text-gray-500 text-sm">No resume preview available.</p>;
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <Template jsonResume={jsonResume} />
    </div>
  );
}