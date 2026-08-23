const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['nouvelle_commande', 'rupture_stock'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
