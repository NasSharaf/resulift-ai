import React from "react";
import { BaseTemplate } from "./BaseTemplate";

export function PaperTemplate({ jsonResume }) {
  return (
    <BaseTemplate
      jsonResume={jsonResume}

      /* CONTAINER */
      containerClass="bg-white text-gray-900 font-serif p-10"

      /* HEADER */
      headerContainerClass="text-center border-b-2 border-gray-800 pb-5 mb-8"
      nameClass="text-4xl font-bold"
      labelClass="text-base text-gray-700 italic mt-1"
      contactClass="mt-2 text-sm text-gray-700 flex justify-center flex-wrap gap-4"
      summaryClass="mt-4 italic text-base text-gray-800 leading-relaxed"

      /* SECTIONS */
      sectionContainerClass="mb-8"
      sectionTitleClass="text-xl font-bold uppercase tracking-wide border-b-2 border-gray-700 pb-1 mb-4"

      /* ITEMS */
      itemContainerClass="mb-6 pb-4 border-b border-gray-200"
      itemTitleClass="text-base font-semibold"
      itemSubtitleClass="text-sm text-gray-700"
      itemDateClass="text-xs text-gray-600"
      itemSummaryClass="italic text-gray-700 mt-2 text-sm"
      highlightsListClass="list-disc list-inside text-base text-gray-800 mt-2 space-y-1"

      /* SKILLS */
      skillsTextClass="text-base text-gray-800"
    />
  );
}

