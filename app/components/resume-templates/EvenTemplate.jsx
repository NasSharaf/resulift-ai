import React from "react";
import { BaseTemplate } from "./BaseTemplate";

export function EvenTemplate({ jsonResume, renderTarget = "web" }) {
  return (
    <BaseTemplate
      jsonResume={jsonResume}
      renderTarget={renderTarget}

      /* CONTAINER */
      containerClass="bg-white text-gray-900 p-8"

      /* HEADER */
      headerContainerClass="text-center mb-6 border-b border-gray-300 pb-4"
      nameClass="text-3xl font-bold"
      labelClass="text-lg text-gray-600 mt-1"
      contactClass="mt-2 text-sm text-gray-700 flex justify-center flex-wrap gap-3"
      summaryClass="mt-3 text-gray-700"

      /* SECTIONS */
      sectionContainerClass="mb-6"
      sectionTitleClass="text-xl font-semibold uppercase tracking-wide border-b border-gray-300 pb-1 mb-3"

      /* ITEMS */
      itemContainerClass="mb-4"
      itemTitleClass="font-semibold text-gray-900"
      itemSubtitleClass="text-gray-700"
      itemDateClass="text-sm text-gray-600"
      itemSummaryClass="italic text-gray-700 mt-2"
      highlightsListClass="list-disc list-inside mt-2 text-gray-700"

      /* SKILLS */
      skillsTextClass="text-sm text-gray-700"
    />
  );
}

