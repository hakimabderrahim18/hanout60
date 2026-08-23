import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Truck, Phone, User, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { algeriaWilayas } from '../data/algeriaCities';
import api from '../services/api';

const OrderModal = ({ product, initialSize, isOpen, onClose }) => {
  const navigate = useNavigate();

  const [size, setSize] = useState(initialSize || '');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('14'); // Default Tiaret (14)
  const [commune, setCommune] = useState('تيارت (Tiaret)');
  const [communesList, setCommunesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update sizes when product opens
  useEffect(() => {
    if (product) {
      if (initialSize) {
        setSize(initialSize);
      } else if (product.sizes && product.sizes.length > 0) {
        // Pick first available size
        const firstAvailable = product.sizes.find((s) => Number(s.quantity) > 0);
        setSize(firstAvailable ? firstAvailable.size : product.sizes[0].size);
      }
    }
  }, [product, initialSize, isOpen]);

  // Update communes list when Wilaya changes
  useEffect(() => {
    const wilayaObj = algeriaWilayas.find((w) => w.code === selectedWilayaCode);
    if (wilayaObj) {
      setCommunesList(wilayaObj.communes);
      setCommune(wilayaObj.communes[0] || '');
    }
  }, [selectedWilayaCode]);

  if (!isOpen || !product) return null;

  const currentWilaya = algeriaWilayas.find((w) => w.code === selectedWilayaCode);
  const selectedSizeObj = product.sizes?.find((s) => s.size.toString() === size.toString());
  const maxAvailableForSize = selectedSizeObj ? Number(selectedSizeObj.quantity) : 0;
  const isSelectedSizeAvailable = maxAvailableForSize > 0;

  const totalPrice = product.price * quantity;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!size) {
      setError('يرجى اختيار مقاس الحذاء');
      return;
    }

    if (!isSelectedSizeAvailable) {
      setError('عذراً، هذا المقاس غير متوفر حالياً');
      return;
    }

    if (!customerName.trim()) {
      setError('يرجى إدخال الاسم الكامل');
      return;
    }

    if (!phoneNumber.trim() || phoneNumber.trim().length < 9) {
      setError('يرجى إدخال رقم هاتف صحيح للتواصل');
      return;
    }

    if (!commune.trim()) {
      setError('يرجى تحديد البلدية');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customerName,
        phoneNumber,
        wilaya: currentWilaya ? currentWilaya.name : selectedWilayaCode,
        commune,
        products: [
          {
            product: product._id,
            name: product.name,
            size: size.toString(),
            quantity,
            price: product.price,
          },
        ],
      };

      const res = await api.post('/orders', payload);

      if (res.data.success) {
        onClose();
        navigate(`/order-success/${res.data.data._id}`, {
          state: { order: res.data.data },
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة ثانية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-rose-600 rounded-xl flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">استمارة الطلب السريع</h3>
              <p className="text-[11px] text-slate-300">الدفع عند الاستلام بعد معاينة الحذاء</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product mini summary */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3.5">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'}
            alt={product.name}
            className="w-16 h-16 rounded-2xl object-cover bg-white border border-slate-200 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 text-sm truncate">{product.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-rose-600 font-extrabold text-sm">
                {product.price.toLocaleString('ar-DZ')} دج
              </span>
              <span className="text-slate-400 text-xs">|</span>
              <span className="text-xs text-slate-600">اللون: {product.color || 'حسب الصورة'}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Size selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              اختر المقاس (Pointure) <span className="text-rose-500">*</span>:
            </label>
            <div className="flex flex-wrap gap-2">
              {product.sizes && product.sizes.length > 0 ? (
                product.sizes.map((s, idx) => {
                  const hasStock = Number(s.quantity) > 0;
                  const isSelected = size.toString() === s.size.toString();
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => hasStock && setSize(s.size.toString())}
                      disabled={!hasStock}
                      className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition ${
                        isSelected
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                          : hasStock
                          ? 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                          : 'bg-slate-100 text-slate-300 border-slate-200 line-through cursor-not-allowed'
                      }`}
                    >
                      {s.size}
                      {!hasStock && <span className="text-[9px] block">نفد</span>}
                    </button>
                  );
                })
              ) : (
                <span className="text-xs text-slate-400">مقاس موحد</span>
              )}
            </div>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">الكمية المطلوبة:</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition"
              >
                -
              </button>
              <span className="font-extrabold text-sm text-slate-900 w-5 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxAvailableForSize || 5, q + 1))}
                className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Full name input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الاسم الكامل <span className="text-rose-500">*</span>:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="مثال: محمد الأمين بن علي"
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
              />
            </div>
          </div>

          {/* Phone input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              رقم الهاتف <span className="text-rose-500">*</span> (لتأكيد الطلب عبر مكالمة):
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                dir="ltr"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="05 / 06 / 07 XX XX XX XX"
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-right focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
              />
            </div>
          </div>

          {/* Wilaya & Commune Cascading Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الولاية <span className="text-rose-500">*</span>:
              </label>
              <select
                value={selectedWilayaCode}
                onChange={(e) => setSelectedWilayaCode(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
              >
                {algeriaWilayas.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                البلدية <span className="text-rose-500">*</span>:
              </label>
              <select
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
              >
                {communesList.map((c, idx) => (
                  <option key={idx} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Total & Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">المبلغ الإجمالي</span>
              <span className="text-xl font-black text-rose-600">
                {totalPrice.toLocaleString('ar-DZ')} دج
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !isSelectedSizeAvailable}
              className={`px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-lg transition flex items-center gap-2 ${
                loading || !isSelectedSizeAvailable
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30 active:scale-95'
              }`}
            >
              {loading ? (
                <span>جاري الإرسال...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تأكيد إرسال الطلب</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
