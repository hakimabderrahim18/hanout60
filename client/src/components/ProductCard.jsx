import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, AlertCircle } from 'lucide-react';

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

const ProductCard = ({ product, onQuickOrder }) => {
  const isOutOfStock = product.isOutOfStock || product.stock <= 0;
  const mainImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60';

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img
          src={mainImage}
          alt={product.name}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
            isOutOfStock ? 'grayscale opacity-75' : ''
          }`}
          loading="lazy"
        />

        {/* Category Tag */}
        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
          {categoryLabels[product.category] || product.category}
        </span>

        {/* Brand Tag if available */}
        {product.brand && product.brand !== 'عام' && (
          <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
            {product.brand}
          </span>
        )}

        {/* Out of Stock Overlay / Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center p-3">
            <span className="bg-rose-600 text-white text-xs sm:text-sm font-extrabold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              غير متوفر حالياً
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/product/${product._id}`} className="block">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-rose-600 transition line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {product.description || 'حذاء بجودة ممتازة متوفر في حانوت 60'}
          </p>

          {/* Sizes available pills */}
          <div className="mt-3">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              المقاسات المتوفرة:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes && product.sizes.length > 0 ? (
                product.sizes.map((s, idx) => {
                  const hasStock = Number(s.quantity) > 0;
                  return (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-0.5 rounded-lg font-bold border transition ${
                        hasStock
                          ? 'bg-slate-50 text-slate-700 border-slate-200'
                          : 'bg-slate-100 text-slate-300 border-dashed border-slate-200 line-through'
                      }`}
                      title={hasStock ? `متوفر: ${s.quantity} قطعة` : 'المقاس نفد'}
                    >
                      {s.size}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-slate-400">حسب الطلب</span>
              )}
            </div>
          </div>

          {/* Multiple Colors available */}
          {((product.colors && product.colors.length > 0) || product.color) && (
            <div className="mt-2.5">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                الألوان المتوفرة:
              </span>
              <div className="flex flex-wrap gap-1">
                {(product.colors && product.colors.length > 0
                  ? product.colors
                  : [product.color]
                ).map((clr, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md border border-purple-200/60 font-semibold"
                  >
                    {clr}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-slate-400 block">السعر</span>
            <span className="text-lg sm:text-xl font-black text-rose-600">
              {product.price.toLocaleString('ar-DZ')}{' '}
              <span className="text-xs font-bold text-slate-800">دج</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to={`/product/${product._id}`}
              className="p-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              title="عرض التفاصيل"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              onClick={() => onQuickOrder && onQuickOrder(product)}
              disabled={isOutOfStock}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/20 active:scale-95'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>اطلب الآن</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
