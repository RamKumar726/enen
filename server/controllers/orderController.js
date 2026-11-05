const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const inventoryTransactionsEnabled = () => process.env.NODE_ENV === 'production' || process.env.MONGO_TRANSACTIONS === 'true';
const withInventoryTransaction = async work => {
  if (!inventoryTransactionsEnabled()) return work(null);
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => { result = await work(session); });
    return result;
  } finally { await session.endSession(); }
};

const validateAddress = (address) => address && ['name', 'phone', 'street', 'city', 'state', 'pincode'].every(key =>
  typeof address[key] === 'string' && address[key].trim().length > 0 && address[key].length <= 200
) && /^\d{6}$/.test(address.pincode) && (address.country === undefined || address.country === 'India') &&
  /^\+?[\d\s()-]+$/.test(address.phone) && (() => { const digits = address.phone.replace(/\D/g, ''); return digits.length === 10 || (digits.length === 12 && digits.startsWith('91')) || (digits.length === 11 && digits.startsWith('0')); })();

const prepareOrder = async ({ userId, products, shippingAddress, billingAddress, paymentMethod, promoCode, session }) => {
  if (!Array.isArray(products) || products.length < 1 || products.length > 50) {
    const error = new Error('Order must contain between 1 and 50 items'); error.status = 400; throw error;
  }
  if (!validateAddress(shippingAddress)) { const error = new Error('Complete shipping address is required'); error.status = 400; throw error; }
  if (billingAddress && !validateAddress(billingAddress)) { const error = new Error('Billing address is invalid'); error.status = 400; throw error; }
  if (!['Online', 'UPI', 'Cash on Delivery'].includes(paymentMethod)) { const error = new Error('Unsupported payment method'); error.status = 400; throw error; }

  const normalized = new Map();
  for (const item of products) {
    if (!item || typeof item !== 'object') { const error = new Error('Invalid order item'); error.status = 400; throw error; }
    const id = String(item.productId || '');
    if (!mongoose.isValidObjectId(id) || !Number.isSafeInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 20) {
      const error = new Error('Invalid product or quantity'); error.status = 400; throw error;
    }
    const key = `${id}:${item.size || ''}:${item.color || ''}`;
    const prior = normalized.get(key);
    normalized.set(key, { productId: id, size: item.size || '', color: item.color || '', quantity: Number(item.quantity) + (prior?.quantity || 0) });
    if (normalized.get(key).quantity > 20) { const error = new Error('Maximum quantity per variant is 20'); error.status = 400; throw error; }
  }
  const grouped = new Map();
  for (const item of normalized.values()) grouped.set(item.productId, (grouped.get(item.productId) || 0) + item.quantity);

  const docs = new Map();
  for (const id of grouped.keys()) {
    const product = await Product.findOne({ _id: id, isActive: true }).session(session || null);
    if (!product) { const error = new Error('A product is unavailable'); error.status = 400; throw error; }
    docs.set(id, product);
  }
  const verifiedProducts = [...normalized.values()].map(item => {
    const product = docs.get(item.productId);
    if (!product.sizes?.length || !product.colors?.length) { const error = new Error(`${product.name} is missing size or color options`); error.status = 400; throw error; }
    item.size = item.size || product.sizes[0];
    item.color = item.color || product.colors[0]?.name;
    if (!product.sizes.includes(item.size) || !product.colors.some(c => c.name === item.color)) {
      const error = new Error(`${product.name} does not offer the selected size or color`); error.status = 400; throw error;
    }
    return { ...item, name: product.name, image: product.images?.[0]?.url || 'https://placehold.co/600x800?text=ENEN', price: product.price };
  });
  const itemsPrice = Math.round(verifiedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
  const normalizedPromoCode = String(promoCode || '').trim().toUpperCase();
  const promoRates = { BLAZE10: 10, ANIME20: 20 };
  if (normalizedPromoCode && !promoRates[normalizedPromoCode]) { const error = new Error('Promo code is invalid'); error.status = 400; throw error; }
  const discountPercent = promoRates[normalizedPromoCode] || 0;
  let netItemsPrice = 0;
  let taxPrice = 0;
  for (const item of verifiedProducts) {
    const netUnitPrice = Math.round(item.price * (1 - discountPercent / 100));
    const lineNet = netUnitPrice * item.quantity;
    netItemsPrice += lineNet;
    const gstRate = netUnitPrice <= 1000 ? 0.05 : 0.12;
    taxPrice += lineNet - lineNet / (1 + gstRate); // GST is included in the displayed selling price.
    item.price = netUnitPrice;
  }
  netItemsPrice = Math.round(netItemsPrice * 100) / 100;
  taxPrice = Math.round(taxPrice * 100) / 100;
  const discountAmount = Math.round((itemsPrice - netItemsPrice) * 100) / 100;
  const shippingPrice = netItemsPrice >= 999 ? 0 : 99;
  return { userId, products: verifiedProducts, shippingAddress: { ...shippingAddress, country: 'India' }, billingAddress: billingAddress ? { ...billingAddress, country: 'India' } : { ...shippingAddress, country: 'India' },
    paymentMethod, paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Pending', orderStatus: 'Processing',
    itemsPrice, discountAmount, promoCode: normalizedPromoCode, taxPrice, shippingPrice, totalAmount: Math.round((netItemsPrice + shippingPrice) * 100) / 100,
    trackingNumber: '', grouped };
};

const reserveInventory = async (grouped, session) => {
  const reserved = [];
  for (const [id, quantity] of grouped) {
    const product = await Product.findOneAndUpdate({ _id: id, isActive: true, stock: { $gte: quantity } }, { $inc: { stock: -quantity } }, { new: true, session: session || undefined });
    if (!product) {
      if (!session) for (const entry of reserved) await Product.updateOne({ _id: entry.id }, { $inc: { stock: entry.quantity } });
      const error = new Error('Stock changed during checkout. Please review your cart.'); error.status = 409; throw error;
    }
    reserved.push({ id, quantity });
  }
  return reserved;
};

exports.expirePendingPaymentOrders = async () => {
  const expired = await Order.find({ paymentStatus: { $in: ['Pending', 'Failed'] }, orderStatus: 'Processing',
    paymentMethod: { $in: ['Online', 'UPI'] }, paymentHoldExpiresAt: { $lte: new Date() } }).select('_id');
  for (const candidate of expired) {
    await withInventoryTransaction(async session => {
      const order = await Order.findOne({ _id: candidate._id, paymentStatus: { $in: ['Pending', 'Failed'] }, orderStatus: 'Processing',
        paymentMethod: { $in: ['Online', 'UPI'] }, paymentHoldExpiresAt: { $lte: new Date() } }).select('_id products').session(session || null);
      if (!order) return;
      const result = await Order.updateOne({ _id: order._id, paymentStatus: { $in: ['Pending', 'Failed'] }, orderStatus: 'Processing',
        paymentHoldExpiresAt: { $lte: new Date() } }, { $set: { orderStatus: 'Cancelled', cancelReason: 'Payment session expired' }, $unset: { paymentHoldExpiresAt: 1 } }, { session: session || undefined });
      if (!result.modifiedCount) return;
      const quantities = new Map();
      for (const item of order.products) quantities.set(String(item.productId), (quantities.get(String(item.productId)) || 0) + item.quantity);
      for (const [id, quantity] of quantities) await Product.updateOne({ _id: id }, { $inc: { stock: quantity } }, { session: session || undefined });
    });
  }
};

exports.createPendingPaymentOrder = async (req) => {
  let reserved = [];
  const session = inventoryTransactionsEnabled() ? await mongoose.startSession() : null;
  try {
    let order;
    const create = async transaction => {
      const prepared = await prepareOrder({ ...req.body, userId: req.user.id, paymentMethod: 'Online', session: transaction });
      reserved = await reserveInventory(prepared.grouped, transaction);
      const { grouped, ...orderData } = prepared;
      const docs = transaction
        ? await Order.create([{ ...orderData, paymentHoldExpiresAt: new Date(Date.now() + 15 * 60 * 1000) }], { session: transaction })
        : [await Order.create({ ...orderData, paymentHoldExpiresAt: new Date(Date.now() + 15 * 60 * 1000) })];
      order = docs[0];
    };
    if (session) await session.withTransaction(() => create(session));
    else await create(null);
    return { orderId: order._id, amount: order.totalAmount };
  } catch (error) {
    if (!session) for (const entry of reserved) await Product.updateOne({ _id: entry.id }, { $inc: { stock: entry.quantity } }).catch(() => {});
    throw error;
  } finally {
    if (session) await session.endSession();
  }
};

exports.createOrder = async (req, res) => {
  let session;
  let reserved = [];
  try {
    if (req.body.paymentMethod !== 'Cash on Delivery') return res.status(400).json({ success: false, message: 'Online orders must use the payment checkout flow' });
    let order;
    session = inventoryTransactionsEnabled() ? await mongoose.startSession() : null;
    const create = async transaction => {
      const prepared = await prepareOrder({ ...req.body, userId: req.user.id, paymentMethod: 'Cash on Delivery', session: transaction });
      reserved = await reserveInventory(prepared.grouped, transaction);
      const { grouped, ...orderData } = prepared;
      const docs = transaction ? await Order.create([orderData], { session: transaction }) : [await Order.create(orderData)];
      order = docs[0];
    };
    if (session) await session.withTransaction(() => create(session));
    else await create(null);
    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Flame ignited! Order placed successfully.',
      order
    });
  } catch (error) {
    if (!session) for (const entry of reserved) await Product.updateOne({ _id: entry.id }, { $inc: { stock: entry.quantity } }).catch(() => {});
    res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Request could not be completed' });
  } finally {
    if (session) await session.endSession();
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.min(10000, Math.max(1, Number.parseInt(req.query.page, 10) || 1));
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const [orders, totalOrders] = await Promise.all([
      Order.find({ userId }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Order.countDocuments({ userId })
    ]);
    res.json({ success: true, orders, page, pages: Math.ceil(totalOrders / limit) || 1, totalOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'Order not found' });
    const filter = req.user.role === 'admin' ? { _id: id } : { _id: id, userId: req.user.id };
    const order = await Order.findOne(filter);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'Order not found' });
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
    if (order.shiprocketStatus === 'Creating') return res.status(409).json({ success: false, message: 'Shipment creation is in progress; retry after it finishes' });

    const updated = await withInventoryTransaction(async session => {
      const wasPaid = order.paymentStatus === 'Paid';
      const cancelled = await Order.findOneAndUpdate({ _id: id, orderStatus: 'Processing', paymentStatus: order.paymentStatus, shiprocketStatus: { $ne: 'Creating' } }, { $set: {
        orderStatus: 'Cancelled', cancelReason: typeof reason === 'string' ? reason.slice(0, 500) : 'Customer requested cancellation',
        paymentStatus: wasPaid ? 'Refund Pending' : 'Failed',
        refundStatus: wasPaid ? 'Initiated' : 'N/A', refundAmount: wasPaid ? order.totalAmount : 0
      }, $unset: { paymentHoldExpiresAt: 1 } }, { new: true, session: session || undefined });
      if (cancelled) {
        const quantities = new Map();
        for (const item of order.products) quantities.set(String(item.productId), (quantities.get(String(item.productId)) || 0) + item.quantity);
        for (const [productId, quantity] of quantities) await Product.updateOne({ _id: productId }, { $inc: { stock: quantity } }, { session: session || undefined });
      }
      return cancelled;
    });
    if (!updated) return res.status(409).json({ success: false, message: 'Order status changed. Refresh and try again.' });

    res.json({
      success: true,
      message: 'Order cancelled successfully. Product stock restored.',
      order: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};

exports.requestReturn = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'Order not found' });
    const { reason, customerUpiForRefund } = req.body;
    const userId = req.user.id;

    if (typeof reason !== 'string' || reason.trim().length < 5 || reason.length > 1000) {
      return res.status(400).json({ success: false, message: 'Return reason must be between 5 and 1,000 characters' });
    }
    if (customerUpiForRefund !== undefined && (typeof customerUpiForRefund !== 'string' || customerUpiForRefund.length > 100 ||
        !/^[\w.-]{2,64}@[\w.-]{2,64}$/.test(customerUpiForRefund.trim()))) {
      return res.status(400).json({ success: false, message: 'Provide a valid UPI ID for refunds' });
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
    if (order.paymentMethod === 'Cash on Delivery' && order.paymentStatus === 'Pending') order.paymentStatus = 'Paid';
    order.returnReason = reason.trim();
    if (customerUpiForRefund) order.customerUpiForRefund = customerUpiForRefund.trim();
    order.refundStatus = 'Initiated';

    await order.save();

    res.json({
      success: true,
      message: 'Return request submitted successfully. Support team will review shortly.',
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'Order not found' });
    const { orderStatus, paymentStatus, trackingNumber } = req.body;

    const allowedOrderStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'];
    const allowedPaymentStatuses = ['Pending', 'Paid', 'Failed', 'Refund Pending', 'Refunded'];
    if (orderStatus && !allowedOrderStatuses.includes(orderStatus)) return res.status(400).json({ success: false, message: 'Invalid order status' });
    if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus)) return res.status(400).json({ success: false, message: 'Invalid payment status' });
    if (trackingNumber !== undefined && (typeof trackingNumber !== 'string' || (trackingNumber && !/^[A-Za-z0-9-]{3,100}$/.test(trackingNumber)))) return res.status(400).json({ success: false, message: 'Invalid tracking number' });

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.orderStatus;
    if (orderStatus && order.shiprocketStatus === 'Creating') {
      return res.status(409).json({ success: false, message: 'Shipment creation is in progress. Reconcile with the carrier first.' });
    }
    if (paymentStatus === 'Paid' && ['Online', 'UPI'].includes(order.paymentMethod) && order.paymentStatus !== 'Paid') {
      return res.status(400).json({ success: false, message: 'Online payments can only be confirmed by Razorpay verification' });
    }
    if (paymentStatus === 'Refunded' && ['Online', 'UPI'].includes(order.paymentMethod) && order.paymentStatus !== 'Refunded') {
      return res.status(400).json({ success: false, message: 'Use the Razorpay refund action to confirm online refunds' });
    }
    if (paymentStatus === 'Refunded' && order.paymentMethod === 'Cash on Delivery' &&
        (!['Cancelled', 'Returned'].includes(order.orderStatus) || order.paymentStatus !== 'Refund Pending')) {
      return res.status(409).json({ success: false, message: 'COD refunds can be recorded only after cancellation or an accepted return' });
    }
    const transitions = {
      Processing: ['Shipped', 'Cancelled'],
      Shipped: ['Delivered'],
      Delivered: ['Return Requested'],
      'Return Requested': ['Delivered', 'Returned'],
      Cancelled: [],
      Returned: []
    };
    if (orderStatus && orderStatus !== previousStatus && !transitions[previousStatus]?.includes(orderStatus)) {
      return res.status(409).json({ success: false, message: `Order cannot move from ${previousStatus} to ${orderStatus}` });
    }
    const restoreStock = orderStatus === 'Cancelled' && previousStatus !== 'Cancelled';
    const updates = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;
    if (orderStatus === 'Delivered') updates.deliveredAt = new Date();
    if (orderStatus === 'Delivered' && order.paymentMethod === 'Cash on Delivery' && order.paymentStatus === 'Pending') {
      updates.paymentStatus = 'Paid';
    }
    if (['Cancelled', 'Returned'].includes(orderStatus) && order.paymentStatus === 'Paid' && order.paymentStatus !== 'Refunded') {
      updates.paymentStatus = 'Refund Pending'; updates.refundStatus = 'Initiated'; updates.refundAmount = order.totalAmount;
    }
    if (paymentStatus === 'Refunded') { updates.refundStatus = 'Completed'; updates.refundAmount = order.totalAmount; }
    const updateOperation = { $set: updates };
    if (orderStatus === 'Cancelled' || orderStatus === 'Returned') updateOperation.$unset = { paymentHoldExpiresAt: 1 };
    const updateFilter = { _id: id, orderStatus: previousStatus };
    if (orderStatus) updateFilter.shiprocketStatus = { $ne: 'Creating' };
    const updated = await withInventoryTransaction(async session => {
      const savedOrder = await Order.findOneAndUpdate(updateFilter, updateOperation, { new: true, runValidators: true, session: session || undefined });
      if (savedOrder && restoreStock) {
        const quantities = new Map();
        for (const item of order.products) quantities.set(String(item.productId), (quantities.get(String(item.productId)) || 0) + item.quantity);
        for (const [productId, quantity] of quantities) await Product.updateOne({ _id: productId }, { $inc: { stock: quantity } }, { session: session || undefined });
      }
      return savedOrder;
    });
    if (!updated) return res.status(409).json({ success: false, message: 'Order status changed. Refresh and try again.' });
    res.json({ success: true, message: 'Order status updated successfully', order: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};
