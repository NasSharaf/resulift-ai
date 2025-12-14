import React from "react";
import { BaseTemplate } from "./BaseTemplate";

export function EvenTemplate({ jsonResume }) {
  return (
    <BaseTemplate
      jsonResume={jsonResume}

      containerClass="bg-white text-gray-900 font-sans p-10"

      headerContainerClass="text-center border-b border-gray-200 pb-3 mb-8"
      nameClass="text-3xl font-bold tracking-tight"
      labelClass="text-base text-gray-600 mt-1"
      contactClass="mt-2 text-sm text-gray-500 flex justify-center flex-wrap gap-3"
      summaryClass="mt-4 text-base text-gray-700 leading-relaxed"

      sectionContainerClass="mb-8"
      sectionTitleClass="text-xl font-semibold uppercase tracking-wide text-gray-700 border-b border-gray-200 pb-1 mb-3"

      itemContainerClass="mb-5 pb-4 border-b border-gray-200"
      itemTitleClass="text-base font-semibold"
      itemSubtitleClass="text-sm text-gray-600"
      itemDateClass="text-xs text-gray-500"
      itemSummaryClass="italic text-gray-600 mt-2 text-sm"
      highlightsListClass="list-disc list-inside mt-2 text-base text-gray-700 space-y-1"

      skillsTextClass="text-base text-gray-700"
    />
  );
}

