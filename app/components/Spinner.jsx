// components/Spinner.jsx
import React from "react";

export default function Spinner() {
  return (
    <div className="flex items-center justify-center py-3">
      <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
    </div>
  );
}
