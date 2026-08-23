import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import ProductEditModal from './ProductEditModal';
import api from '../../services/api';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Package,
  Layers,
  Loader2,
  RotateCcw,
} from 'lucide-react';

import { useSocket } from '../../context/SocketContext';

const categoryLabels = {
  homme: 'رجالي',
  femme: 'نسائي',
  sport: 'رياضي',
  enfant: 'أطفال',
  casual: 'كاجوال',
  autre: 'أخرى',
};

const ProductsManagement = () => {
  const { lastLiveUpdate } = useSocket();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, lastLiveUpdate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف الحذاء: "${name}" نهائياً من المتجر؟`)) {
      return;
    }
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        alert('تم حذف الحذاء بنجاح');
        fetchProducts();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'تعذر حذف الحذاء');
    }
  };

  return (
    <AdminLayout title="إدارة الأحذية والمخزون">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              قائمة الأحذية في المتجر ({products.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              تعديل الأسعار، تحديث المقاسات ومراقبة المخزون الفعلي
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-rose-600/20 transition active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حذاء جديد</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم، الماركة..."
              className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700"
            >
              <option value="all">جميع الفئات</option>
              <option value="homme">رجالي</option>
              <option value="femme">نسائي</option>
              <option value="sport">رياضي</option>
              <option value="casual">كاجوال</option>
              <option value="enfant">أطفال</option>
              <option value="sandales">صنادل وسليبرز</option>
              <option value="bottines">بوت وبوتين</option>
              <option value="medical">أحذية طبية</option>
              {Array.from(new Set(products.map((p) => p.category)))
                .filter(
                  (c) =>
                    ![
                      'homme',
                      'femme',
                      'sport',
                      'casual',
                      'enfant',
                      'sandales',
                      'bottines',
                      'medical',
                    ].includes(c)
                )
                .map((customCat) => (
                  <option key={customCat} value={customCat}>
                    {customCat}
                  </option>
                ))}
            </select>

            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                fetchProducts();
              }}
              className="p-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl transition"
              title="إعادة تعيين"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
              <span className="text-xs text-slate-500 font-bold">جاري تحميل الأحذية...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">الصورة والمعلومات</th>
                    <th className="py-3.5 px-4 sm:px-6">الفئة والماركة</th>
                    <th className="py-3.5 px-4 sm:px-6">السعر</th>
                    <th className="py-3.5 px-4 sm:px-6">المقاسات المتوفرة (الكمية)</th>
                    <th className="py-3.5 px-4 sm:px-6">إجمالي المخزون</th>
                    <th className="py-3.5 px-4 sm:px-6">الحالة</th>
                    <th className="py-3.5 px-4 sm:px-6 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400 text-xs">
                        لا توجد أحذية مطابقة في المتجر
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const isOut = p.isOutOfStock || p.stock <= 0;
                      return (
                        <tr key={p._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  p.images?.[0] ||
                                  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120'
                                }
                                alt={p.name}
                                className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                              />
                              <div>
                                <span className="font-extrabold text-slate-900 block max-w-xs truncate">
                                  {p.name}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  اللون: {p.color || 'عام'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6">
                            <span className="font-bold text-slate-700 block">
                              {categoryLabels[p.category] || p.category}
                            </span>
                            <span className="text-[11px] text-slate-400">{p.brand || 'عام'}</span>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 font-black text-rose-600">
                            {p.price.toLocaleString('ar-DZ')} دج
                          </td>

                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {p.sizes?.map((s, idx) => (
                                <span
                                  key={idx}
                                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${
                                    s.quantity > 0
                                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                                      : 'bg-rose-50 text-rose-400 border-rose-100 line-through'
                                  }`}
                                >
                                  {s.size}: {s.quantity}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 font-black text-slate-800">
                            {p.stock} قطعة
                          </td>

                          <td className="py-3.5 px-4 sm:px-6">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                isOut
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isOut ? (
                                <>
                                  <AlertCircle className="w-3 h-3" />
                                  نفاد المخزون
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  متوفر
                                </>
                              )}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="p-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition"
                                title="تعديل الحذاء"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p._id, p.name)}
                                className="p-2 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 transition"
                                title="حذف الحذاء"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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

      {/* Product Edit / Add Modal */}
      <ProductEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSaveSuccess={fetchProducts}
      />
    </AdminLayout>
  );
};

export default ProductsManagement;
