import React from "react";

const ColumnCard = ({ children }) => (
  <div className="
    bg-white 
    rounded-2xl 
    shadow 
    p-6 
    w-full
    h-[calc(100vh-180px)]    /* consistent height for all three */
    overflow-y-auto
  ">
    {children}
  </div>
);

export default ColumnCard;
