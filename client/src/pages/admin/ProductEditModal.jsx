import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, AlertCircle, Check, Loader2, Image, Sparkles } from 'lucide-react';
import api from '../../services/api';

const defaultCategories = [
  { id: 'homme', name: 'رجالي (Homme)' },
  { id: 'femme', name: 'نسائي (Femme)' },
  { id: 'sport', name: 'رياضي (Sport)' },
  { id: 'casual', name: 'كاجوال (Casual)' },
  { id: 'enfant', name: 'أطفال (Enfant)' },
  { id: 'sandales', name: 'صنادل وسليبرز (Sandales / Claquettes)' },
  { id: 'bottines', name: 'بوت وبوتين (Bottes / Bottines)' },
  { id: 'medical', name: 'أحذية طبية ومريحة (Orthopédique)' },
  { id: 'custom', name: '✨ إضافة فئة جديدة مخصصة...' },
];

const ProductEditModal = ({ isOpen, onClose, product, onSaveSuccess }) => {
  const isEditing = !!product;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('homme');
  const [customCategory, setCustomCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [colors, setColors] = useState(['أسود', 'أبيض']);
  const [newColorInput, setNewColorInput] = useState('');
  const [images, setImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [sizes, setSizes] = useState([
    { size: '40', quantity: 5 },
    { size: '41', quantity: 5 },
    { size: '42', quantity: 5 },
  ]);

  const [newSizeInput, setNewSizeInput] = useState('');
  const [newSizeQtyInput, setNewSizeQtyInput] = useState(5);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Populate data when editing
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price || '');
      
      // Check if category is standard or custom
      const isStandard = defaultCategories.some((c) => c.id === product.category);
      if (isStandard) {
        setCategory(product.category);
        setCustomCategory('');
      } else {
        setCategory('custom');
        setCustomCategory(product.category || '');
      }

      setBrand(product.brand || '');
      setColor(product.color || '');
      setColors(
        product.colors && product.colors.length > 0
          ? product.colors
          : product.color
          ? [product.color]
          : ['أسود', 'أبيض']
      );
      setImages(product.images || []);
      setSizes(
        product.sizes && product.sizes.length > 0
          ? product.sizes.map((s) => ({ size: s.size.toString(), quantity: Number(s.quantity) }))
          : [{ size: '40', quantity: 5 }]
      );
    } else {
      // Default reset for new shoe
      setName('');
      setDescription('');
      setPrice('');
      setCategory('homme');
      setCustomCategory('');
      setBrand('');
      setColor('');
      setColors(['أسود', 'أبيض']);
      setImages([]);
      setSizes([
        { size: '40', quantity: 5 },
        { size: '41', quantity: 7 },
        { size: '42', quantity: 7 },
        { size: '43', quantity: 5 },
      ]);
    }
    setError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  // Handle sizes row changes
  const handleSizeChange = (index, field, value) => {
    const newSizes = [...sizes];
    newSizes[index][field] = field === 'quantity' ? Math.max(0, parseInt(value) || 0) : value;
    setSizes(newSizes);
  };

  // Add individual custom size
  const handleAddSingleSize = (e) => {
    e?.preventDefault();
    if (!newSizeInput.trim()) return;
    
    // Check if size already exists
    const exists = sizes.some((s) => s.size.trim() === newSizeInput.trim());
    if (exists) {
      alert(`المقاس ${newSizeInput} موجود بالفعل في القائمة! يمكنك تعديل كميته مباشرة.`);
      return;
    }

    setSizes([...sizes, { size: newSizeInput.trim(), quantity: Number(newSizeQtyInput) || 1 }]);
    setNewSizeInput('');
    setNewSizeQtyInput(5);
  };

  const handleRemoveSizeRow = (index) => {
    if (sizes.length === 1) {
      alert('يجب أن يحتوي الحذاء على مقاس واحد على الأقل');
      return;
    }
    setSizes(sizes.filter((_, i) => i !== index));
  };

  // Presets
  const applyMenSizes = () => {
    setSizes([
      { size: '39', quantity: 3 },
      { size: '40', quantity: 5 },
      { size: '41', quantity: 8 },
      { size: '42', quantity: 8 },
      { size: '43', quantity: 6 },
      { size: '44', quantity: 4 },
      { size: '45', quantity: 2 },
    ]);
  };

  const applyWomenSizes = () => {
    setSizes([
      { size: '36', quantity: 4 },
      { size: '37', quantity: 6 },
      { size: '38', quantity: 8 },
      { size: '39', quantity: 6 },
      { size: '40', quantity: 4 },
      { size: '41', quantity: 2 },
    ]);
  };

  const applyKidsSizes = () => {
    setSizes([
      { size: '28', quantity: 4 },
      { size: '29', quantity: 5 },
      { size: '30', quantity: 6 },
      { size: '31', quantity: 5 },
      { size: '32', quantity: 4 },
      { size: '33', quantity: 3 },
      { size: '34', quantity: 3 },
      { size: '35', quantity: 2 },
    ]);
  };

  const applyBigSizes = () => {
    setSizes([
      { size: '44', quantity: 4 },
      { size: '45', quantity: 5 },
      { size: '46', quantity: 5 },
      { size: '47', quantity: 3 },
      { size: '48', quantity: 2 },
    ]);
  };

  // Handle direct image URL add
  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImages([...images, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    setUploading(true);
    setError('');

    try {
      const res = await api.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setImages([...images, ...res.data.data]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'فشل رفع الصور');
    } finally {
      setUploading(false);
    }
  };

  // Total stock calculation
  const totalStock = sizes.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);

  // Colors helpers
  const handleAddColor = (clrInput) => {
    const val = typeof clrInput === 'string' && clrInput.trim() !== ''
      ? clrInput.trim()
      : (newColorInput || '').trim();

    if (!val) return;

    if (colors.includes(val)) {
      alert(`اللون "${val}" مضاف بالفعل في القائمة!`);
      return;
    }
    setColors((prev) => [...prev, val]);
    setNewColorInput('');
  };

  const handleRemoveColor = (clrToRemove) => {
    setColors((prev) => prev.filter((c) => c !== clrToRemove));
  };

  const colorPresets = ['أسود', 'أبيض', 'كحلي', 'بني', 'رمادي', 'أحمر', 'بيج', 'أزرق', 'أخضر', 'هافان'];

  // Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('يرجى إدخال اسم الحذاء');
      return;
    }

    if (!price || Number(price) <= 0) {
      setError('يرجى إدخال سعر صحيح للحذاء');
      return;
    }

    const finalCategory = category === 'custom' ? customCategory.trim() : category;
    if (!finalCategory) {
      setError('يرجى تحديد أو كتابة فئة الحذاء');
      return;
    }

    if (sizes.length === 0) {
      setError('يرجى إضافة مقاس واحد على الأقل مع الكمية');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category: finalCategory,
        brand: brand.trim() || 'عام',
        color: colors.length > 0 ? colors[0] : (color.trim() || 'عام'),
        colors: colors.length > 0 ? colors : (color ? [color] : []),
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
        sizes,
      };

      let res;
      if (isEditing) {
        res = await api.put(`/products/${product._id}`, payload);
      } else {
        res = await api.post('/products', payload);
      }

      if (res.data.success) {
        onSaveSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ المنتج');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <span>{isEditing ? 'تعديل بيانات الحذاء والمقاسات' : 'إضافة حذاء جديد للمتجر'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              يمكنك إضافة مقاسات متعددة وتحديد أي فئة مخصصة تريدها
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1.5">
                اسم وموديل الحذاء <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: حذاء رياضي نايك إير زوم ماكس (Nike Air Zoom)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                السعر بالدينار الجزائري (دج) <span className="text-rose-500">*</span>:
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="6500"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            {/* Category selection & Custom Category Input */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                فئة الحذاء (Catégorie) <span className="text-rose-500">*</span>:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                {defaultCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* If custom category chosen */}
              {category === 'custom' && (
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="اكتب اسم الفئة الجديدة (مثلاً: أحذية مناسبات، بوت شتوي...)"
                    className="w-full px-3.5 py-2 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">الماركة (Brand):</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Nike, Adidas, Puma, Zara, Royal Leather..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-700 text-xs">
                  الألوان المتوفرة للحذاء (Multiple Colors):
                </label>
                <span className="text-[11px] text-purple-600 font-bold">
                  {colors.length} ألوان مضافة
                </span>
              </div>

              {/* Current Colors Tags */}
              <div className="flex flex-wrap gap-2 min-h-[36px] p-2 bg-white rounded-xl border border-slate-200 items-center">
                {colors.map((clr, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-800 rounded-lg text-xs font-bold border border-purple-200"
                  >
                    <span>{clr}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(clr)}
                      className="text-purple-400 hover:text-rose-600 transition"
                      title="حذف اللون"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {colors.length === 0 && (
                  <span className="text-xs text-slate-400">لم تتم إضافة أي لون بعد</span>
                )}
              </div>

              {/* Add Custom Color & Quick Presets */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="text"
                    value={newColorInput}
                    onChange={(e) => setNewColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddColor(newColorInput);
                      }
                    }}
                    placeholder="اكتب لوناً جديداً ثم اضغط إضافة..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddColor(newColorInput)}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shrink-0 shadow-sm"
                  >
                    + إضافة
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-[10px] text-slate-400 shrink-0">ألوان شائعة:</span>
                  {colorPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddColor(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                        colors.includes(preset)
                          ? 'bg-purple-100 text-purple-700 border-purple-300 opacity-60'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1.5">الوصف والمميزات:</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف تفصيلي للخامات، راحة النعل، الاستخدام اليومي..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Sizes & Stock Section */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm">
                  المقاسات والكمية في المخزن (Pointures & Stock)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  إجمالي المخزون المحسوب تلقائياً:{' '}
                  <strong className="text-rose-600 font-black text-sm">{totalStock} قطعة</strong>
                </p>
              </div>

              {/* Quick Size Presets */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={applyMenSizes}
                  className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition"
                  title="39, 40, 41, 42, 43, 44, 45"
                >
                  👞 مقاسات رجالية (39-45)
                </button>
                <button
                  type="button"
                  onClick={applyWomenSizes}
                  className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition"
                  title="36, 37, 38, 39, 40, 41"
                >
                  👠 مقاسات نسائية (36-41)
                </button>
                <button
                  type="button"
                  onClick={applyKidsSizes}
                  className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition"
                  title="28-35"
                >
                  🧒 مقاسات أطفال (28-35)
                </button>
                <button
                  type="button"
                  onClick={applyBigSizes}
                  className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition"
                  title="44-48"
                >
                  👟 مقاسات كبيرة (44-48)
                </button>
              </div>
            </div>

            {/* Quick Add Custom Size Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-2">
              <span className="font-bold text-xs text-slate-700 shrink-0">إضافة مقاس مخصص:</span>
              <input
                type="text"
                value={newSizeInput}
                onChange={(e) => setNewSizeInput(e.target.value)}
                placeholder="رقم المقاس (مثال: 46 أو 38.5)"
                className="w-36 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center"
              />
              <input
                type="number"
                min="0"
                value={newSizeQtyInput}
                onChange={(e) => setNewSizeQtyInput(e.target.value)}
                placeholder="الكمية"
                className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center"
              />
              <button
                type="button"
                onClick={handleAddSingleSize}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة المقاس</span>
              </button>
            </div>

            {/* Sizes List Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {sizes.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm"
                >
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 font-bold block mb-0.5">المقاس:</span>
                    <input
                      type="text"
                      value={s.size}
                      onChange={(e) => handleSizeChange(idx, 'size', e.target.value)}
                      placeholder="40"
                      className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center"
                    />
                  </div>

                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 font-bold block mb-0.5">الكمية بالمخزن:</span>
                    <input
                      type="number"
                      min="0"
                      value={s.quantity}
                      onChange={(e) => handleSizeChange(idx, 'quantity', e.target.value)}
                      className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center text-rose-600"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSizeRow(idx)}
                    className="mt-3 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    title="حذف هذا المقاس"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-3">
            <label className="block font-bold text-slate-700">صور الحذاء:</label>

            {/* Upload & URL inputs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1 cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-dashed border-rose-300 rounded-2xl p-3 text-center flex items-center justify-center gap-2 transition font-bold">
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>{uploading ? 'جاري رفع الصور...' : 'رفع صور من الجهاز (PNG, JPG)'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex-1 flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="أو ألصق رابط صورة مباشر (URL)"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3.5 py-2 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 text-xs"
                >
                  إضافة
                </button>
              </div>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group"
                  >
                    <img src={img} alt="صورة" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 left-1 bg-rose-600 text-white p-1 rounded-lg opacity-90 hover:opacity-100 transition"
                      title="حذف الصورة"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-2 shadow-md shadow-rose-600/30 disabled:opacity-50"
            >
              {saving ? (
                <span>جاري الحفظ...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'حفظ التعديلات' : 'إضافة الحذاء للمتجر'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
