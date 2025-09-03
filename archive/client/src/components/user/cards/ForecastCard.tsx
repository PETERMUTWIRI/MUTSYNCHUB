import { motion } from 'framer-motion';
import { FaChartLine } from 'react-icons/fa';

export default function ForecastCard() {
  return (
    <motion.div
      className="rounded-2xl shadow-lg bg-gradient-to-br from-teal-900/70 to-indigo-900/80 backdrop-blur-lg p-6 border border-teal-700/30"
      whileHover={{ scale: 1.03, boxShadow: '0 0 24px #14b8a6' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <FaChartLine className="text-teal-400 text-xl" />
        <span className="text-teal-300 font-semibold">Forecast</span>
      </div>
      <div className="text-white text-lg font-bold mb-2">Next Month: 2,800 API calls</div>
      <div className="text-slate-300 text-sm">AI predicts a 10% increase in usage and billing.</div>
    </motion.div>
  );
}
