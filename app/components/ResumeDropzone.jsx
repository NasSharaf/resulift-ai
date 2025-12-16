// components/ResumeDropzone.jsx
import React from "react";

export default function ResumeDropzone({ getRootProps, getInputProps, file, isIncognito  }) {
  return (
    <div
      {...(!isIncognito ? getRootProps() : {})}
      className={`
        flex flex-col items-center justify-center
        border-2 border-dashed rounded-xl h-full min-h-[200px] px-4 text-center transition
        ${isIncognito 
          ? "cursor-not-allowed bg-gray-100 border-gray-200 opacity-50" 
          : "cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 border-gray-300"
        }
      `}
    >
      <input {...getInputProps()} disabled={isIncognito} />

      {/* Inline SVG upload icon */}
      <svg
        className="w-10 h-10 text-gray-400 mb-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4m0 0l-4 4m4-4v12"
        />
      </svg>

      {isIncognito ? (
        <p className="text-sm text-gray-500">
          File upload disabled in Private Browsing Mode
        </p>
      ) : file ? (
        <p className="text-sm text-gray-700">
          Selected: <strong>{file.name}</strong>
        </p>
      ) : (
        <p className="text-sm text-gray-500">
          <strong>Drag & drop</strong> your resume (PDF or Word) here
          <br /> or click to browse
        </p>
      )}
    </div>
  );
}
