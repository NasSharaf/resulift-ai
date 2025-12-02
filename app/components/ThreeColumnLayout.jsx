import React from "react";
import ColumnCard from "./ColumnCard";

const ThreeColumnLayout = ({ leftChildren, centerChildren, rightChildren }) => (
  <div className="flex flex-col gap-6 md:flex-row md:gap-6 w-full max-w-[1500px] mx-auto px-4">

    {/* Left */}
    <div className="md:w-4/12 w-full min-w-[350px]">
      <ColumnCard>{leftChildren}</ColumnCard>
    </div>

    {/* Center */}
    <div className="md:w-4/12 w-full min-w-[350px]">
      <ColumnCard>{centerChildren}</ColumnCard>
    </div>

    {/* Right */}
    <div className="md:w-4/12 w-full min-w-[350px]">
      <ColumnCard>
        {rightChildren}
      </ColumnCard>
    </div>

  </div>
);

export default ThreeColumnLayout;
