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
      shippingPrice = 0
    } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Valid shipping address is required' });
    }

    // ── Server-Side Price Verification ──
    // Fetch real prices from DB — NEVER trust client-provided prices
    const stockErrors = [];
    const productDocs = [];
    const verifiedProducts = [];
    let calculatedItemsPrice = 0;

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

      // Use DB price — ignore whatever price the client sent
      const unitPrice = product.price;
      calculatedItemsPrice += unitPrice * item.quantity;

      verifiedProducts.push({
        productId: item.productId,
        name: product.name,
        image: item.image || product.images?.[0]?.url || '',
        price: unitPrice, // server-verified price
        quantity: item.quantity,
        size: item.size || 'M',
        color: item.color || 'Black'
      });

      productDocs.push({ doc: product, quantity: item.quantity });
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock: ' + stockErrors.join('; ')
      });
    }

    // ── Calculate totals server-side ──
    const GST_RATE = 0.05; // 5% GST
    const FREE_SHIPPING_THRESHOLD = 999;
    const SHIPPING_FEE = 99;
    const finalShippingPrice = calculatedItemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const taxPrice = Math.round(calculatedItemsPrice * GST_RATE * 100) / 100;
    const totalAmount = Math.round((calculatedItemsPrice + taxPrice + finalShippingPrice) * 100) / 100;

    // ── Decrement Stock ──
    for (const { doc, quantity } of productDocs) {
      doc.stock -= quantity;
      await doc.save();
    }

    const trackingNumber = 'ENEN-' + Math.floor(100000 + Math.random() * 900000);

    const order = await Order.create({
      userId,
      products: verifiedProducts,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      orderStatus: 'Processing',
      itemsPrice: calculatedItemsPrice,
      taxPrice,
      shippingPrice: finalShippingPrice,
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

exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Customer requested cancellation' } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership or admin permission
    if (order.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this order' });
    }

    if (order.orderStatus !== 'Processing') {
      return res.status(400).json({ 
        success: false, 
        message: `Order cannot be cancelled because it is already ${order.orderStatus.toLowerCase()}` 
      });
    }

    // ── Restore Product Stock ──
    for (const item of order.products) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        });
      }
    }

    order.orderStatus = 'Cancelled';
    order.cancelReason = reason;

    // ── Payment Refund Handling ──
    if (order.paymentStatus === 'Paid') {
      order.paymentStatus = 'Refund Pending';
      order.refundStatus = 'Initiated';
      order.refundAmount = order.totalAmount;
    } else {
      order.paymentStatus = 'Failed';
      order.refundStatus = 'N/A';
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully. Product stock restored.',
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.requestReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, customerUpiForRefund } = req.body;
    const userId = req.user.id;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Return reason is required' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only delivered orders can be submitted for return' 
      });
    }

    order.orderStatus = 'Return Requested';
    order.returnReason = reason;
    if (customerUpiForRefund) order.customerUpiForRefund = customerUpiForRefund;
    order.refundStatus = 'Initiated';
    order.refundAmount = order.totalAmount;

    await order.save();

    res.json({
      success: true,
      message: 'Return request submitted successfully. Support team will review shortly.',
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, trackingNumber, refundStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.orderStatus;

    // ── Stock Restoration on Cancellation or Return approval ──
    if ((orderStatus === 'Cancelled' || orderStatus === 'Returned') && 
        previousStatus !== 'Cancelled' && previousStatus !== 'Returned') {
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
    if (refundStatus) order.refundStatus = refundStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (orderStatus === 'Delivered') order.deliveredAt = new Date();

    // Auto-update refundStatus if paymentStatus is set to Refunded
    if (paymentStatus === 'Refunded') {
      order.refundStatus = 'Completed';
      order.refundAmount = order.totalAmount;
    }

    await order.save();
    res.json({ success: true, message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
