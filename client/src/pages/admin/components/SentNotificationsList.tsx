import React from 'react';

type Notification = { id: number; subject: string; date: string };
const sentNotifications: Notification[] = [
  // Example: { id: 1, subject: 'New Feature Announcement', date: '2025-07-20' },
];

const SentNotificationsList: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-cyan-200 mb-6">Sent Notifications</h2>
      {sentNotifications.length > 0 ? (
        <ul>
          {sentNotifications.map((notification) => (
            <li key={notification.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
              <span>{notification.subject}</span>
              <span className="text-sm text-gray-400">{notification.date}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-2 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>No notifications have been sent yet.</span>
        </div>
      )}
    </div>
  );
};

export default SentNotificationsList;
