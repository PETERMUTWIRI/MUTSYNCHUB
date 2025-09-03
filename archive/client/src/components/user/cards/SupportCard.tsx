import React from 'react';
import { HiQuestionMarkCircle } from 'react-icons/hi';
import { motion } from 'framer-motion';

const SupportCard: React.FC<{ openTickets?: number; loading?: boolean; error?: boolean }> = ({ openTickets = 0, loading, error }) => {
  if (loading) return <div className="card skeleton">Loading support...</div>;
  if (error) return <div className="card error">Unable to load support info.</div>;
  return (
    <motion.div
      className="rounded-2xl shadow-lg bg-gradient-to-br from-pink-500/80 to-red-400/80 backdrop-blur-lg p-6 border border-pink-400/30 flex flex-col items-center justify-center min-h-[160px] hover:shadow-2xl transition-all"
      whileHover={{ scale: 1.03, boxShadow: '0 0 24px #f472b6' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <HiQuestionMarkCircle className="text-pink-900 text-3xl mb-2" />
      <div className="font-bold text-lg text-white mb-1">Support</div>
      <div className="text-gray-300 mb-2">Open Tickets: {openTickets}</div>
      <button className="px-4 py-1 rounded bg-white text-pink-900 font-bold mt-2 hover:bg-pink-100 transition">Contact Support</button>
    </motion.div>
  );
};
export default SupportCard;
