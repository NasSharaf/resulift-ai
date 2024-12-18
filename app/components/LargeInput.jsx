import React from "react";
import { sourceCodePro } from "../styles/fonts";
import { pressStart2P, instrumentSans } from "../styles/fonts";

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
  userID,
  handleUserIDChange,
  options
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
            <strong>{labelText}</strong>
          </label>
        )}

        {/* <p className={`${instrumentSans.className} mb-10`}>
          <strong>Step 2</strong> Select the resume you wish to use here: 
        </p> */}

        <select 
          value={userID} 
          onChange={handleUserIDChange}
          className={`py-6 px-6 bg-white shadow text-gray-900 font-semibold rounded-full hover:shadow-xl transition-colors duration-200 uppercase ${sourceCodePro.className}`}
        >
          {options && options.map((option, index) => (
            <option value={option} key={index}>{option}</option>
          ))}
          <option value={"( Default )"}>""</option>
          <option value={'Nasir Sharaf Resume.pdf'}>Nasir Sharaf Resume.pdf</option>
          <option value={'Maysum_Chaudhri_Resume_2024.pdf'}>Maysum_Chaudhri_Resume_2024.pdf</option>
        </select>
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