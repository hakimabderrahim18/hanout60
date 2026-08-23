const Notification = require('../models/Notification');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private (Admin)
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .populate('relatedOrder')
      .populate('relatedProduct')
      .sort({ createdAt: -1 })
      .limit(100);

    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private (Admin)
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'الإشعار غير موجود',
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private (Admin)
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });

    res.json({
      success: true,
      message: 'تم تعيين جميع الإشعارات كمقروءة',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private (Admin)
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'تم حذف الإشعار بنجاح',
    });
  } catch (error) {
    next(error);
  }
};
