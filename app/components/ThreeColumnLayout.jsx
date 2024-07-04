import React from "react";

const ThreeColumnLayout = ({ leftChildren, centerChildren, rightChildren }) => (
  <div className="flex flex-col justify-between  md:flex-row md:justify-between">
    {/* Resume Upload */}
    <div className="md:w-4/12 w-full">{leftChildren}</div>
    {/* Job Description upload */}
    <div className="md:w-4/12 w-full">{centerChildren}</div>
    {/* Output */}
    <div className="md:w-4/12 w-full min-h-screen">{rightChildren}</div>
  </div>
);

export default ThreeColumnLayout;
