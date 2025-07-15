import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/user';
import Spinner from '../components/ui/Spinner';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setLoading(true);
    getNotifications()
      .then(response => {
        setNotifications(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch notifications:', error);
        setLoading(false);
      });
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id).then(() => {
      setNotifications(
        notifications.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    });
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead().then(() => {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-12">
      <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg mb-8 text-left">Notifications</h1>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">All Notifications</CardTitle>
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Spinner />
          ) : (
            <div className="space-y-4">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`flex items-start p-4 rounded-lg ${
                    notification.read ? 'bg-gray-900' : 'bg-gray-700'
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-bold text-white">{notification.title}</p>
                    <p className="text-gray-300">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                      Mark as read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
