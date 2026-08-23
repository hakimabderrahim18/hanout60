const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hanout60');
    console.log(`[MongoDB] الاتصال بقاعدة البيانات ناجح: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] خطأ في الاتصال بقاعدة البيانات: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
