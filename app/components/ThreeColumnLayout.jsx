import React from "react";
import ColumnCard from "./ColumnCard";

const ThreeColumnLayout = ({ leftChildren, centerChildren, rightChildren }) => (
  <div className="flex flex-col md:flex-row gap-2 w-full h-full pb-4">
    <div className="md:w-5/12 w-full h-full">
      <ColumnCard>{leftChildren}</ColumnCard>
    </div>

    <div className="md:w-5/12 w-full h-full">
      <ColumnCard>{centerChildren}</ColumnCard>
    </div>

    <div className="md:w-3.5/12 w-full h-full">
      <ColumnCard>{rightChildren}</ColumnCard>
    </div>
  </div>

);

export default ThreeColumnLayout;
