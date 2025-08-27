import React from 'react';
import { HiChartPie } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useOverviewData } from '@/lib/useOverviewData';

const UsageCard: React.FC = () => {
  const { data, loading, error } = useOverviewData();

  if (loading) return <div className="bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Loading usage...</div>;
  if (error) return <div className="bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Unable to load usage data.</div>;

  const usage = data?.forecast?.calls || 0;
  const quota = 100; // Replace with actual quota from data if available

  return (
    <motion.div
      className="rounded-xl shadow-xl bg-[#1E2A44] border border-[#2E7D7D]/30 p-6 flex flex-col items-start justify-start min-h-[200px] hover:shadow-2xl transition-all duration-300"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <HiChartPie className="text-[#2E7D7D] text-2xl" />
        <span className="text-white font-inter font-semibold text-lg">Usage</span>
      </div>
      <div className="text-white font-inter font-bold text-xl mb-2">{usage} / {quota} queries</div>
      <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-4 bg-[#2E7D7D] rounded-full" style={{ width: `${Math.min((usage / quota) * 100, 100)}%` }} />
      </div>
    </motion.div>
  );
};
export default UsageCard;