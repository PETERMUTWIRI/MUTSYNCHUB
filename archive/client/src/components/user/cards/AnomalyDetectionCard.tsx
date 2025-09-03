import { motion } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function AnomalyDetectionCard() {
  return (
    <motion.div
      className="rounded-2xl shadow-lg bg-gradient-to-br from-purple-900/70 to-indigo-900/80 backdrop-blur-lg p-6 border border-purple-700/30"
      whileHover={{ scale: 1.03, boxShadow: '0 0 24px #a78bfa' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <FaExclamationTriangle className="text-orange-400 text-xl" />
        <span className="text-orange-300 font-semibold">Anomaly Detection</span>
      </div>
      <div className="text-white text-lg font-bold mb-2">Usage spike detected!</div>
      <div className="text-slate-300 text-sm">AI flagged a 35% increase in API calls at 2:14pm. <span className="text-orange-400 font-bold">Investigate?</span></div>
    </motion.div>
  );
}
