import React from "react";
import { pressStart2P, instrumentSans } from "../styles/fonts";

const MainHeader = ({ heading }) => {
  return (
    <>
      <h1 className={`${pressStart2P.className} text-center text-4xl uppercase`}>
        {heading}
      </h1>
    </>
  );
};

export default MainHeader;
