'use client';

import React from 'react';
import { HiBell } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: 'anomaly' | 'system' | 'billing';
  actionUrl?: string; // e.g., link to analytics or payment
}

const fetchNotifications = async (): Promise<Notification[]> => {
  const res = await fetch('/api/notifications');
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
};

const NotificationsCard: React.FC = () => {
  const router = useRouter();
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const latestNotification = notifications[0];

  const getAlertMessage = () => {
    if (!latestNotification) return null;
    if (latestNotification.type === 'anomaly') {
      return `Anomaly detected: ${latestNotification.message}. Take action now!`;
    }
    if (latestNotification.type === 'billing') {
      return `Billing issue: ${latestNotification.message}. Resolve to avoid disruptions.`;
    }
    return latestNotification.message;
  };

  return (
    <motion.div
      className="rounded-xl shadow-xl bg-[#1E2A44] border border-[#2E7D7D]/30 p-6 flex flex-col items-start justify-start min-h-[200px] hover:shadow-2xl transition-all duration-300"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      {isLoading ? (
        <div className="text-gray-300 font-inter text-base">Loading notifications...</div>
      ) : error ? (
        <div className="text-red-400 font-inter text-base">Unable to load notifications.</div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4">
            <HiBell className="text-[#2E7D7D] text-2xl" />
            <span className="text-white font-inter font-semibold text-lg">Notifications</span>
          </div>
          <div className="text-white font-inter font-bold text-xl mb-2">Unread: {unreadCount}</div>
          {latestNotification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 w-full"
            >
              <Alert className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100">
                <HiBell className="h-5 w-5 text-[#2E7D7D]" />
                <AlertTitle className="font-inter text-base">
                  {latestNotification.type === 'anomaly' ? 'Anomaly Alert' : 'Notification'}
                </AlertTitle>
                <AlertDescription className="font-inter text-sm">
                  {getAlertMessage()}
                  {latestNotification.actionUrl && (
                    <Button
                      variant="link"
                      className="text-[#2E7D7D] pl-2"
                      onClick={() => router.push(latestNotification.actionUrl!)}
                    >
                      Take Action →
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          <div className="text-gray-300 font-inter text-base">
            Latest: {latestNotification?.message || 'No notifications'}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default NotificationsCard;