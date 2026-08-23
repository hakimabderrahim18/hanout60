import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import ProductFilter from '../components/ProductFilter';
import OrderModal from '../components/OrderModal';
import api from '../services/api';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Flame,
  Loader2,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
} from 'lucide-react';

import { useSocket } from '../context/SocketContext';

const PRODUCTS_PER_PAGE = 5;

const HomePage = () => {
  const { lastLiveUpdate } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState([]);
  const [allProductsMeta, setAllProductsMeta] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [category, setCategory] = useState(initialCategory);
  const [selectedSize, setSelectedSize] = useState('');
  const [search, setSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('newest');

  // Quick Order Modal State
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);
  const [mobileViewMode, setMobileViewMode] = useState('horizontal'); // 'horizontal' (swipe) or 'grid'

  const catalogRef = useRef(null);

  // Sync category param with URL
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setCategory(cat);
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, selectedSize, search, inStockOnly, sort]);

  // Fetch paginated products (5 per page)
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
      };
      if (category && category !== 'all') params.category = category;
      if (selectedSize) params.size = selectedSize;
      if (search.trim()) params.search = search.trim();
      if (inStockOnly) params.inStock = 'true';
      if (sort) params.sort = sort;

      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.data);
        setTotalProducts(res.data.total || res.data.count || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      setError('تعذر تحميل الأحذية، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  // Fetch full category & size metadata in background for filter chips
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await api.get('/products');
        if (res.data.success) {
          setAllProductsMeta(res.data.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchMeta();
  }, []);

  // Re-fetch products when filters, page, or real-time event changes
  useEffect(() => {
    fetchProducts();
  }, [category, selectedSize, search, inStockOnly, sort, currentPage, lastLiveUpdate]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      if (catalogRef.current) {
        catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleResetFilters = () => {
    setCategory('all');
    setSelectedSize('');
    setSearch('');
    setInStockOnly(false);
    setSort('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Calculate page number list for display
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-cairo">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden py-12 sm:py-20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#7c3aed_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 px-4 py-1.5 rounded-full text-purple-300 text-xs sm:text-sm font-bold mb-4">
              <Flame className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>تشكيلة حصرية من أرقى الأحذية في تيارت</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none text-white font-cairo">
              أفضل الأحذية بأفضل الأسعار مع{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                hanout60
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              تصفح التشكيلة الجديدة، اطلب حذاءك المفضل في ثوانٍ معدودة وبدون الحاجة لإنشاء حساب، واستلم عند باب منزلك مع الدفع عند الاستلام والمعاينة.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <a
                href="#catalog"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-extrabold text-sm shadow-lg shadow-purple-600/30 transition active:scale-95 flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>تصفح تشكيلة الأحذية</span>
              </a>

              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>المركز التجاري سوق الفلاح، تيارت</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Products Section */}
      <main ref={catalogRef} id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full scroll-mt-20">
        {/* Section Heading */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <span>معرض الأحذية المتوفرة</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              عرض 5 أحذية في كل صفحة لسهولة التصفح والطلب السريع
            </p>
          </div>
          <div className="text-xs font-bold text-slate-600 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
            <span>إجمالي الأحذية:</span>
            <span className="text-purple-600 font-black text-sm">{totalProducts}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">
              الصفحة <strong>{currentPage}</strong> من <strong>{totalPages}</strong>
            </span>
          </div>
        </div>

        {/* Filters bar */}
        <ProductFilter
          category={category}
          setCategory={setCategory}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          search={search}
          setSearch={setSearch}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          sort={sort}
          setSort={setSort}
          onReset={handleResetFilters}
          availableCategories={Array.from(
            new Set(allProductsMeta.map((p) => p.category).filter(Boolean))
          )}
          availableSizes={Array.from(
            new Set(allProductsMeta.flatMap((p) => p.sizes?.map((s) => s.size) || []).filter(Boolean))
          )}
        />

        {/* Mobile View Switcher & Swipe Hint */}
        <div className="flex sm:hidden items-center justify-between bg-purple-50/80 px-4 py-2.5 rounded-2xl border border-purple-100 mb-4 text-xs">
          <span className="text-purple-800 font-bold flex items-center gap-1.5">
            <span>👈 اسحب لليسار لمعاينة باقي الأحذية</span>
          </span>
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-purple-200">
            <button
              onClick={() => setMobileViewMode('horizontal')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                mobileViewMode === 'horizontal'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              ↔️ أفقي
            </button>
            <button
              onClick={() => setMobileViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                mobileViewMode === 'grid'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              📱 شبكة
            </button>
          </div>
        </div>

        {/* Products Grid / Horizontal Scroll (5 items per page) */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            <p className="text-slate-500 font-bold text-sm">جاري تحميل الأحذية...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-600 bg-rose-50 rounded-3xl border border-rose-200 p-8">
            <p className="font-bold">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <p className="text-slate-600 font-bold text-base">لا توجد أحذية تطابق معايير البحث المحددة</p>
            <p className="text-slate-400 text-xs mt-1">جرب تغيير الفئة أو المقاس أو البحث باسم آخر</p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition"
            >
              عرض كل المنتجات
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Products Container: Horizontal Swipe on Mobile (when mode is 'horizontal') and Responsive Grid on Desktop */}
            <div
              className={`${
                mobileViewMode === 'horizontal'
                  ? 'flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
                  : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5'
              }`}
            >
              {products.map((product) => (
                <div
                  key={product._id}
                  className={`${
                    mobileViewMode === 'horizontal'
                      ? 'min-w-[270px] max-w-[290px] sm:min-w-0 sm:max-w-none snap-center shrink-0 sm:shrink flex flex-col'
                      : ''
                  }`}
                >
                  <ProductCard
                    product={product}
                    onQuickOrder={(prod) => setSelectedProductForOrder(prod)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Info Text */}
                <div className="text-xs text-slate-500 font-semibold">
                  عرض الأحذية من{' '}
                  <strong className="text-slate-900">
                    {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}
                  </strong>{' '}
                  إلى{' '}
                  <strong className="text-slate-900">
                    {Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts)}
                  </strong>{' '}
                  من إجمالي <strong className="text-purple-600 font-black">{totalProducts}</strong> حذاء
                </div>

                {/* Page Navigation Buttons */}
                <div className="flex items-center gap-1.5">
                  {/* First Page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition"
                    title="الصفحة الأولى"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span className="hidden sm:inline">السابقة</span>
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-black transition ${
                        currentPage === pageNum
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-105'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {/* Next Page */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition"
                  >
                    <span className="hidden sm:inline">التالية</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition"
                    title="الصفحة الأخيرة"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Quick Order Modal */}
      {selectedProductForOrder && (
        <OrderModal
          product={selectedProductForOrder}
          isOpen={!!selectedProductForOrder}
          onClose={() => setSelectedProductForOrder(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export default HomePage;
