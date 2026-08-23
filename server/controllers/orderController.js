const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const socketUtils = require('../utils/socket');

// @desc    Create new order (Public visitor)
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res, next) => {
  try {
    const { customerName, phoneNumber, wilaya, commune, products } = req.body;

    if (!customerName || !phoneNumber || !wilaya || !commune) {
      return res.status(400).json({
        success: false,
        message: 'يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، الولاية، البلدية)',
      });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يجب أن تحتوي الطلبية على منتج واحد على الأقل',
      });
    }

    // Validate products and compute total amount
    let totalAmount = 0;
    const validatedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `المنتج المحدد غير متوفر: ${item.name || item.product}`,
        });
      }

      // Check if size is present
      const sizeObj = product.sizes.find((s) => s.size.toString() === item.size.toString());
      if (!sizeObj || sizeObj.quantity < (item.quantity || 1)) {
        return res.status(400).json({
          success: false,
          message: `المقاس ${item.size} للمنتج "${product.name}" غير متوفر بالكمية المطلوبة حالياً`,
        });
      }

      const itemTotal = product.price * (item.quantity || 1);
      totalAmount += itemTotal;

      validatedProducts.push({
        product: product._id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        size: item.size.toString(),
        color: item.color || (product.colors && product.colors[0]) || product.color || '',
        quantity: item.quantity || 1,
        price: product.price,
      });
    }

    // Create the order with 'en_attente' status (Stock is NOT debited yet)
    const order = await Order.create({
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      wilaya: wilaya.trim(),
      commune: commune.trim(),
      products: validatedProducts,
      totalAmount,
      status: 'en_attente',
    });

    // Create Notification for admin
    const notification = await Notification.create({
      type: 'nouvelle_commande',
      message: `طلب جديد من ${order.customerName} بقيمة ${order.totalAmount} دج (${order.wilaya} - ${order.commune})`,
      relatedOrder: order._id,
    });

    // Emit Socket.IO event in real-time
    const io = socketUtils.getIO();
    if (io) {
      io.emit('nouvelle_commande', {
        order,
        notification,
      });
    }

    res.status(201).json({
      success: true,
      message: 'تم إرسال طلبك بنجاح! سيتصل بك فريق حانوت 60 لتأكيد الطلب قريباً.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private (Admin)
exports.getOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { customerName: { $regex: search.trim(), $options: 'i' } },
        { phoneNumber: { $regex: search.trim(), $options: 'i' } },
        { wilaya: { $regex: search.trim(), $options: 'i' } },
        { commune: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID (Admin)
// @route   GET /api/orders/:id
// @access  Private (Admin)
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm order (Admin) -> Decrements shoe size stock & triggers out of stock alert if 0
// @route   PATCH /api/orders/:id/confirm
// @access  Private (Admin)
exports.confirmOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود',
      });
    }

    if (order.status === 'confirmée') {
      return res.status(400).json({
        success: false,
        message: 'تم تأكيد هذا الطلب مسبقاً وتحديث المخزون بالفعل',
      });
    }

    const io = socketUtils.getIO();

    // Loop through order products and decrement specific size stock
    for (const item of order.products) {
      const product = await Product.findById(item.product);
      if (product) {
        const sizeIndex = product.sizes.findIndex(
          (s) => s.size.toString() === item.size.toString()
        );

        if (sizeIndex !== -1) {
          // Decrement size quantity
          const newQty = Math.max(0, product.sizes[sizeIndex].quantity - item.quantity);
          product.sizes[sizeIndex].quantity = newQty;

          // Check if this specific size is now out of stock
          if (newQty === 0) {
            const notifMessage = `تنبيه: نفاد كمية المقاس (${item.size}) للحذاء "${product.name}"`;
            const notif = await Notification.create({
              type: 'rupture_stock',
              message: notifMessage,
              relatedProduct: product._id,
            });

            if (io) {
              io.emit('rupture_stock', {
                notification: notif,
                productName: product.name,
                size: item.size,
              });
            }
          }
        }

        // Recalculate total product stock
        product.stock = product.sizes.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
        product.isOutOfStock = product.stock <= 0;

        if (product.isOutOfStock) {
          const generalOutNotif = await Notification.create({
            type: 'rupture_stock',
            message: `تنبيه حرج: نفاد المخزون الكلي للحذاء "${product.name}" بالكامل!`,
            relatedProduct: product._id,
          });

          if (io) {
            io.emit('rupture_stock', {
              notification: generalOutNotif,
              productName: product.name,
              totalStock: 0,
            });
          }
        }

        await product.save();
      }
    }

    // Update order status
    order.status = 'confirmée';
    await order.save();

    if (io) {
      io.emit('order_updated', { order });
      io.emit('stock_updated', { orderId: order._id });
    }

    res.json({
      success: true,
      message: 'تم تأكيد الطلب وخصم الكمية من المخزون بنجاح',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (Admin) -> Updates status to 'annulée' without touching stock
// @route   PATCH /api/orders/:id/cancel
// @access  Private (Admin)
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود',
      });
    }

    if (order.status === 'confirmée') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن إلغاء طلب مؤكد ومخصوم من المخزون مباشرة، يرجى تعديل المخزون يدوياً إذا لزم الأمر',
      });
    }

    order.status = 'annulée';
    await order.save();

    const io = socketUtils.getIO();
    if (io) {
      io.emit('order_updated', { order });
    }

    res.json({
      success: true,
      message: 'تم إلغاء الطلب بنجاح دون المساس بالمخزون',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics (Admin)
// @route   GET /api/orders/stats/overview
// @access  Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'en_attente' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmée' });
    const cancelledOrders = await Order.countDocuments({ status: 'annulée' });

    const totalProducts = await Product.countDocuments();
    const outOfStockProducts = await Product.countDocuments({ isOutOfStock: true });

    // Calculate revenue from confirmed orders
    const confirmedOrdersData = await Order.find({ status: 'confirmée' }).select('totalAmount');
    const totalRevenue = confirmedOrdersData.reduce((acc, curr) => acc + curr.totalAmount, 0);

    // Recent orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        cancelledOrders,
        totalProducts,
        outOfStockProducts,
        totalRevenue,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};
