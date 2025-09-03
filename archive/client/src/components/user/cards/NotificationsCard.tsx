import React from 'react';
import { HiBell } from 'react-icons/hi';
import { motion } from 'framer-motion';

const NotificationsCard: React.FC<{ unreadCount?: number; latest?: string; loading?: boolean; error?: boolean }> = ({ unreadCount = 0, latest, loading, error }) => {
  if (loading) return <div className="card skeleton">Loading notifications...</div>;
  if (error) return <div className="card error">Unable to load notifications.</div>;
  return (
    <motion.div
      className="rounded-2xl shadow-lg bg-gradient-to-br from-yellow-500/80 to-orange-400/80 backdrop-blur-lg p-6 border border-yellow-400/30 flex flex-col items-center justify-center min-h-[160px] hover:shadow-2xl transition-all"
      whileHover={{ scale: 1.03, boxShadow: '0 0 24px #fbbf24' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <HiBell className="text-yellow-700 text-3xl mb-2 animate-pulse" />
      <div className="font-bold text-lg text-white mb-1">Notifications</div>
      <div className="text-gray-300 mb-2">Unread: {unreadCount}</div>
      <div className="text-xs text-gray-700">Latest: {latest || 'No notifications'}</div>
    </motion.div>
  );
};
export default NotificationsCard;
