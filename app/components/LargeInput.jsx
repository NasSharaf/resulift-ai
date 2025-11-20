// components/LargeInput.jsx
import React from "react";
import { sourceCodePro } from "../styles/fonts";

const LargeInput = ({
  prompt,
  handlePromptChange,
  handleSubmit,
  placeHolderText,
  buttonText,
  error,
  disableButton,
  labelText,
}) => {
  const handleKeyDown = (e) => {
    // Allow normal Enter for newlines; use Ctrl+Enter / Cmd+Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!disableButton) {
        handleSubmit();
      }
    }
  };

  return (
    <>
      <div className="bg-white p-10 rounded-3xl shadow-lg mb-8 overflow-y-auto h-[750px] max-h-[750px] flex flex-col space-y-4 justify-start">
        {labelText && (
          <label className="mr-4">
            <strong>{labelText}</strong>
          </label>
        )}

        <textarea
          value={prompt}
          onChange={handlePromptChange}
          onKeyDown={handleKeyDown}
          placeholder={placeHolderText || "Paste the job description here…"}
          className="bg-white p-6 rounded-3xl shadow-inner mb-4 overflow-y-auto h-[500px] max-h-[500px] text-sm text-gray-900 resize-none"
        />

        <div className="flex flex-row">
          <button
            onClick={handleSubmit}
            disabled={disableButton}
            className={`py-4 px-6 bg-black text-white shadow font-semibold rounded-full hover:shadow-xl transition-colors duration-200 uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed ${sourceCodePro.className}`}
          >
            {buttonText || "Tailor My Resume"}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">
          {String(error)}
        </p>
      )}
    </>
  );
};

export default LargeInput;
