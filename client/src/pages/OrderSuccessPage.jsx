import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { CheckCircle2, ShoppingBag, MapPin, Phone, User, ArrowRight, Clock, ShieldCheck } from 'lucide-react';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    // If order was passed via location.state, use it
    if (location.state?.order) {
      setOrder(location.state.order);
      setLoading(false);
    }
  }, [id, location.state]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-center p-6 sm:p-10 space-y-6">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              تم تسجيل الطلب بنجاح في النظام
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
              شكراً لثقتكم في متجر حانوت 60!
            </h1>
            <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto leading-relaxed">
              تم إرسال طلبك بنجاح وهو الآن <strong className="text-amber-600">قيد المراجعة والتحضير</strong>. سيتصل بك فريقنا في أقرب وقت لتأكيد تفاصيل الشحن.
            </p>
          </div>

          {/* Delivery Note Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Clock className="w-4 h-4 text-rose-600 shrink-0" />
              <span>مواعيد الاتصال والتأكيد:</span>
            </div>
            <p className="text-slate-600 pr-6">
              يتم الاتصال بكم خلال أوقات العمل من 08:30 صباحاً إلى 20:00 مساءً. يرجى إبقاء هاتفك مفتوحاً.
            </p>
          </div>

          {/* Order Details Card */}
          {order && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-right space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-200 pb-2">
                تفاصيل الطلبية:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">الاسم الكامل:</span>
                  <span className="font-bold text-slate-800">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">رقم الهاتف:</span>
                  <span className="font-bold text-slate-800" dir="ltr">{order.phoneNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">الولاية:</span>
                  <span className="font-bold text-slate-800">{order.wilaya}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">البلدية:</span>
                  <span className="font-bold text-slate-800">{order.commune}</span>
                </div>
              </div>

              {/* Items */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                {order.products?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                      <span className="text-slate-500 text-[11px]">
                        المقاس: <strong>{item.size}</strong> | الكمية: <strong>{item.quantity}</strong>
                      </span>
                    </div>
                    <span className="font-black text-rose-600 text-sm">
                      {(item.price * item.quantity).toLocaleString('ar-DZ')} دج
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700 text-sm">المجموع الكلي:</span>
                <span className="font-black text-rose-600 text-xl">
                  {order.totalAmount?.toLocaleString('ar-DZ')} دج
                </span>
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="pt-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-600/30 transition active:scale-95"
            >
              <ArrowRight className="w-4 h-4" />
              <span>متابعة التسوق وتصفح المزيد</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
