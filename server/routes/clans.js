const express = require('express');
const router = express.Router();
const clanController = require('../controllers/clanController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public route
router.get('/', clanController.getClans);

// Admin routes
router.get('/admin', verifyToken, isAdmin, clanController.getAdminClans);
router.get('/:id', clanController.getClanById);
router.post('/', verifyToken, isAdmin, clanController.createClan);
router.put('/:id', verifyToken, isAdmin, clanController.updateClan);
router.delete('/:id', verifyToken, isAdmin, clanController.deleteClan);

module.exports = router;
