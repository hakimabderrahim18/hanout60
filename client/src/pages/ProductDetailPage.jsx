import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { algeriaWilayas } from '../data/algeriaCities';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Tag,
} from 'lucide-react';

const categoryLabels = {
  homme: 'رجالي',
  femme: 'نسائي',
  sport: 'رياضي',
  enfant: 'أطفال',
  casual: 'كاجوال',
  sandales: 'صنادل وسليبرز',
  bottines: 'بوت وبوتين',
  medical: 'أحذية طبية',
  autre: 'أخرى',
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('14'); // Tiaret
  const [commune, setCommune] = useState('تيارت (Tiaret)');
  const [communesList, setCommunesList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          const prod = res.data.data;
          setProduct(prod);
          setSelectedImage(prod.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800');

          // Pre-select first available size
          if (prod.sizes && prod.sizes.length > 0) {
            const firstAvailable = prod.sizes.find((s) => Number(s.quantity) > 0);
            setSelectedSize(firstAvailable ? firstAvailable.size : prod.sizes[0].size);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Update communes when wilaya changes
  useEffect(() => {
    const wilayaObj = algeriaWilayas.find((w) => w.code === selectedWilayaCode);
    if (wilayaObj) {
      setCommunesList(wilayaObj.communes);
      setCommune(wilayaObj.communes[0] || '');
    }
  }, [selectedWilayaCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
          <p className="font-bold text-slate-600">جاري تحميل تفاصيل الحذاء...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-24 text-center">
          <AlertCircle className="w-16 h-16 text-rose-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">المنتج غير موجود</h2>
          <p className="text-slate-500 text-sm mb-6">ربما تم حذف هذا الحذاء أو تغيير رابطه</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white font-bold rounded-2xl"
          >
            <ArrowRight className="w-4 h-4" />
            العودة إلى المعرض
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isOutOfStock = product.isOutOfStock || product.stock <= 0;
  const currentSizeObj = product.sizes?.find((s) => s.size.toString() === selectedSize.toString());
  const maxAvailableForSize = currentSizeObj ? Number(currentSizeObj.quantity) : 0;
  const isSelectedSizeAvailable = maxAvailableForSize > 0;
  const totalPrice = product.price * quantity;
  const currentWilaya = algeriaWilayas.find((w) => w.code === selectedWilayaCode);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setOrderError('');

    if (isOutOfStock || !isSelectedSizeAvailable) {
      setOrderError('عذراً، هذا المقاس غير متوفر حالياً');
      return;
    }

    if (!customerName.trim()) {
      setOrderError('يرجى إدخال الاسم الكامل');
      return;
    }

    if (!phoneNumber.trim() || phoneNumber.trim().length < 9) {
      setOrderError('يرجى إدخال رقم هاتف صحيح للتواصل');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        wilaya: currentWilaya ? currentWilaya.name : selectedWilayaCode,
        commune: commune.trim(),
        products: [
          {
            product: product._id,
            name: product.name,
            size: selectedSize.toString(),
            quantity,
            price: product.price,
          },
        ],
      };

      const res = await api.post('/orders', payload);
      if (res.data.success) {
        navigate(`/order-success/${res.data.data._id}`, {
          state: { order: res.data.data },
        });
      }
    } catch (err) {
      setOrderError(err.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة ثانية');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-rose-600 font-semibold">
            الرئيسية
          </Link>
          <span>/</span>
          <Link to={`/?category=${product.category}`} className="hover:text-rose-600 font-semibold">
            {categoryLabels[product.category] || product.category}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold truncate">{product.name}</span>
        </div>
      </div>

      {/* Main Product Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-md">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {isOutOfStock && (
                <div className="absolute top-4 right-4 bg-rose-600 text-white font-black text-sm px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  غير متوفر (نفاد المخزون)
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 bg-white ${
                      selectedImage === img
                        ? 'border-rose-600 shadow-md scale-105'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="صورة مصغرة" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Features & Guarantees */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">شحن سريع</span>
                  <span className="text-slate-500">لجميع الـ 58 ولاية</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">معاينة قبل الدفع</span>
                  <span className="text-slate-500">تأكد من مقاسك وجودة الحذاء</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Fast Order Form (7 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Header info */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-rose-100 text-rose-700 text-xs font-extrabold px-3 py-1 rounded-full">
                  {categoryLabels[product.category] || product.category}
                </span>
                {product.brand && (
                  <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {product.brand}
                  </span>
                )}
                <span className="text-xs text-slate-500">
                  اللون: <strong className="text-slate-800">{product.color || 'عام'}</strong>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl sm:text-4xl font-black text-rose-600">
                  {product.price.toLocaleString('ar-DZ')}{' '}
                  <span className="text-lg font-bold text-slate-800">دج</span>
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {product.description || 'حذاء أنيق ومريح متوفر لدى متجر حانوت 60، تيارت.'}
              </p>
            </div>

            {/* Direct Order Form Box */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-rose-600/30 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-rose-600 to-amber-500" />

              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-10 h-10 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-rose-600/30">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    استمارة الطلب المباشر السريع
                  </h3>
                  <p className="text-xs text-slate-500">
                    املأ معلوماتك وسنتصل بك لتأكيد الإرسال فوراً
                  </p>
                </div>
              </div>

              {orderError && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitOrder} className="space-y-4">
                {/* Size Selection with pointure inventory */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    1. اختر مقاس الحذاء (Pointure):
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.sizes && product.sizes.length > 0 ? (
                      product.sizes.map((s, idx) => {
                        const hasStock = Number(s.quantity) > 0;
                        const isSelected = selectedSize.toString() === s.size.toString();
                        return (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => {
                              if (hasStock) {
                                setSelectedSize(s.size.toString());
                                setQuantity(1);
                              }
                            }}
                            disabled={!hasStock}
                            className={`px-4 py-2.5 rounded-2xl text-sm font-black border transition flex flex-col items-center min-w-[55px] ${
                              isSelected
                                ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30 scale-105'
                                : hasStock
                                ? 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-400'
                                : 'bg-slate-100 text-slate-300 border-slate-200 line-through cursor-not-allowed'
                            }`}
                          >
                            <span>{s.size}</span>
                            <span className="text-[10px] font-normal opacity-80">
                              {hasStock ? `${s.quantity} متبقي` : 'نفد'}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400">مقاس موحد</span>
                    )}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">2. الكمية المطلوبة:</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="font-black text-base text-slate-900 w-6 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(maxAvailableForSize || 5, q + 1))
                      }
                      className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    3. الاسم واللقب الكامل <span className="text-rose-500">*</span>:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="اكتب اسمك ولقبك هنا"
                      className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    4. رقم الهاتف <span className="text-rose-500">*</span> (مهم جداً للاتصال بك):
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
                      className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-right focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                    />
                  </div>
                </div>

                {/* Wilaya & Commune */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      5. الولاية <span className="text-rose-500">*</span>:
                    </label>
                    <select
                      value={selectedWilayaCode}
                      onChange={(e) => setSelectedWilayaCode(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
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
                      6. البلدية <span className="text-rose-500">*</span>:
                    </label>
                    <select
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                    >
                      {communesList.map((c, idx) => (
                        <option key={idx} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Summary & Submit */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block">المبلغ الإجمالي للدفع</span>
                    <span className="text-2xl font-black text-rose-600">
                      {totalPrice.toLocaleString('ar-DZ')} دج
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || isOutOfStock || !isSelectedSizeAvailable}
                    className={`px-8 py-3.5 rounded-2xl font-black text-base text-white shadow-xl transition flex items-center justify-center gap-2 ${
                      submitting || isOutOfStock || !isSelectedSizeAvailable
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30 active:scale-95'
                    }`}
                  >
                    {submitting ? (
                      <span>جاري إرسال الطلبية...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>اضغط هنا لتأكيد الطلب</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
