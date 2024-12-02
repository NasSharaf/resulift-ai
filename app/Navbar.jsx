"use client";

import React, { useEffect, useState } from "react";
import MainHeader from "./components/MainHeader";

import Link from "next/link";
import { sourceCodePro } from "./styles/fonts";
import HamburgerMenu from "./components/HamburgerMenu";
const Navbar = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // const Navbar = () => {
  return (
    <nav className="fixed z-10 top-0 bg-gray-50 text-gray-800 w-full p-4 grid items-center">
      <MainHeader heading={"RESUMATCH.AI"} />
      {/* <a href="/" className={`text-center`}>
        RESUMATCH-AI
      </a> */}
      {/* {isClient && <HamburgerMenu />}{" "} */}
      {/* Render HamburgerMenu component on the client side */}
      {/* <div className="hidden">
        <Link href="/tailored">Resumatch.ai</Link>
      </div> */}
    </nav>
  );
};

export default Navbar;
