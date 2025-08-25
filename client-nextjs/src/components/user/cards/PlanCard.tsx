import React from 'react';
import { HiClipboardList } from 'react-icons/hi';
import { motion } from 'framer-motion';

interface PlanCardProps {
  planName?: string;
  renewalDate?: string;
  loading?: boolean;
  error?: boolean;
  handleUpgradeClick?: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ planName, renewalDate, loading, error, handleUpgradeClick }) => {
  if (loading) return <div className="card skeleton">Loading plan...</div>;
  if (error) return <div className="card error">Unable to load plan info.</div>;
  return (
    <motion.div
      className="rounded-2xl shadow-lg bg-gradient-to-br from-indigo-800/70 to-purple-900/80 backdrop-blur-lg p-6 border border-indigo-700/30 flex flex-col items-center justify-center min-h-[160px] hover:shadow-2xl transition-all"
      whileHover={{ scale: 1.03, boxShadow: '0 0 24px #a78bfa' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="font-bold text-lg text-white mb-1">Current Plan</div>
      <div className="text-gray-300 mb-2">{planName || 'N/A'}</div>
      <div className="text-xs text-gray-400 mb-2">Renewal: {renewalDate || 'N/A'}</div>
      <button
        className="px-4 py-1 rounded bg-amber-400 text-black font-bold mt-2 hover:bg-amber-500 transition"
        onClick={handleUpgradeClick}
      >
        Upgrade
      </button>
    </motion.div>
  );
};
export default PlanCard;
