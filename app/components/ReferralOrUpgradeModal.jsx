"use client";

export default function ReferralOrUpgradeModal({ show, onClose, referralLink, onUpgrade }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-2">Out of free rewrites</h2>
        <p className="text-sm mb-4">
          You’ve used all your free rewrites.  
          You can get +1 rewrite for every friend you invite — or upgrade to unlimited.
        </p>

        <div className="mb-4">
          <label className="text-xs font-semibold">Your referral link:</label>
          <div className="flex gap-2 mt-1">
            <input 
              className="flex-1 p-1 border rounded"
              value={referralLink || ""}
              readOnly
            />
            <button
              className="px-2 py-1 bg-black text-white rounded"
              onClick={() => referralLink && navigator.clipboard.writeText(referralLink)}
            >
              Copy
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-3 py-2 border rounded"
          >
            Close
          </button>

          <button
            className="px-3 py-2 bg-black text-white rounded"
            onClick={onUpgrade}
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
