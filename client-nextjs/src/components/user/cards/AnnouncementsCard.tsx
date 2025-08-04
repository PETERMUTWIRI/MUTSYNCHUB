import React from 'react';
import { HiSpeakerphone } from 'react-icons/hi';
import { motion } from 'framer-motion';

const AnnouncementsCard: React.FC<{ updates?: string[]; loading?: boolean; error?: boolean }> = ({ updates = [], loading, error }) => {
  if (loading) return <div className="card skeleton">Loading announcements...</div>;
  if (error) return <div className="card error">Unable to load announcements.</div>;
  return (
    <motion.div
      className="rounded-2xl shadow-lg bg-gradient-to-br from-indigo-700/80 to-pink-400/80 backdrop-blur-lg p-6 border border-pink-400/30 flex flex-col items-center justify-center min-h-[160px] hover:shadow-2xl transition-all"
      whileHover={{ scale: 1.03, boxShadow: '0 0 24px #f472b6' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <HiSpeakerphone className="text-pink-900 text-3xl mb-2" />
      <div className="font-bold text-lg text-white mb-1">Announcements</div>
      <ul className="text-xs text-gray-200 list-disc pl-4">
        {updates.length === 0 ? <li>No announcements</li> : updates.map((u, i) => <li key={i}>{u}</li>)}
      </ul>
    </motion.div>
  );
};
export default AnnouncementsCard;
