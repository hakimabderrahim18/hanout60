const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile } = require('../controllers/authController');
const { protectAdmin } = require('../middlewares/authMiddleware');

router.post('/login', loginAdmin);
router.get('/me', protectAdmin, getAdminProfile);

module.exports = router;
