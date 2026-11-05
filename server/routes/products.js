const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.get('/admin', verifyToken, isAdmin, productController.getAdminProducts);
router.get('/admin/:id', verifyToken, isAdmin, productController.getAdminProductById);
router.get('/:id', productController.getProductById);
router.post('/', verifyToken, isAdmin, productController.createProduct);
router.put('/:id', verifyToken, isAdmin, productController.updateProduct);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);
router.post('/:id/reviews', verifyToken, productController.addProductReview);

module.exports = router;
