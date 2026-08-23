import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Phone,
  MapPin,
  Calendar,
  X,
  Loader2,
  RotateCcw,
} from 'lucide-react';

import { useSocket } from '../../context/SocketContext';

const statusLabels = {
  all: 'جميع الطلبات',
  en_attente: 'قيد الانتظار',
  confirmée: 'مؤكدة (تم الخصم)',
  annulée: 'ملغاة',
};

const OrdersManagement = () => {
  const { lastLiveUpdate } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const params = {};
      if (statusTab !== 'all') params.status = statusTab;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/orders', { params });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusTab, lastLiveUpdate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  // Confirm Order -> triggers stock decrement on server!
  const handleConfirmOrder = async (orderId) => {
    if (
      !window.confirm(
        'هل تريد تأكيد هذا الطلب؟ سيتم خصم مقاسات وكميات الأحذية من المخزون تلقائياً.'
      )
    )
      return;

    setActionLoading(orderId);
    try {
      const res = await api.patch(`/orders/${orderId}/confirm`);
      if (res.data.success) {
        alert('تم تأكيد الطلب وخصم الكمية من المخزون بنجاح!');
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data.data);
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'تعذر تأكيد الطلب');
    } finally {
      setActionLoading(null);
    }
  };

  // Cancel Order -> updates status to 'annulée'
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الطلب؟ لن يتم تغيير المخزون.')) return;

    setActionLoading(orderId);
    try {
      const res = await api.patch(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        alert('تم إلغاء الطلب بنجاح');
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data.data);
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'تعذر إلغاء الطلب');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout title="إدارة الطلبيات والمبيعات">
      <div className="space-y-6">
        {/* Header & Tabs */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                سجل الطلبيات ({orders.length})
              </h2>
              <p className="text-xs text-slate-500">
                ملاحظة: لا يتم خصم المخزون إلا عند النقر على "تأكيد الطلب"
              </p>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {Object.keys(statusLabels).map((key) => (
              <button
                key={key}
                onClick={() => setStatusTab(key)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition ${
                  statusTab === key
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {statusLabels[key]}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم الزبون، رقم الهاتف، الولاية أو البلدية..."
              className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </form>

          <button
            onClick={() => {
              setSearch('');
              fetchOrders();
            }}
            className="p-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl transition"
            title="إعادة ضبط"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
              <span className="text-xs text-slate-500 font-bold">جاري تحميل الطلبيات...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">رقم وتاريخ الطلب</th>
                    <th className="py-3.5 px-4 sm:px-6">معلومات الزبون</th>
                    <th className="py-3.5 px-4 sm:px-6">الولاية والبلدية</th>
                    <th className="py-3.5 px-4 sm:px-6">المنتجات المطلوبة</th>
                    <th className="py-3.5 px-4 sm:px-6">المبلغ الإجمالي</th>
                    <th className="py-3.5 px-4 sm:px-6">الحالة</th>
                    <th className="py-3.5 px-4 sm:px-6 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400 text-xs">
                        لا توجد طلبات مسجلة في هذا القسم
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const isPending = order.status === 'en_attente';
                      const isConfirmed = order.status === 'confirmée';
                      const isCancelled = order.status === 'annulée';

                      return (
                        <tr key={order._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 sm:px-6">
                            <span className="font-mono text-xs text-slate-500 font-semibold block">
                              #{order._id.slice(-6).toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('ar-DZ')}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6">
                            <span className="font-extrabold text-slate-900 block">
                              {order.customerName}
                            </span>
                            <span className="text-xs text-slate-600 font-semibold" dir="ltr">
                              {order.phoneNumber}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6">
                            <span className="font-bold text-slate-800 block">{order.wilaya}</span>
                            <span className="text-[11px] text-slate-400">{order.commune}</span>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="space-y-1">
                              {order.products?.map((p, idx) => (
                                <div key={idx} className="text-xs">
                                  <span className="font-semibold text-slate-800">{p.name}</span>
                                  <span className="text-slate-500 text-[11px] mr-1">
                                    (مقاس: <strong>{p.size}</strong>{p.color ? ` | لون: ${p.color}` : ''} × {p.quantity})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 font-black text-rose-600">
                            {order.totalAmount?.toLocaleString('ar-DZ')} دج
                          </td>

                          <td className="py-3.5 px-4 sm:px-6">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                isPending
                                  ? 'bg-amber-100 text-amber-800'
                                  : isConfirmed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {isPending && <Clock className="w-3 h-3" />}
                              {isConfirmed && <CheckCircle2 className="w-3 h-3" />}
                              {isCancelled && <XCircle className="w-3 h-3" />}
                              {statusLabels[order.status] || order.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Quick Details */}
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                                title="عرض تفاصيل الطلب"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Confirm Button */}
                              {isPending && (
                                <button
                                  onClick={() => handleConfirmOrder(order._id)}
                                  disabled={actionLoading === order._id}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-sm"
                                  title="تأكيد وخصم المخزون"
                                >
                                  {actionLoading === order._id ? 'جاري...' : 'تأكيد'}
                                </button>
                              )}

                              {/* Cancel Button */}
                              {isPending && (
                                <button
                                  onClick={() => handleCancelOrder(order._id)}
                                  disabled={actionLoading === order._id}
                                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition"
                                  title="إلغاء الطلب"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg">
                  تفاصيل الطلبية #{selectedOrder._id.slice(-6).toUpperCase()}
                </h3>
                <span className="text-xs text-slate-400">
                  {new Date(selectedOrder.createdAt).toLocaleString('ar-DZ')}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              {/* Customer Info Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">اسم الزبون:</span>
                  <span className="font-extrabold text-slate-900">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">رقم الهاتف:</span>
                  <a
                    href={`tel:${selectedOrder.phoneNumber}`}
                    className="font-extrabold text-rose-600 hover:underline"
                    dir="ltr"
                  >
                    {selectedOrder.phoneNumber}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">مكان التوصيل:</span>
                  <span className="font-bold text-slate-800">
                    {selectedOrder.wilaya} — {selectedOrder.commune}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">الحالة:</span>
                  <span className="font-bold text-slate-900">
                    {statusLabels[selectedOrder.status] || selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Shoes List */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">الأحذية في الطلبية:</h4>
                {selectedOrder.products?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                      <span className="text-xs text-slate-500">
                        المقاس: <strong>{item.size}</strong> {item.color && `| اللون: ${item.color}`} | الكمية: <strong>{item.quantity}</strong>
                      </span>
                    </div>
                    <span className="font-black text-rose-600">
                      {(item.price * item.quantity).toLocaleString('ar-DZ')} دج
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700 text-sm">المبلغ الإجمالي:</span>
                <span className="font-black text-rose-600 text-xl">
                  {selectedOrder.totalAmount?.toLocaleString('ar-DZ')} دج
                </span>
              </div>

              {/* Modal Actions */}
              {selectedOrder.status === 'en_attente' && (
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => handleConfirmOrder(selectedOrder._id)}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد الطلب وخصم المخزون</span>
                  </button>
                  <button
                    onClick={() => handleCancelOrder(selectedOrder._id)}
                    className="py-3 px-5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-2xl transition"
                  >
                    إلغاء الطلب
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default OrdersManagement;
