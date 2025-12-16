import React from "react";

const ColumnCard = ({ children }) => (
  <div className="
    bg-white
    rounded-2xl
    shadow
    p-6
    w-full
    h-full
    flex flex-col
    overflow-hidden
    min-h-0
  ">
    {children}
  </div>
);

export default ColumnCard;
