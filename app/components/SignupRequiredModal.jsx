"use client";
import { SignUpButton } from "@clerk/nextjs";

export default function SignupRequiredModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-bold mb-2">Create an account</h2>
        <p className="text-sm mb-4">
          You’ve used your 3 free anonymous rewrites.  
          Create an account to unlock <strong>7 additional free rewrites</strong>.
        </p>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-3 py-2 border rounded"
          >
            Cancel
          </button>

          <SignUpButton>
            <button className="px-3 py-2 bg-black text-white rounded">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
