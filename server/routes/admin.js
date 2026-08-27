const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken, isAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalyticsData);
router.get('/orders', adminController.getAllOrders);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);

module.exports = router;
