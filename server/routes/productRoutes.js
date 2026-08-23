const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
} = require('../controllers/productController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin protected routes
router.post('/', protectAdmin, createProduct);
router.put('/:id', protectAdmin, updateProduct);
router.delete('/:id', protectAdmin, deleteProduct);
router.post('/upload', protectAdmin, upload.array('images', 5), uploadImages);

module.exports = router;
