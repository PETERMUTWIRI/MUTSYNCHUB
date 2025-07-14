import React from 'react';

const sentNotifications = [
  { id: 1, subject: 'New Feature Announcement', date: '2025-07-20' },
  { id: 2, subject: 'Scheduled Maintenance', date: '2025-07-15' },
];

const SentNotificationsList: React.FC = () => {
  return (
    <div className="rounded-2xl shadow-xl bg-[#1A1A2E] p-8">
      <h2 className="text-lg font-bold text-gray-200 mb-4">Sent Notifications</h2>
      <ul>
        {sentNotifications.map((notification) => (
          <li key={notification.id} className="flex justify-between items-center py-2">
            <span>{notification.subject}</span>
            <span>{notification.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SentNotificationsList;
