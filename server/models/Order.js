const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      required: [true, 'يرجى اختيار المقاس'],
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'الاسم الكامل مطلوب'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
      trim: true,
    },
    wilaya: {
      type: String,
      required: [true, 'يرجى تحديد الولاية'],
      trim: true,
    },
    commune: {
      type: String,
      required: [true, 'يرجى تحديد البلدية'],
      trim: true,
    },
    products: {
      type: [OrderItemSchema],
      required: true,
      validate: [(val) => val.length > 0, 'يجب أن تحتوي الطلبية على منتج واحد على الأقل'],
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['en_attente', 'confirmée', 'annulée'],
      default: 'en_attente',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
