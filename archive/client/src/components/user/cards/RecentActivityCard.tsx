import React from 'react';
import { HiClipboardList } from 'react-icons/hi';
import { motion } from 'framer-motion';

const RecentActivityCard: React.FC<{ lastLogin?: string; recent?: string[]; loading?: boolean; error?: boolean }> = ({ lastLogin, recent = [], loading, error }) => {
  if (loading) return <div className="card skeleton">Loading activity...</div>;
  if (error) return <div className="card error">Unable to load activity.</div>;
  return (
    <motion.div
      className="rounded-2xl shadow-lg bg-gradient-to-br from-purple-800/70 to-indigo-900/80 backdrop-blur-lg p-6 border border-purple-700/30 flex flex-col items-center justify-center min-h-[160px] hover:shadow-2xl transition-all"
      whileHover={{ scale: 1.03, boxShadow: '0 0 24px #a78bfa' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <HiClipboardList className="text-purple-300 text-3xl mb-2" />
      <div className="font-bold text-lg text-white mb-1">Recent Activity</div>
      <div className="text-gray-300 mb-2">Last login: {lastLogin || 'N/A'}</div>
      <ul className="text-xs text-gray-400 list-disc pl-4">
        {recent.length === 0 ? <li>No recent actions</li> : recent.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </motion.div>
  );
};
export default RecentActivityCard;
