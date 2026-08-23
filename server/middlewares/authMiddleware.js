const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'hanout_60_super_secret_jwt_key_2026_tiaret'
      );
      req.admin = await Admin.findById(decoded.id).select('-passwordHash');

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'المستخدم غير موجود أو تم إلغاء حسابه',
        });
      }

      next();
    } catch (error) {
      console.error('[AuthMiddleware] خطأ في التحقق من الرمز المميز:', error.message);
      return res.status(401).json({
        success: false,
        message: 'غير مصرح بالدخول، الرمز المميز غير صالح أو منتهي الصلاحية',
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح بالدخول، يرجى تسجيل الدخول كمسؤول أولاً',
    });
  }
};

module.exports = { protectAdmin };
