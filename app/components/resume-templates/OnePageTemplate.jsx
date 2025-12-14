import React from "react";
import { BaseTemplate } from "./BaseTemplate";
import { formatLocation } from "./utils/formatLocation";
import { groupSkills } from "./utils/groupSkills";

export function OnePageTemplate({ jsonResume }) {
  if (!jsonResume) return null;

  // --- Truncate for strict one-page behavior ---
  const limited = {
    ...jsonResume,
    work: jsonResume.work?.slice(0, 3) || [],
    education: jsonResume.education?.slice(0, 2) || [],
    projects: jsonResume.projects?.slice(0, 2) || [],
    publications: jsonResume.publications?.slice(0, 3) || [],
  };

  return (
    <div className="bg-gray-50 text-gray-800 p-4 text-sm">
      <BaseTemplate
        jsonResume={limited}

        /* CONTAINER */
        containerClass="bg-gray-50 text-gray-800 p-4 text-sm"

        /* HEADER */
        headerContainerClass="text-center border-b border-gray-300 pb-3 mb-4"
        nameClass="text-2xl font-bold"
        labelClass="text-base text-gray-600 mt-1"
        contactClass="mt-1 text-xs flex justify-center flex-wrap gap-2"
        summaryClass="mt-2 text-gray-700 text-xs"

        /* SECTION HEADERS */
        sectionContainerClass="mb-4"
        sectionTitleClass="text-lg font-semibold uppercase tracking-wide border-b border-gray-300 pb-1 mb-2"

        /* ITEM STYLES */
        itemContainerClass="mb-2"
        itemTitleClass="font-bold text-gray-900 text-sm"
        itemSubtitleClass="text-gray-700 text-xs"
        itemDateClass="text-xs text-gray-600"
        itemSummaryClass="italic text-gray-700 text-xs mt-1"
        highlightsListClass="list-disc list-inside text-xs text-gray-700 pl-3"

        /* SKILLS */
        skillsTextClass="text-xs text-gray-700"
      />

      {/* Optional footer note */}
      <p className="mt-2 text-[10px] text-gray-500 italic text-center">
        Condensed one-page layout: only the most recent entries are shown.
      </p>
    </div>
  );
}
