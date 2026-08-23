require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Product = require('../models/Product');

const cleanProductionData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hanout60';
    console.log(`[Clean Prod] الاتصال بقاعدة البيانات: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    // 1. Delete all test orders
    const deletedOrders = await Order.deleteMany({});
    console.log(`[Clean Prod] 🧹 تم حذف جميع الطلبيات التجريبية (${deletedOrders.deletedCount} طلبية)`);

    // 2. Delete all test notifications
    const deletedNotifs = await Notification.deleteMany({});
    console.log(`[Clean Prod] 🧹 تم حذف جميع الإشعارات التجريبية (${deletedNotifs.deletedCount} إشعار)`);

    // 3. Reset Admin credentials cleanly
    await Admin.deleteMany({});
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin25';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPass, salt);

    await Admin.create({
      username: adminUser,
      passwordHash,
    });
    console.log(`[Clean Prod] 🛡️ تم ضبط حساب المسؤول للإنتاج: ${adminUser}`);

    const totalProducts = await Product.countDocuments();
    console.log(`[Clean Prod] 👟 عدد المنتجات الجاهزة للبيع في المتجر: ${totalProducts} حذاء`);

    console.log('\n=========================================');
    console.log('✅ تم تنظيف قاعدة البيانات وتجهيزها للإنتاج (Production Ready)!');
    console.log(`- الطلبيات: 0 طلبية (نظيفة وجاهزة لاستقبال طلبات الزبائن الحقيقية)`);
    console.log(`- الإشعارات: 0 إشعار`);
    console.log(`- المنتجات: ${totalProducts} حذاء متوفر`);
    console.log(`- حساب الأدمن: ${adminUser} / ${adminPass}`);
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Clean Prod Error] حدث خطأ أثناء تنظيف البيانات:', error);
    process.exit(1);
  }
};

cleanProductionData();
