const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hanout60';
  
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`=========================================`);
    console.log(`✅ [MongoDB Atlas] تم الاتصال بنجاح بقاعدة البيانات السحابية!`);
    console.log(`📡 Host: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
    console.log(`=========================================`);
  } catch (error) {
    console.error(`❌ [MongoDB Error] فشل الاتصال بقاعدة البيانات: ${error.message}`);
    console.error(`⚠️ يرجى التأكد من إضافة 0.0.0.0/0 في Network Access داخل لوحة تحكم MongoDB Atlas للسماح لخوادم Render بالاتصال.`);
  }
};

module.exports = connectDB;
