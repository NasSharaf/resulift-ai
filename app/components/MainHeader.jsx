import React from "react";
import { pressStart2P } from "../styles/fonts";

const MainHeader = ({ heading, className = "" }) => {
  return (
    <h1
      className={`${pressStart2P.className} uppercase ${className}`}
    >
      {heading}
    </h1>
  );
};

export default MainHeader;