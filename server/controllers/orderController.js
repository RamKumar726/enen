const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      products,
      shippingAddress,
      billingAddress,
      paymentMethod = 'Razorpay',
      totalAmount,
      taxPrice = 0,
      shippingPrice = 0,
      itemsPrice
    } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Valid shipping address is required' });
    }

    // ── Stock Validation ──
    // Check stock availability for each product before accepting the order
    const stockErrors = [];
    const productDocs = [];

    for (const item of products) {
      if (!item.productId) continue;
      const product = await Product.findById(item.productId);
      if (!product) {
        stockErrors.push(`Product "${item.name}" no longer exists`);
        continue;
      }
      if (product.stock < item.quantity) {
        stockErrors.push(`"${product.name}" only has ${product.stock} units in stock (requested ${item.quantity})`);
        continue;
      }
      productDocs.push({ doc: product, quantity: item.quantity });
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock: ' + stockErrors.join('; ')
      });
    }

    // ── Decrement Stock ──
    for (const { doc, quantity } of productDocs) {
      doc.stock -= quantity;
      await doc.save();
    }

    const trackingNumber = 'ENEN-' + Math.floor(100000 + Math.random() * 900000);

    const order = await Order.create({
      userId,
      products,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      orderStatus: 'Processing',
      itemsPrice: itemsPrice || (totalAmount - taxPrice - shippingPrice),
      taxPrice,
      shippingPrice,
      totalAmount,
      trackingNumber
    });

    // Clear user cart upon order placement
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    res.status(201).json({
      success: true,
      message: 'Flame ignited! Order placed successfully.',
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('userId', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, trackingNumber } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.orderStatus;

    // ── Stock Restoration on Cancellation ──
    // If the order is being cancelled and was NOT previously cancelled, restore stock
    if (orderStatus === 'Cancelled' && previousStatus !== 'Cancelled') {
      for (const item of order.products) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity }
          });
        }
      }
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (orderStatus === 'Delivered') order.deliveredAt = new Date();

    await order.save();
    res.json({ success: true, message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
