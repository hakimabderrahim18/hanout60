import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import {
  ShoppingBag,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  ArrowUpRight,
  Loader2,
  Phone,
  MapPin,
} from 'lucide-react';

import { useSocket } from '../../context/SocketContext';

const DashboardOverview = () => {
  const { lastLiveUpdate } = useSocket();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/orders/stats/overview');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch stats whenever a real-time event occurs or on mount
  useEffect(() => {
    fetchStats();
  }, [lastLiveUpdate]);

  const handleConfirmOrder = async (orderId) => {
    if (!window.confirm('هل أنت متأكد من تأكيد هذا الطلب وخصم الكمية من مخزون الحذاء؟')) return;
    setActionLoading(orderId);
    try {
      const res = await api.patch(`/orders/${orderId}/confirm`);
      if (res.data.success) {
        alert('تم تأكيد الطلب وتحديث المخزون بنجاح!');
        fetchStats();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'تعذر تأكيد الطلب');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="لوحة التحكم — نظرة عامة">
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
          <p className="text-slate-500 font-bold">جاري تحميل إحصائيات المتجر...</p>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: 'طلبات قيد الانتظار',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 text-amber-700 border-amber-200',
      subtitle: 'بحاجة للتأكيد والشحن',
    },
    {
      title: 'الطلبات المؤكدة',
      value: stats?.confirmedOrders || 0,
      icon: CheckCircle2,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      subtitle: 'تم خصمها من المخزون',
    },
    {
      title: 'أحذية نافدة من المخزون',
      value: stats?.outOfStockProducts || 0,
      icon: AlertTriangle,
      color: 'bg-rose-500',
      lightColor: 'bg-rose-50 text-rose-700 border-rose-200',
      subtitle: 'بحاجة لتجديد الكمية',
    },
    {
      title: 'إجمالي المبيعات المؤكدة',
      value: `${(stats?.totalRevenue || 0).toLocaleString('ar-DZ')} دج`,
      icon: DollarSign,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 text-blue-700 border-blue-200',
      subtitle: 'مداخيل الطلبيات المؤكدة',
    },
  ];

  return (
    <AdminLayout title="لوحة التحكم — نظرة عامة والتقارير">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div>
            <span className="text-xs text-rose-400 font-bold block mb-1">
              مرحباً بك في لوحة إدارة حانوت 60
            </span>
            <h1 className="text-xl sm:text-2xl font-black">
              المركز التجاري سوق الفلاح، تيارت
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              تابع الطلبيات الجديدة، عدل المخزون حسب المقاسات، واستقبل الإشعارات الحية.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/admin/products"
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة حذاء جديد</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">{c.title}</span>
                  <div className={`p-2.5 rounded-2xl ${c.lightColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
                    {c.value}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block font-medium">
                    {c.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                أحدث الطلبيات الواردة
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                طلبات الزبائن الأخيرة عبر الموقع
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>عرض جميع الطلبات</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">الزبون</th>
                  <th className="py-3.5 px-4 sm:px-6">الهاتف والولاية</th>
                  <th className="py-3.5 px-4 sm:px-6">الأحذية والمقاس</th>
                  <th className="py-3.5 px-4 sm:px-6">المبلغ</th>
                  <th className="py-3.5 px-4 sm:px-6">الحالة</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                      لا توجد أي طلبيات مسجلة حتى الآن
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => {
                    const isPending = order.status === 'en_attente';
                    const isConfirmed = order.status === 'confirmée';
                    return (
                      <tr key={order._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-4 sm:px-6 font-bold text-slate-900">
                          {order.customerName}
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          <div className="text-xs space-y-0.5">
                            <span className="font-semibold text-slate-700 block" dir="ltr">
                              {order.phoneNumber}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {order.wilaya} - {order.commune}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          <div className="space-y-1">
                            {order.products?.map((p, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="font-semibold text-slate-800">{p.name}</span>
                                <span className="text-slate-400 text-[11px] mr-1.5">
                                  (مقاس: <strong>{p.size}</strong> × {p.quantity})
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 sm:px-6 font-extrabold text-rose-600">
                          {order.totalAmount?.toLocaleString('ar-DZ')} دج
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isPending
                                ? 'bg-amber-100 text-amber-800'
                                : isConfirmed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isPending
                              ? 'قيد الانتظار'
                              : isConfirmed
                              ? 'مؤكدة (تم الخصم)'
                              : 'ملغاة'}
                          </span>
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-center">
                          {isPending ? (
                            <button
                              onClick={() => handleConfirmOrder(order._id)}
                              disabled={actionLoading === order._id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                            >
                              {actionLoading === order._id ? 'جاري التأكيد...' : 'تأكيد وخصم'}
                            </button>
                          ) : (
                            <Link
                              to="/admin/orders"
                              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                            >
                              عرض التفاصيل
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardOverview;
