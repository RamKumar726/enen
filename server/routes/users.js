const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.get('/addresses', userController.getAddresses);
router.post('/addresses', userController.addAddress);
router.delete('/addresses/:id', userController.deleteAddress);

module.exports = router;
