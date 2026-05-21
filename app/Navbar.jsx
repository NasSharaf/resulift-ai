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
  const [userInfo, setUserInfo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/user-info", { credentials: "include" })
      .then(res => res.json())
      .then(setUserInfo)
      .catch(() => {});
  }, []);

  const isSubscribed = userInfo?.isSubscribed;
  const isAdmin = userInfo?.isAdmin;

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 z-20 w-full h-16 bg-gray-50/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LEFT SIDE — Title */}
        <a href="/" className="cursor-pointer hover:opacity-80 transition">
          {/* Mobile: short title */}
          <span className="block md:hidden">
            <MainHeader heading="Resulift.ai" className="text-[10px]" />
          </span>
          {/* Desktop: full title */}
          <span className="hidden md:block">
            <MainHeader heading={"Resulift.ai -> Get hired faster"} />
          </span>
        </a>

        {/* RIGHT SIDE — Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition">
                Sign Up
              </button>
            </SignUpButton>

            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-full bg-white border border-black text-black text-sm font-semibold hover:bg-gray-100 transition">
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
            <a
              href="/applications"
              className="px-4 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition"
            >
              My Applications
            </a>
            <button
              onClick={() => {
                fetch("/api/checkout", { method: "POST", credentials: "include" })
                  .then(r => r.json())
                  .then(d => window.location.href = d.url);
              }}
              className="px-4 py-2 rounded-full bg-gray-600 text-white text-sm font-semibold hover:bg-gray-800 transition"
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

        {/* RIGHT SIDE — Mobile: UserButton always visible + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            className="p-1 text-gray-700 hover:text-gray-900 transition"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 right-0 w-56 bg-white border-b border-gray-200 shadow-lg flex flex-col p-4 gap-3 z-50">
          <SignedOut>
            <SignUpButton mode="modal">
              <button
                onClick={closeMenu}
                className="w-full px-4 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition"
              >
                Sign Up
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button
                onClick={closeMenu}
                className="w-full px-4 py-2 rounded-full bg-white border border-black text-black text-sm font-semibold hover:bg-gray-100 transition"
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            {isAdmin && (
              <a
                href="/admin"
                onClick={closeMenu}
                className="px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition text-center"
              >
                Admin
              </a>
            )}
            <a
              href="/applications"
              onClick={closeMenu}
              className="px-4 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition text-center"
            >
              My Applications
            </a>
            <button
              onClick={() => {
                closeMenu();
                fetch("/api/checkout", { method: "POST", credentials: "include" })
                  .then(r => r.json())
                  .then(d => window.location.href = d.url);
              }}
              className="px-4 py-2 rounded-full bg-gray-600 text-white text-sm font-semibold hover:bg-gray-800 transition"
            >
              Upgrade
            </button>
            <button
              onClick={() => {
                if (!isSubscribed) return;
                closeMenu();
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
          </SignedIn>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
