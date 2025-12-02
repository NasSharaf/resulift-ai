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
      <div className="flex flex-col space-y-4 h-full">
        {labelText && (
          <label className="mr-4">
            <strong>{labelText}</strong>
          </label>
        )}

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            <textarea
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={handleKeyDown}
              placeholder={placeHolderText || "Paste the job description here…"}
              className="w-full h-full p-4 text-sm text-gray-900 resize-none outline-none border border-gray-200 rounded-lg"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={disableButton}
              className="px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800 disabled:opacity-50"
            >
              {buttonText || "Tailor My Resume"}
            </button>
          </div>
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
