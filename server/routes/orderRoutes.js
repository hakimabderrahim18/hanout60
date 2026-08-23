const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  confirmOrder,
  cancelOrder,
  getDashboardStats,
} = require('../controllers/orderController');
const { protectAdmin } = require('../middlewares/authMiddleware');

// Public route: create order
router.post('/', createOrder);

// Admin protected routes
router.get('/stats/overview', protectAdmin, getDashboardStats);
router.get('/', protectAdmin, getOrders);
router.get('/:id', protectAdmin, getOrderById);
router.patch('/:id/confirm', protectAdmin, confirmOrder);
router.patch('/:id/cancel', protectAdmin, cancelOrder);

module.exports = router;
