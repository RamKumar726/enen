const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', orderController.cancelOrder);
router.post('/:id/return', orderController.requestReturn);
router.put('/:id', isAdmin, orderController.updateOrderStatus);

module.exports = router;
