import React from 'react';
import { HiChartPie } from 'react-icons/hi';

const UsageCard: React.FC<{ usage?: number; quota?: number; loading?: boolean; error?: boolean }> = ({ usage = 0, quota = 100, loading, error }) => {
  if (loading) return <div className="card skeleton">Loading usage...</div>;
  if (error) return <div className="card error">Unable to load usage data.</div>;
  return (
    <div className="card bg-gradient-to-br from-cyan-800 to-blue-900 shadow-xl rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px]">
      <HiChartPie className="text-cyan-400 text-3xl mb-2" />
      <div className="font-bold text-lg text-white mb-1">Usage</div>
      <div className="text-gray-300 mb-2">{usage} / {quota} queries</div>
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-2 bg-cyan-400 rounded-full" style={{ width: `${Math.min(usage / quota * 100, 100)}%` }} />
      </div>
    </div>
  );
};
export default UsageCard;
