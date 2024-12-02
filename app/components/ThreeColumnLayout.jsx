import React from "react";

const ThreeColumnLayout = ({ leftChildren, centerChildren, rightChildren }) => (
  <div className="flex flex-col justify-between  md:flex-row md:justify-between">
    {/* Resume Upload */}
    <div className="md:w-4/12 w-full h-full ml-1 mr-2">{leftChildren}</div>
    {/* Job Description upload */}
    <div className="md:w-4/12 w-full h-full ml-1 mr-1">{centerChildren}</div>
    {/* Output */}
    <div className="md:w-4/12 w-full h-full min-h-screen ml-1 mr-1">{rightChildren}</div>
  </div>
);

export default ThreeColumnLayout;
