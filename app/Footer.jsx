"use client"

import React, { useState } from "react";
import BoilerplateModal from "./components/BoilerplateModal";

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <>
      <footer className="border-t border-gray-200 h-14 flex items-center pt-2">
        <div className="max-w-7xl mx-auto w-full px-6 flex justify-between text-sm text-gray-500">
          <button
            onClick={() => setActiveModal("about")}
            className="hover:text-black transition"
          >
            About
          </button>
          <button
            onClick={() => setActiveModal("terms")}
            className="hover:text-black transition"
          >
            Terms
          </button>
          <button
            onClick={() => setActiveModal("privacy")}
            className="hover:text-black transition"
          >
            Privacy
          </button>
        </div>
      </footer>

      <BoilerplateModal
        type={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
};

export default Footer;
