const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const validQuantity = value => Number.isSafeInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 20;

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ success: false, message: 'Invalid product id' });

    if (!validQuantity(quantity)) return res.status(400).json({ success: false, message: 'Quantity must be an integer from 1 to 20' });
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product unavailable' });
    const selectedSize = size || product.sizes?.[0];
    const selectedColor = color || product.colors?.[0]?.name;
    if (!product.sizes?.includes(selectedSize) || !product.colors?.some(option => option.name === selectedColor)) {
      return res.status(400).json({ success: false, message: 'Select a size and color offered for this product' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      i => i.productId.toString() === productId && i.size === selectedSize && i.color === selectedColor
    );

    if (itemIndex > -1) {
      if (cart.items[itemIndex].quantity + Number(quantity) > 20) return res.status(400).json({ success: false, message: 'Maximum quantity per item is 20' });
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      cart.items.push({ productId, quantity: Number(quantity), size: selectedSize, color: selectedColor });
    }
    if (cart.items.filter(i => i.productId.toString() === productId).reduce((total, item) => total + item.quantity, 0) > product.stock) {
      return res.status(409).json({ success: false, message: 'Requested quantity exceeds available stock' });
    }

    await cart.save();
    await cart.populate('items.productId');

    res.status(200).json({ success: true, message: 'Item added to cart!', cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (item) {
      if (quantity <= 0) {
        cart.items.pull(itemId);
      } else {
        if (!validQuantity(quantity)) return res.status(400).json({ success: false, message: 'Quantity must be an integer from 1 to 20' });
        const product = await Product.findOne({ _id: item.productId, isActive: true });
        const otherVariantQty = cart.items.filter(entry => entry.productId.toString() === item.productId.toString() && entry._id.toString() !== item._id.toString()).reduce((sum, entry) => sum + entry.quantity, 0);
        if (!product || Number(quantity) + otherVariantQty > product.stock) return res.status(409).json({ success: false, message: 'Requested quantity exceeds available stock' });
        item.quantity = Number(quantity);
      }
      await cart.save();
      await cart.populate('items.productId');
    }

    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });
    res.json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items.pull(itemId);
      await cart.save();
      await cart.populate('items.productId');
    }

    res.json({ success: true, message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await Cart.findOneAndUpdate({ userId }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};
