import React from 'react';
import { HiClipboardList } from 'react-icons/hi';

const PlanCard: React.FC<{ planName?: string; renewalDate?: string; loading?: boolean; error?: boolean }> = ({ planName, renewalDate, loading, error }) => {
  if (loading) return <div className="card skeleton">Loading plan...</div>;
  if (error) return <div className="card error">Unable to load plan info.</div>;
  return (
    <div className="card bg-gradient-to-br from-indigo-800 to-purple-900 shadow-xl rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px]">
      <div className="font-bold text-lg text-white mb-1">Current Plan</div>
      <div className="text-gray-300 mb-2">{planName || 'N/A'}</div>
      <div className="text-xs text-gray-400 mb-2">Renewal: {renewalDate || 'N/A'}</div>
      <button className="px-4 py-1 rounded bg-amber-400 text-black font-bold mt-2 hover:bg-amber-500 transition">Upgrade</button>
    </div>
  );
};
export default PlanCard;
