const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'hanout_60_super_secret_jwt_key_2026_tiaret',
    { expiresIn: '30d' }
  );
};

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
exports.loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = username ? username.trim().toLowerCase() : '';
    const cleanPassword = password ? password.trim() : '';

    if (!cleanUsername || !cleanPassword) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال اسم المستخدم وكلمة المرور',
      });
    }

    // Check for admin
    let admin = await Admin.findOne({ username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } });

    // Auto-seed default admin if no admin exists in DB yet
    if (!admin && cleanUsername === 'admin' && cleanPassword === 'admin25') {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin25', salt);
      admin = await Admin.create({
        username: 'admin',
        passwordHash: hashedPassword,
      });
      console.log('[Auth] تم إنشاء حساب الأدمن الافتراضي تلقائياً: admin / admin25');
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'بيانات تسجيل الدخول غير صحيحة (اسم المستخدم غير موجود)',
      });
    }

    // Match password
    const isMatch = await admin.matchPassword(cleanPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'كلمة المرور غير صحيحة',
      });
    }

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        _id: admin._id,
        username: admin.username,
        token: generateToken(admin._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current admin profile
// @route   GET /api/auth/me
// @access  Private (Admin)
exports.getAdminProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        _id: req.admin._id,
        username: req.admin.username,
      },
    });
  } catch (error) {
    next(error);
  }
};
