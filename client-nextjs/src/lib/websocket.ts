import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

// singleton socket
let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(`${process.env.NEXT_PUBLIC_ORIGIN}/analytics`, {
      auth: { token: document.cookie.match(/stack-session=([^;]+)/)?.[1] || '' },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // ---- incoming push ----
    socket.on('notification:new', (notif) => {
      // 1. in-app toast
      const toastType = notif.type.toLowerCase();
      if (toastType === 'success' && toast.success) {
        toast.success(notif.message, { icon: '🔔' });
      } else if (toastType === 'error' && toast.error) {
        toast.error(notif.message, { icon: '🔔' });
      } else if (toastType === 'loading' && toast.loading) {
        toast.loading(notif.message, { icon: '🔔' });
      } else {
        toast(notif.message, { icon: '🔔' });
      }

      // 2. browser notification (if user granted)
      if (Notification.permission === 'granted') {
        new Notification(notif.title, { body: notif.message, icon: '/favicon.ico' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') new Notification(notif.title, { body: notif.message, icon: '/favicon.ico' });
        });
      }
    });
  }
  return socket;
}

export const DataGateway = {
  broadcastToOrg(orgId: string, event: string, payload: any) {
    getSocket().emit('broadcast', { orgId, event, payload });
  },
};