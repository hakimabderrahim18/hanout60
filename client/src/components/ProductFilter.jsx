import React from 'react';
import { Search, Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

const categoryLabels = {
  all: 'جميع الأحذية',
  homme: 'رجالي',
  femme: 'نسائي',
  sport: 'رياضي',
  casual: 'كاجوال',
  enfant: 'أطفال',
  sandales: 'صنادل وسليبرز',
  bottines: 'بوت وبوتين',
  medical: 'أحذية طبية',
};

const defaultSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

const ProductFilter = ({
  category,
  setCategory,
  selectedSize,
  setSelectedSize,
  search,
  setSearch,
  inStockOnly,
  setInStockOnly,
  sort,
  setSort,
  onReset,
  availableCategories = [],
  availableSizes = [],
}) => {
  // Merge default categories with any custom categories present in products
  const uniqueCategories = [
    'all',
    'homme',
    'femme',
    'sport',
    'casual',
    'enfant',
    ...availableCategories.filter(
      (c) => !['all', 'homme', 'femme', 'sport', 'casual', 'enfant'].includes(c)
    ),
  ];

  // Merge default sizes with any unique sizes present in products
  const uniqueSizes = Array.from(new Set([...defaultSizes, ...availableSizes])).sort(
    (a, b) => (Number(a) || 0) - (Number(b) || 0)
  );

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm mb-8 space-y-5">
      {/* Top row: Search & Sorting */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن موديل الحذاء، الماركة (Nike, Adidas...) أو اللون..."
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
          />
        </div>

        {/* Sort & Quick In-Stock Filter */}
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
          >
            <option value="newest">الأحدث وصولاً</option>
            <option value="price_asc">السعر: من الأقل للأعلى</option>
            <option value="price_desc">السعر: من الأعلى للأقل</option>
            <option value="name">الترتيب الأبجدي</option>
          </select>

          <button
            onClick={onReset}
            className="p-2.5 bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition"
            title="إعادة ضبط الفلاتر"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Pills with horizontal scroll on phone */}
      <div>
        <span className="text-xs font-bold text-slate-400 block mb-2">الفئات:</span>
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1.5 scroll-smooth">
          {uniqueCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition ${
                category === c
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {categoryLabels[c] || c}
            </button>
          ))}
        </div>
      </div>

      {/* Size Filter & Stock toggle with horizontal scroll on phone */}
      <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Pointures */}
        <div className="flex items-center gap-2 overflow-hidden w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 shrink-0">المقاس (Pointure):</span>
          <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1 flex-1 scroll-smooth">
            <button
              onClick={() => setSelectedSize('')}
              className={`text-xs px-3 py-1 rounded-xl font-bold whitespace-nowrap shrink-0 transition border ${
                selectedSize === ''
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              الكل
            </button>
            {uniqueSizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                className={`text-xs px-3 py-1 rounded-xl font-bold whitespace-nowrap shrink-0 transition border ${
                  selectedSize === s
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* In stock toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
          />
          <span className="text-xs sm:text-sm font-semibold text-slate-700">
            إظهار المتوفر فقط في المتجر
          </span>
        </label>
      </div>
    </div>
  );
};

export default ProductFilter;
