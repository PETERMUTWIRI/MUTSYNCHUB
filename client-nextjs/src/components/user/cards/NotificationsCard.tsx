'use client';

import React, { useEffect, useState } from 'react';
import { HiBell } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@//components/ui/button';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  status: 'READ' | 'UNREAD';
  type: 'anomaly' | 'system' | 'billing';
  actionUrl?: string;
}

export default function NotificationsCard() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /* initial fetch + live socket */
  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then(setNotifications);

    const socket = io(`${process.env.NEXT_PUBLIC_ORIGIN}/analytics`);
    socket.on('notification:new', (n: Notification) => setNotifications((prev) => [n, ...prev]));
    socket.on('notification:read', (id: string) =>
      setNotifications((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'READ', readAt: new Date() } : p)))
    );
    socket.on('notification:readAll', () =>
      setNotifications((prev) => prev.map((p) => ({ ...p, status: 'READ', readAt: new Date() })))
    );
    return () => socket.disconnect();
  }, []);

  const unreadCount = notifications.filter((n) => n.status === 'UNREAD').length;
  const latest = notifications[0];

  const getAlertMessage = () => {
    if (!latest) return null;
    if (latest.type === 'anomaly') return `Anomaly detected: ${latest.message}. Take action now!`;
    if (latest.type === 'billing') return `Billing issue: ${latest.message}. Resolve to avoid disruptions.`;
    return latest.message;
  };

  return (
    <motion.div
      className="rounded-xl shadow-xl bg-[#1E2A44] border border-[#2E7D7D]/30 p-6 flex flex-col items-start justify-start min-h-[200px] hover:shadow-2xl transition-all duration-300"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <HiBell className="text-[#2E7D7D] text-2xl" />
        <span className="text-white font-inter font-semibold text-lg">Notifications</span>
      </div>

      <div className="text-white font-inter font-bold text-xl mb-2">Unread: {unreadCount}</div>

      {latest && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 w-full">
          <Alert className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100">
            <HiBell className="h-5 w-5 text-[#2E7D7D]" />
            <AlertTitle className="font-inter text-base">
              {latest.type === 'anomaly' ? 'Anomaly Alert' : 'Notification'}
            </AlertTitle>
            <AlertDescription className="font-inter text-sm">
              {getAlertMessage()}
              {latest.actionUrl && (
                <Button variant="link" className="text-[#2E7D7D] pl-2" onClick={() => router.push(latest.actionUrl)}>
                  Take Action →
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="text-gray-300 font-inter text-base">Latest: {latest?.message || 'No notifications'}</div>
    </motion.div>
  );
}