import React from 'react';
import { HiClipboardList } from 'react-icons/hi';

const RecentActivityCard: React.FC<{ lastLogin?: string; recent?: string[]; loading?: boolean; error?: boolean }> = ({ lastLogin, recent = [], loading, error }) => {
  if (loading) return <div className="card skeleton">Loading activity...</div>;
  if (error) return <div className="card error">Unable to load activity.</div>;
  return (
    <div className="card bg-gradient-to-br from-purple-800 to-indigo-900 shadow-xl rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px]">
      <HiClipboardList className="text-purple-300 text-3xl mb-2" />
      <div className="font-bold text-lg text-white mb-1">Recent Activity</div>
      <div className="text-gray-300 mb-2">Last login: {lastLogin || 'N/A'}</div>
      <ul className="text-xs text-gray-400 list-disc pl-4">
        {recent.length === 0 ? <li>No recent actions</li> : recent.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
};
export default RecentActivityCard;
