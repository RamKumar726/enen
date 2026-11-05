const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const { verifyToken, isAdmin } = require('../middleware/auth');
const Order = require('../models/Order');
const orderController = require('../controllers/orderController');
const Cart = require('../models/Cart');

const gateway = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const error = new Error('Razorpay is not configured'); error.status = 503; throw error;
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

router.post('/razorpay-order', verifyToken, async (req, res) => {
  let createdOrderId;
  try {
    const razorpay = gateway();
    const prepared = await orderController.createPendingPaymentOrder(req);
    createdOrderId = prepared.orderId;
    const internalOrder = await Order.findOne({ _id: createdOrderId, userId: req.user.id, paymentStatus: 'Pending' });
    if (!internalOrder) throw Object.assign(new Error('Pending payment order was not found'), { status: 409 });
    const razorOrder = await razorpay.orders.create({ amount: Math.round(internalOrder.totalAmount * 100), currency: 'INR', receipt: `enen_${internalOrder._id}` });
    internalOrder.razorpayOrderId = razorOrder.id;
    await internalOrder.save();
    return res.status(201).json({ success: true, orderId: internalOrder._id, razorpayOrderId: razorOrder.id,
      amount: razorOrder.amount, currency: razorOrder.currency, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    if (createdOrderId) {
      await Order.findByIdAndUpdate(createdOrderId, { paymentStatus: 'Failed', paymentHoldExpiresAt: new Date(0) });
      await orderController.expirePendingPaymentOrders().catch(() => {});
    }
    return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Unable to start payment' });
  }
});

router.post('/razorpay-verify', verifyToken, async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) return res.status(503).json({ success: false, message: 'Razorpay is not configured' });
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!mongoose.isValidObjectId(orderId) || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification details are incomplete' });
    }
    const order = await Order.findOne({ _id: orderId, userId: req.user.id, razorpayOrderId: razorpay_order_id });
    if (!order) return res.status(404).json({ success: false, message: 'Payment order not found' });
    if (order.paymentStatus === 'Paid') return res.json({ success: true, order, message: 'Payment already verified' });
    if (order.paymentStatus !== 'Pending' || order.paymentHoldExpiresAt < new Date()) {
      return res.status(409).json({ success: false, message: 'Payment session expired. Please create a new order.' });
    }

    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest();
    const actual = Buffer.from(razorpay_signature, 'hex');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(expected, actual)) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
    const razorpay = gateway();
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.order_id !== razorpay_order_id || payment.status !== 'captured' || payment.currency !== 'INR' || payment.amount !== Math.round(order.totalAmount * 100)) {
      return res.status(409).json({ success: false, message: 'Payment is not captured for the expected amount' });
    }
    const paidOrder = await Order.findOneAndUpdate({ _id: order._id, userId: req.user.id, paymentStatus: 'Pending',
      orderStatus: 'Processing', paymentHoldExpiresAt: { $gt: new Date() } }, {
      $set: { paymentStatus: 'Paid', paymentId: razorpay_payment_id, razorpayPaymentId: razorpay_payment_id },
      $unset: { paymentHoldExpiresAt: 1 }
    }, { new: true });
    if (!paidOrder) return res.status(409).json({ success: false, message: 'Payment session expired or already completed' });
    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] }).catch(() => {});
    return res.json({ success: true, order: paidOrder, message: 'Payment verified successfully' });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Payment verification failed' });
  }
});

router.post('/refund/:orderId', verifyToken, isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!['Online', 'UPI'].includes(order.paymentMethod) || !['Cancelled', 'Returned'].includes(order.orderStatus) || order.paymentStatus !== 'Refund Pending' || !order.razorpayPaymentId) {
      return res.status(409).json({ success: false, message: 'This order is not eligible for an automatic Razorpay refund' });
    }
    if (order.refundId) return res.json({ success: true, refundId: order.refundId, message: 'Refund already submitted' });
    if (order.refundStatus === 'Processing') return res.status(409).json({ success: false, message: 'Refund is already being processed' });
    const receipt = order.refundReceipt || `ENEN-${order._id.toString()}-R`;
    const claimed = await Order.findOneAndUpdate({ _id: order._id, paymentStatus: 'Refund Pending', refundStatus: { $ne: 'Processing' }, refundId: '' },
      { $set: { refundStatus: 'Processing', refundReceipt: receipt } }, { new: true });
    if (!claimed) return res.status(409).json({ success: false, message: 'Refund state changed. Refresh and retry.' });
    try {
      const refund = await gateway().payments.refund(order.razorpayPaymentId, {
        amount: Math.round(order.refundAmount * 100), receipt, notes: { order_id: order._id.toString() }
      });
      const completed = refund.status === 'processed';
      const updated = await Order.findByIdAndUpdate(order._id, { $set: {
        refundId: refund.id,
        refundStatus: completed ? 'Completed' : 'Processing',
        paymentStatus: completed ? 'Refunded' : 'Refund Pending'
      } }, { new: true });
      return res.json({ success: true, order: updated, message: completed ? 'Refund processed' : 'Refund submitted to Razorpay' });
    } catch (error) {
      await Order.updateOne({ _id: order._id, refundStatus: 'Processing', refundId: '' }, { $set: { refundStatus: 'Initiated' } });
      return res.status(502).json({ success: false, message: 'Razorpay could not accept the refund request; check the dashboard before retrying' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to process refund' });
  }
});

router.post('/webhook', async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ success: false, message: 'Webhook secret is not configured' });
  try {
    const signature = req.headers['x-razorpay-signature'];
    const expected = crypto.createHmac('sha256', secret).update(req.rawBody || Buffer.alloc(0)).digest();
    const actual = Buffer.from(signature || '', 'hex');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(expected, actual)) return res.status(400).json({ error: 'Invalid signature' });
    const event = req.body;
    const payment = event.payload?.payment?.entity;
    if (event.event === 'payment.captured' && payment?.order_id && payment?.id) {
      const order = await Order.findOne({ razorpayOrderId: payment.order_id });
      if (!order) {
        console.error(`[Razorpay webhook] Captured payment references unknown order ${payment.order_id}`);
        return res.status(500).json({ success: false, message: 'Order reconciliation required' });
      }
      if (payment.currency !== 'INR' || !Number.isInteger(payment.amount) || payment.amount <= 0) {
        return res.status(400).json({ success: false, message: 'Captured payment details are invalid' });
      }
      const expectedAmount = Math.round(order.totalAmount * 100);
      const paidOrder = payment.amount === expectedAmount && order.paymentStatus === 'Pending'
        ? await Order.findOneAndUpdate({ _id: order._id, paymentStatus: 'Pending', orderStatus: 'Processing', paymentHoldExpiresAt: { $gt: new Date() } },
          { $set: { paymentStatus: 'Paid', paymentId: payment.id, razorpayPaymentId: payment.id }, $unset: { paymentHoldExpiresAt: 1 } }, { new: true })
        : null;
      if (paidOrder) {
        await Cart.findOneAndUpdate({ userId: paidOrder.userId }, { items: [] }).catch(() => {});
      } else if (!['Paid', 'Refunded'].includes(order.paymentStatus)) {
        // Captured after expiry/cancellation or for the wrong amount: record it for immediate refund review.
        await Order.findOneAndUpdate({ _id: order._id, paymentStatus: { $nin: ['Paid', 'Refunded'] }, razorpayPaymentId: { $in: ['', null] } }, { $set: {
          paymentStatus: 'Refund Pending', refundStatus: 'Initiated', refundAmount: payment.amount / 100,
          razorpayPaymentId: payment.id, paymentId: payment.id
        } });
      }
    } else if (event.event === 'payment.failed' && payment?.order_id) {
      await Order.updateOne({ razorpayOrderId: payment.order_id, paymentStatus: 'Pending' }, { $set: { paymentStatus: 'Failed' } });
    } else if (event.event === 'refund.processed') {
      const refund = event.payload?.refund?.entity;
      if (refund?.id) await Order.updateOne({ $or: [{ refundId: refund.id }, { refundReceipt: refund.receipt }], paymentMethod: { $in: ['Online', 'UPI'] } },
        { $set: { refundId: refund.id, paymentStatus: 'Refunded', refundStatus: 'Completed' } });
    } else if (event.event === 'refund.failed') {
      const refund = event.payload?.refund?.entity;
      if (refund?.id) await Order.updateOne({ $or: [{ refundId: refund.id }, { refundReceipt: refund.receipt }], paymentMethod: { $in: ['Online', 'UPI'] } },
        { $set: { paymentStatus: 'Refund Pending', refundStatus: 'Initiated' }, $unset: { refundId: 1 } });
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

module.exports = router;
