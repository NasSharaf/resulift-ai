// components/ATSModal.jsx
import React from "react";

export default function ATSModal({
  show,
  onClose,
  original,
  rewritten,
  originalBreakdown,
  rewrittenBreakdown,
  originalRecs,
  rewrittenRecs,
  validationErrors
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">ATS Breakdown</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-lg"
          >
            ✕
          </button>
        </div>

        {/* Scores */}
        <div className="mb-6">
          <p className="font-semibold text-sm">
            Original Score: {original}
          </p>
          <p className="font-semibold text-sm">
            Tailored Score: {rewritten}
          </p>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-sm mb-2">Original Breakdown</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {Object.entries(originalBreakdown || {}).map(([key, val]) => (
                <li key={key}>{key}: {val}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">Rewritten Breakdown</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {Object.entries(rewrittenBreakdown || {}).map(([key, val]) => (
                <li key={key}>{key}: {val}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Recommendations</h3>

          <p className="text-sm font-semibold">Original Resume</p>
          <ul className="list-disc ml-5 text-sm text-gray-700 mb-3">
            {originalRecs.map((r, i) => <li key={i}>{r}</li>)}
          </ul>

          <p className="text-sm font-semibold">Tailored Resume</p>
          <ul className="list-disc ml-5 text-sm text-gray-700">
            {rewrittenRecs.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>

        {validationErrors?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Validation Issues</h3>
            <ul className="list-disc ml-5 text-sm text-red-600">
              {validationErrors.map((v, i) => <li key={i}>{v.message}</li>)}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
