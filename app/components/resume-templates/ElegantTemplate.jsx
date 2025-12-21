import React from "react";
import { BaseTemplate } from "./BaseTemplate";

export function ElegantTemplate({ jsonResume, renderTarget = "web" }) {
  return (
    <BaseTemplate
      jsonResume={jsonResume}
      renderTarget={renderTarget}

      /* CONTAINER */
      containerClass="bg-white text-gray-900 p-10"

      /* HEADER */
      headerContainerClass="text-center mb-8 border-b border-gray-200 pb-6"
      nameClass="text-4xl font-semibold tracking-tight"
      labelClass="text-base text-gray-500 mt-1"
      contactClass="mt-3 text-sm text-gray-600 flex justify-center flex-wrap gap-4"
      summaryClass="mt-4 text-gray-700 leading-relaxed"

      /* SECTIONS */
      sectionContainerClass="mb-8"
      sectionTitleClass="text-lg font-semibold uppercase tracking-wide border-b border-gray-200 pb-1 mb-4"

      /* ITEMS */
      itemContainerClass="mb-6"
      itemTitleClass="text-base font-semibold"
      itemSubtitleClass="text-sm text-gray-700"
      itemDateClass="text-xs text-gray-500"
      itemSummaryClass="italic text-gray-700 mt-2 text-sm"
      highlightsListClass="list-disc list-inside text-sm text-gray-700 mt-2"

      /* SKILLS */
      skillsTextClass="text-sm text-gray-700"
    />
  );
}
