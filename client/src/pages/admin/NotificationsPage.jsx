import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import {
  Bell,
  ShoppingBag,
  AlertTriangle,
  Check,
  Trash2,
  CheckCheck,
  Clock,
  Filter,
} from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } =
    useSocket();
  const [filter, setFilter] = useState('all'); // all, orders, stock, unread

  const handleDeleteNotification = async (id) => {
    try {
      const res = await api.delete(`/notifications/${id}`);
      if (res.data.success) {
        refreshNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'orders') return n.type === 'nouvelle_commande';
    if (filter === 'stock') return n.type === 'rupture_stock';
    return true;
  });

  return (
    <AdminLayout title="مركز الإشعارات والتنبيهات الحية">
      <div className="space-y-6">
        {/* Header & Controls */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">سجل الإشعارات</h2>
              {unreadCount > 0 && (
                <span className="text-xs bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full font-bold">
                  {unreadCount} غير مقروءة
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              تنبيهات فورية بالطلبات الجديدة ونفاد المخزون عبر Socket.IO
            </p>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                <span>تعيين الكل كمقروء</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
              filter === 'all'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            جميع الإشعارات ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
              filter === 'unread'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            غير المقروءة ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('orders')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
              filter === 'orders'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            الطلبات الجديدة
          </button>
          <button
            onClick={() => setFilter('stock')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
              filter === 'stock'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            تنبيهات المخزون
          </button>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              لا توجد إشعارات مطابقة في هذا القسم
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isStock = notif.type === 'rupture_stock';
              return (
                <div
                  key={notif._id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition ${
                    !notif.isRead ? 'bg-rose-50/30' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`p-3 rounded-2xl shrink-0 ${
                        isStock
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isStock ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <ShoppingBag className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isStock ? 'تنبيه مخزون' : 'طلب جديد'}
                        </span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-rose-600" />
                        )}
                      </div>

                      <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5 leading-relaxed">
                        {notif.message}
                      </p>

                      <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(notif.createdAt).toLocaleString('ar-DZ')}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
                        title="تعيين كمقروء"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notif._id)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition"
                      title="حذف الإشعار"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default NotificationsPage;
