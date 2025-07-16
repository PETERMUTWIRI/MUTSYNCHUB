import React from 'react';
import { HiBell } from 'react-icons/hi';

const NotificationsCard: React.FC<{ unreadCount?: number; latest?: string; loading?: boolean; error?: boolean }> = ({ unreadCount = 0, latest, loading, error }) => {
  if (loading) return <div className="card skeleton">Loading notifications...</div>;
  if (error) return <div className="card error">Unable to load notifications.</div>;
  return (
    <div className="card bg-gradient-to-br from-yellow-500 to-orange-400 shadow-xl rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px]">
      <HiBell className="text-yellow-700 text-3xl mb-2" />
      <div className="font-bold text-lg text-white mb-1">Notifications</div>
      <div className="text-gray-300 mb-2">Unread: {unreadCount}</div>
      <div className="text-xs text-gray-700">Latest: {latest || 'No notifications'}</div>
    </div>
  );
};
export default NotificationsCard;
