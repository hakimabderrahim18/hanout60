const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'اسم المستخدم مطلوب'],
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
    },
  },
  { timestamps: true }
);

// Method to verify password
AdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('Admin', AdminSchema);
