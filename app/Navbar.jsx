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
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    fetch("/api/user-info", { credentials: "include" })
      .then(res => res.json())
      .then(setUserInfo)
      .catch(() => {});
  }, []);

  useEffect(() => setIsClient(true), []);

  const isSubscribed = userInfo?.isSubscribed;
  const isAdmin = userInfo?.isAdmin;

  return (
    <nav className="fixed top-0 left-0 z-20 w-full h-16 bg-gray-50/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LEFT SIDE — Title */}
        <a href="/" className="cursor-pointer hover:opacity-80 transition">
          <MainHeader heading={"Resulift.ai -> Get hired faster"}></MainHeader>
        </a>

        {/* RIGHT SIDE — Auth */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition" >
                Sign Up
              </button>
            </SignUpButton>

            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-full bg-white border border-black text-black text-sm font-semibold hover:bg-gray-100 transition" >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            {isAdmin && (
              <a
                href="/admin"
                className="px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition"
              >
                Admin
              </a>
            )}
            <button
              onClick={() => {
                fetch("/api/checkout", { method: "POST", credentials: "include" })
                  .then(r => r.json())
                  .then(d => window.location.href = d.url);
              }}
              className="px-4 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition"
            >
              Upgrade
            </button>
            <button
              onClick={() => {
                if (!isSubscribed) return;
                fetch("/api/portal", { method: "POST", credentials: "include" })
                  .then(r => r.json())
                  .then(d => window.location.href = d.url);
              }}
              disabled={!isSubscribed}
              className="px-4 py-2 rounded-full border border-black text-black text-sm font-semibold hover:bg-black hover:text-white transition"
              title={!isSubscribed ? "You must be subscribed to manage billing" : ""}
            >
              Manage Billing
            </button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

