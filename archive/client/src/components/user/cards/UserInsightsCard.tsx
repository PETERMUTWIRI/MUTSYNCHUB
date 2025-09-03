import { motion } from 'framer-motion';
import { FaUserFriends } from 'react-icons/fa';

export default function UserInsightsCard() {
  return (
    <motion.div
      className="rounded-2xl shadow-lg bg-gradient-to-br from-indigo-900/70 to-purple-900/80 backdrop-blur-lg p-6 border border-indigo-700/30"
      whileHover={{ scale: 1.03, boxShadow: '0 0 24px #a78bfa' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <FaUserFriends className="text-purple-400 text-xl" />
        <span className="text-purple-300 font-semibold">User Insights</span>
      </div>
      <div className="text-white text-lg font-bold mb-2">Top User: Alice</div>
      <div className="text-slate-300 text-sm">Churn risk: <span className="text-orange-400 font-bold">Low</span> | Segment: <span className="text-teal-400 font-bold">Enterprise</span></div>
    </motion.div>
  );
}
