"use client";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/user';
import Spinner from '@/components/ui/Spinner';

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

  const handleDeleteAll = async () => {
    // Replace with backend API call for bulk delete if available
    try {
      if (window.confirm('Are you sure you want to delete all notifications? This cannot be undone.')) {
        // await deleteAllNotifications(); // Uncomment when backend is ready
        setNotifications([]);
      }
    } catch (err) {
      alert('Failed to delete all notifications.');
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  return (
    <div className="max-w-5xl mx-auto py-12">
      <h1 className="text-4xl font-extrabold text-blue-400 tracking-tight drop-shadow-lg mb-8 text-left">Notifications</h1>

      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-300">Notification Preferences</CardTitle>
          <p className="text-sm text-gray-300 mt-2">Choose which notifications you want to receive and how you want to receive them.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <label className="text-blue-400 font-semibold">Product Updates</label>
              <select className="bg-gray-700 border-gray-600 text-white rounded-lg p-2 w-full">
                <option>Email</option>
                <option>In-App</option>
                <option>SMS</option>
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-blue-400 font-semibold">Billing Alerts</label>
              <select className="bg-gray-700 border-gray-600 text-white rounded-lg p-2 w-full">
                <option>Email</option>
                <option>In-App</option>
                <option>SMS</option>
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-blue-400 font-semibold">Support Messages</label>
              <select className="bg-gray-700 border-gray-600 text-white rounded-lg p-2 w-full">
                <option>Email</option>
                <option>In-App</option>
                <option>SMS</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-blue-300">All Notifications</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
            <Button variant="outline" onClick={handleDeleteAll}>
              Delete all
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
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
                    <p className="font-bold text-blue-400">{notification.title}</p>
                    <p className="text-gray-200">{notification.message}</p>
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

      <Card className="mt-8 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-300">Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-2">Forward notifications to your favorite apps:</p>
          <div className="flex gap-4">
            <Button variant="outline" size="sm" onClick={() => alert('Slack integration coming soon!')}>Connect Slack</Button>
            <Button variant="outline" size="sm" onClick={() => alert('Teams integration coming soon!')}>Connect Teams</Button>
            <Button variant="outline" size="sm" onClick={() => alert('Email integration coming soon!')}>Connect Email</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-300">About Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">Notifications keep you updated on important events, product changes, billing alerts, and support messages. You can customize your preferences and delivery channels above. All notifications are stored here for your reference.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
