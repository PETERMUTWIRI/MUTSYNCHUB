'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/user';
import Spinner from '@/components/ui/Spinner';
import ProtectedRoute from '@/components/ProtectedRoute';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setLoading(true);
    getNotifications()
      .then((response) => {
        setNotifications(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch notifications:', error);
        setLoading(false);
      });
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id).then(() => {
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    });
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead().then(() => {
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    });
  };

  const handleDeleteAll = async () => {
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
    <ProtectedRoute requiredRole="user">
      <div className="max-w-7xl mx-auto py-10 px-6 bg-[#1E2A44] text-white font-inter">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>

        <Card className="mb-8 bg-[#2E7D7D]/10 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#2E7D7D]">Notification Preferences</CardTitle>
            <p className="text-sm text-gray-400 mt-2">Choose which notifications you want to receive and how you want to receive them.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[#2E7D7D] font-medium">Product Updates</label>
                <select className="bg-[#2E7D7D]/20 text-white rounded-lg p-2 w-full border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]">
                  <option>Email</option>
                  <option>In-App</option>
                  <option>SMS</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[#2E7D7D] font-medium">Billing Alerts</label>
                <select className="bg-[#2E7D7D]/20 text-white rounded-lg p-2 w-full border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]">
                  <option>Email</option>
                  <option>In-App</option>
                  <option>SMS</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[#2E7D7D] font-medium">Support Messages</label>
                <select className="bg-[#2E7D7D]/20 text-white rounded-lg p-2 w-full border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]">
                  <option>Email</option>
                  <option>In-App</option>
                  <option>SMS</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2E7D7D]/10 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-xl font-semibold text-[#2E7D7D]">All Notifications</CardTitle>
            <div className="flex gap-2">
              <Button className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80 transition-colors" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
              <Button className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80 transition-colors" onClick={handleDeleteAll}>
                Delete all
              </Button>
              <Button className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80 transition-colors" onClick={handleRefresh} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Spinner />
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start p-4 rounded-lg ${notification.read ? 'bg-[#2E7D7D]/5' : 'bg-[#2E7D7D]/10'}`}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-white">{notification.title}</p>
                      <p className="text-gray-300">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button variant="ghost" size="sm" className="text-[#2E7D7D] hover:text-white" onClick={() => handleMarkAsRead(notification.id)}>
                        Mark as read
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-8 bg-[#2E7D7D]/10 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#2E7D7D]">Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-2">Forward notifications to your favorite apps:</p>
            <div className="flex gap-4">
              <Button className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80 transition-colors" size="sm" onClick={() => alert('Slack integration coming soon!')}>
                Connect Slack
              </Button>
              <Button className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80 transition-colors" size="sm" onClick={() => alert('Teams integration coming soon!')}>
                Connect Teams
              </Button>
              <Button className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80 transition-colors" size="sm" onClick={() => alert('Email integration coming soon!')}>
                Connect Email
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8 bg-[#2E7D7D]/10 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#2E7D7D]">About Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">Notifications keep you updated on important events, product changes, billing alerts, and support messages. You can customize your preferences and delivery channels above. All notifications are stored here for your reference.</p>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default Notifications;