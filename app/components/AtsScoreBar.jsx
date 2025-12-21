// components/ATSScoreBar.jsx
import React from "react";

export default function ATSScoreBar({ original, rewritten, onOpen }) {
  if (original == null || rewritten == null) return null;

  const diff = rewritten - original;
  const maxScore = 100;

  return (
    <div className="mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex justify-between items-start mb-2">
        
        {/* LEFT: ATS label + tooltip + score */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <p className="text-sm font-semibold">ATS Score</p>

            {/* Tooltip */}
            <div className="relative group">
              <span className="cursor-pointer text-gray-400 text-sm select-none">ⓘ</span>
              <div className="absolute left-0 top-6 z-10 hidden group-hover:block w-64 p-2 text-xs text-white bg-black rounded shadow-lg">
                Applicant Tracking Systems (ATS) are software tools employers use to
                automatically scan and rank resumes before a human reviews them.
                This score estimates how well your resume matches automated screening
                criteria.
              </div>
            </div>
          </div>

          {/* Score text */}
          <p className="text-xs text-gray-700">
            {original}/100 →{" "}
            <span
              className={
                rewritten >= 70
                  ? "text-green-700 font-semibold"
                  : rewritten >= 50
                  ? "text-yellow-700 font-semibold"
                  : "text-red-700 font-semibold"
              }
            >
              {rewritten}/100
            </span>{" "}
            <span className={`ml-1 ${diff >= 0 ? "text-green-600" : "text-red-600"}`}>
              ({diff >= 0 ? "+" : ""}{diff})
            </span>
          </p>
        </div>

        {/* RIGHT: breakdown link */}
        <button
          onClick={onOpen}
          className="text-xs text-blue-600 hover:underline whitespace-nowrap"
        >
          View full breakdown →
        </button>
      </div>

      {/* Score Bar */}
      <div className="w-full h-2 bg-gray-300 rounded overflow-hidden">
        <div
          className={`h-2 rounded transition-none ${
            rewritten >= 70
              ? "bg-green-600"
              : rewritten >= 50
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${Math.min(100, Math.max(0, rewritten))}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 mt-1">Score range: 0–100</p>
    </div>

  );
}
