import React from "react";
import { sourceCodePro } from "../styles/fonts";

const LargeInput = ({
  prompt,
  handlePromptChange,
  handleSubmit,
  handleClear,
  placeHolderText,
  buttonText,
  error,
  disableButton,
  labelText,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };
  return (
    <>
      <div className="bg-white p-10 rounded-3xl shadow-lg mb-8 overflow-y-auto h-[750px] max-h-[750px] flex flex-col space-y-4 justify-end">
        {labelText && (
          <label htmlFor="" className="mr-4">
            {labelText}
          </label>
        )}

        <textarea
          type="text"
          value={prompt}
          onChange={handlePromptChange}
          onKeyDown={handleKeyDown}
          placeholder={placeHolderText || "Enter your prompt"}
          className="bg-white p-10 rounded-3xl shadow-lg mb-8 overflow-y-auto h-[500px] max-h-[500px] flex flex-col space-y-4 justify-end word-break:break-all"
        />

        <div style={{flexDirection:"row"}} >
        {!disableButton && (
          <button
              onClick={handleSubmit}
              className={`py-6 px-6 bg-white shadow text-gray-900 font-semibold rounded-full hover:shadow-xl transition-colors duration-200 uppercase ${sourceCodePro.className}`}
            >
              {buttonText || "Upload Job Description"}
            </button>
          )}
        </div>
        

      </div>
      <p className={`text-red-500 ${error ? "block" : "hidden"}`}>{error}</p>
    </>
  );
};

export default LargeInput;