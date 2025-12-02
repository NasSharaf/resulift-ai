"use client";

import React, { useEffect, useState } from "react";
import MainHeader from "./components/MainHeader";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const Navbar = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  return (
    <nav className="fixed top-0 left-0 z-20 w-full bg-gray-50/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LEFT SIDE — Title */}
        <MainHeader heading={"Resumatch.ai -> Resume + Job Description = Success!"}></MainHeader>

        {/* RIGHT SIDE — Auth */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="bg-[#6c47ff] text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-[#5a39d6] transition">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

