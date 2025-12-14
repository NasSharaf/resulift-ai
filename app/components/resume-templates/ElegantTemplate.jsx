import React from "react";
import { BaseTemplate } from "./BaseTemplate";

export function ElegantTemplate({ jsonResume }) {
  return (
    <BaseTemplate
      jsonResume={jsonResume}

      containerClass="bg-white text-gray-900 font-serif p-12"

      headerContainerClass="text-center border-b border-gray-300 pb-5 mb-8"
      nameClass="text-4xl font-light tracking-wide"
      labelClass="text-base text-gray-700 mt-1 italic"
      contactClass="mt-3 text-sm text-gray-600 flex justify-center flex-wrap gap-4"
      summaryClass="mt-4 text-base text-gray-700 leading-relaxed italic"

      sectionContainerClass="mb-10"
      sectionTitleClass="text-xl font-semibold tracking-wide text-gray-800 border-b border-gray-300 pb-1 mb-4"

      itemContainerClass="mb-6 pb-4 border-b border-gray-200"
      itemTitleClass="text-lg font-semibold text-gray-900"
      itemSubtitleClass="text-sm text-gray-700"
      itemDateClass="text-xs text-gray-500"
      itemSummaryClass="italic text-gray-700 mt-2 text-sm"
      highlightsListClass="list-disc list-outside pl-6 text-base text-gray-700 space-y-1 mt-2"

      skillsTextClass="text-base text-gray-800"
    />
  );
}
