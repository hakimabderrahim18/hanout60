const mongoose = require('mongoose');

const SizeSchema = new mongoose.Schema(
  {
    size: {
      type: String, // e.g. "39", "40", "41", "42", "43", "44", "45"
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'يرجى إدخال اسم الحذاء'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'يرجى إدخال السعر'],
      min: [0, 'السعر لا يمكن أن يكون سالباً'],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'يرجى تحديد الفئة'],
      trim: true,
      default: 'homme',
    },
    sizes: {
      type: [SizeSchema],
      default: [],
    },
    colors: {
      type: [String], // Array of available shoe colors e.g. ["أسود", "أبيض", "كحلي", "أحمر"]
      default: [],
    },
    color: {
      type: String,
      trim: true,
      default: 'متعدد الألوان',
    },
    brand: {
      type: String,
      trim: true,
      default: 'عام',
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isOutOfStock: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate total stock and isOutOfStock flag automatically
ProductSchema.pre('save', function (next) {
  if (this.sizes && this.sizes.length > 0) {
    this.stock = this.sizes.reduce((total, s) => total + (Number(s.quantity) || 0), 0);
  }
  this.isOutOfStock = this.stock <= 0;
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
