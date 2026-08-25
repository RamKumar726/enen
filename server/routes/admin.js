const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken, isAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalyticsData);

module.exports = router;
