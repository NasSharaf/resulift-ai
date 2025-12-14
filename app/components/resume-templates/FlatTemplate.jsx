import React from "react";
import { BaseTemplate } from "./BaseTemplate";

export function FlatTemplate({ jsonResume }) {
  return (
    <div className="grid grid-cols-[220px_1fr]">

      {/* Sidebar (white, print-safe) */}
      <aside className="bg-white border-r border-gray-300 p-6">
        <h1 className="text-3xl font-extrabold uppercase tracking-wide mb-2">
          {jsonResume?.basics?.name}
        </h1>

        {jsonResume?.basics?.label && (
          <p className="text-base font-medium text-gray-700 mb-4">
            {jsonResume.basics.label}
          </p>
        )}

        <div className="text-sm text-gray-700 space-y-1">
          {jsonResume?.basics?.email && <p>{jsonResume.basics.email}</p>}
          {jsonResume?.basics?.phone && <p>{jsonResume.basics.phone}</p>}
          {jsonResume?.basics?.website && <p>{jsonResume.basics.website}</p>}
        </div>
      </aside>

      {/* Main content */}
      <BaseTemplate
        jsonResume={jsonResume}

        containerClass="bg-white p-10 text-gray-900"

        headerContainerClass="hidden"

        sectionContainerClass="mb-8"
        sectionTitleClass="text-xl font-black uppercase tracking-wide border-b-2 border-black pb-1 mb-4"

        itemContainerClass="mb-6 pb-4 border-b border-gray-200"
        itemTitleClass="text-base font-bold"
        itemSubtitleClass="text-sm text-gray-700"
        itemDateClass="text-xs text-gray-500"
        itemSummaryClass="italic text-gray-700 mt-2 text-sm"
        highlightsListClass="list-disc pl-5 text-base text-gray-800 mt-3 space-y-1"

        /* SKILLS — updated (normal case, normal weight) */
        skillsTextClass="text-base text-gray-800"
      />
    </div>
  );
}
