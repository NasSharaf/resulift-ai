// components/LargeInput.jsx
import React, { useState, useEffect } from "react";
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
  isIncognito, 
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

  const handleClear = () => {
    handlePromptChange({ target: { value: "" } });
  };

  const [freeRemaining, setFreeRemaining] = useState(null);
  
  // Free uses remaining
  useEffect(() => {
    fetch("/api/free-usage")
      .then(r => r.json())
      .then(data => {
        setFreeRemaining(data.remaining);
      })
      .catch(() => {});
  }, []);

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
              disabled={isIncognito}
              className={`w-full h-full p-4 text-sm text-gray-900 resize-none outline-none border rounded-lg ${
                isIncognito ? "bg-gray-100 opacity-50 cursor-not-allowed" : "border-gray-200"
              }`}
            />
          </div>

          <div className="pt-4 flex flex-col gap-3">
            {/* Tailor Button */}
            <button
              onClick={handleSubmit}
              disabled={disableButton || isIncognito}
              className="px-4 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {buttonText || "Tailor My Resume"}
            </button>

            {/* Clear Button */}
            <button
              onClick={handleClear}
              disabled={isIncognito}
              className="px-4 py-2 rounded-full bg-white border border-black text-black text-sm font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
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
