// components/ATSScoreBar.jsx
import React from "react";

export default function ATSScoreBar({ original, rewritten, onOpen }) {
  if (original == null || rewritten == null) return null;

  const diff = rewritten - original;
  const maxScore = 100;

  return (
    <div className="mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-semibold">
          ATS Score: {original} → {rewritten}{" "}
          <span className={`ml-1 ${diff >= 0 ? "text-green-600" : "text-red-600"}`}>
            ({diff >= 0 ? "+" : ""}{diff})
          </span>
        </p>
        <button
          onClick={onOpen}
          className="text-xs text-blue-600 hover:underline"
        >
          View full breakdown →
        </button>
      </div>

      {/* Score Bar */}
      <div className="w-full h-2 bg-gray-300 rounded">
        <div
          className="h-2 bg-green-600 rounded"
          style={{ width: `${(rewritten / maxScore) * 100}%` }}
        />
      </div>
    </div>
  );
}
