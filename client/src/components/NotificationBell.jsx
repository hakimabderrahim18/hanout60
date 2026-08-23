import React, { useState, useRef, useEffect } from 'react';
import { Bell, ShoppingBag, AlertTriangle, Check, ExternalLink } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        title="الإشعارات"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-rose-600 animate-bell' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
            {unreadCount > 99 ? '+99' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-400" />
              <span className="font-bold text-sm">الإشعارات الحية</span>
              {unreadCount > 0 && (
                <span className="text-[11px] bg-rose-600 px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} جديدة
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 hover:underline transition"
              >
                <Check className="w-3 h-3" />
                تعيين الكل كمقروء
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                لا توجد إشعارات حالياً
              </div>
            ) : (
              notifications.slice(0, 8).map((n) => {
                const isStock = n.type === 'rupture_stock';
                return (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && markAsRead(n._id)}
                    className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition cursor-pointer ${
                      !n.isRead ? 'bg-rose-50/40 font-semibold' : 'text-slate-600'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isStock
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isStock ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-800 leading-snug break-words">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString('ar-DZ', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Link */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              to="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center justify-center gap-1"
            >
              <span>عرض كل الإشعارات</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
