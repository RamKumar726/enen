const express = require('express');
const router = express.Router();
const carouselController = require('../controllers/carouselController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public route for hero banner slider
router.get('/', carouselController.getActiveBanners);

// Protected admin routes for Carousel Banner Management
router.get('/all', verifyToken, isAdmin, carouselController.getAllBanners);
router.post('/', verifyToken, isAdmin, carouselController.createBanner);
router.put('/:id', verifyToken, isAdmin, carouselController.updateBanner);
router.put('/:id/toggle', verifyToken, isAdmin, carouselController.toggleBannerStatus);
router.delete('/:id', verifyToken, isAdmin, carouselController.deleteBanner);

module.exports = router;
