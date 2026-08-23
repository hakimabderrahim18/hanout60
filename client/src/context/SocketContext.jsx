import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';

const SocketContext = createContext();

// Modern notification sound generator via Web Audio API
const playNotificationSound = (type = 'order') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'order') {
      // Pleasant double chime for new orders: C5 -> E5 -> G5
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.24); // G5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.start(now);
      osc.stop(now + 0.6);
    } else {
      // Alert tone for out of stock
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(349.23, now + 0.15);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (e) {
    console.warn('Audio playback not permitted yet or not supported:', e);
  }
};

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestAlert, setLatestAlert] = useState(null);
  
  // Real-time live update ticker (triggers auto-refresh across tabs and pages)
  const [lastLiveUpdate, setLastLiveUpdate] = useState(Date.now());
  const broadcastChannelRef = useRef(null);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Setup BroadcastChannel for instantaneous cross-tab synchronization
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('hanout60_cross_tab_sync');
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        console.log('[CrossTab Sync] رسالة واردة من تبويب آخر:', event.data);
        setLastLiveUpdate(Date.now());
        if (event.data?.type === 'new_order') {
          playNotificationSound('order');
          fetchNotifications();
        }
      };

      return () => {
        bc.close();
      };
    }
  }, [isAuthenticated]);

  // Connect Socket.IO
  useEffect(() => {
    // Server URL: uses VITE_SOCKET_URL / VITE_API_URL when on Vercel or localhost port 5000 in dev
    const serverUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL ||
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : window.location.origin);

    console.log(`[Socket] الاتصال بالخادم الحي: ${serverUrl}`);
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log(`[Socket] تم الاتصال بنجاح! معرف الاتصال: ${newSocket.id}`);
      if (isAuthenticated) {
        newSocket.emit('join_admin');
      }
    });

    // 1. Listen for new order
    newSocket.on('nouvelle_commande', (data) => {
      console.log('[Socket] 🔥 طلبية جديدة مستلمة في الوقت الفعلي!', data);
      playNotificationSound('order');
      setLastLiveUpdate(Date.now());

      // Broadcast to other open browser tabs
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type: 'new_order', data });
      }

      if (data.notification) {
        setNotifications((prev) => [data.notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        setLatestAlert({
          type: 'order',
          title: '📦 طلب جديد في حانوت 60!',
          message: data.notification.message,
          time: new Date(),
        });
      }
    });

    // 2. Listen for out of stock alert
    newSocket.on('rupture_stock', (data) => {
      console.log('[Socket] ⚠️ تنبيه نفاد مخزون في الوقت الفعلي:', data);
      playNotificationSound('stock');
      setLastLiveUpdate(Date.now());

      if (data.notification) {
        setNotifications((prev) => [data.notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        setLatestAlert({
          type: 'stock',
          title: '⚠️ تنبيه نفاد المخزون!',
          message: data.notification.message,
          time: new Date(),
        });
      }
    });

    // 3. Listen for order status updates (confirmed, cancelled)
    newSocket.on('order_updated', (data) => {
      console.log('[Socket] تم تحديث حالة الطلبية:', data);
      setLastLiveUpdate(Date.now());
    });

    // 4. Listen for stock updates
    newSocket.on('stock_updated', (data) => {
      console.log('[Socket] تم تحديث كمية المخزون في المتجر:', data);
      setLastLiveUpdate(Date.now());
    });

    // 5. Listen for product changes (create, update, delete)
    newSocket.on('product_changed', (data) => {
      console.log('[Socket] تم تغيير بيانات المنتجات:', data);
      setLastLiveUpdate(Date.now());
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const res = await api.patch('/notifications/read-all');
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const dismissAlert = () => setLatestAlert(null);

  // Manual trigger for instant cross-tab sync when submitting in current tab
  const notifyCrossTab = (type, data) => {
    setLastLiveUpdate(Date.now());
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type, data });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        latestAlert,
        lastLiveUpdate,
        notifyCrossTab,
        dismissAlert,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
