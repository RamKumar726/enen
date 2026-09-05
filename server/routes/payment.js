const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { verifyToken } = require('../middleware/auth');
const Order = require('../models/Order');

let razorpayInstance;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
} catch (e) {
  console.warn('[Razorpay] Init notice:', e.message);
}

// ────────────────────────────────────────────
// POST /api/payment/razorpay-order
// Creates a Razorpay order — client calls this to get orderId for checkout
// ────────────────────────────────────────────
router.post('/razorpay-order', verifyToken, async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // convert to paise
      currency,
      receipt: 'receipt_' + Date.now(),
      payment_capture: 1
    };

    if (razorpayInstance) {
      const order = await razorpayInstance.orders.create(options);
      return res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      });
    }

    // Only allow mock in non-production
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ success: false, message: 'Payment gateway not configured. Contact support.' });
    }

    const mockOrderId = 'order_rzp_mock_' + Date.now();
    res.json({
      success: true,
      orderId: mockOrderId,
      amount: options.amount,
      currency: options.currency,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
      isMock: true
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ────────────────────────────────────────────
// POST /api/payment/razorpay-verify
// Verifies Razorpay HMAC signature after payment
// ────────────────────────────────────────────
router.post('/razorpay-verify', verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      // Allow simulation only in dev/test
      if (process.env.NODE_ENV !== 'production') {
        return res.json({ success: true, message: 'Test simulation verified!', paymentId: 'pay_sim_' + Date.now() });
      }
      return res.status(400).json({ success: false, message: 'Missing payment verification parameters' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Payment gateway not configured' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature. Payment not verified.' });
    }

    return res.json({
      success: true,
      message: 'Payment verified successfully!',
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ────────────────────────────────────────────
// POST /api/payment/webhook
// Razorpay calls this server-side after payment events
// Set this URL in your Razorpay Dashboard → Webhooks
// ────────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(200).json({ received: true }); // Acknowledge without processing
    }

    const signature = req.headers['x-razorpay-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('[Razorpay Webhook] Invalid signature received');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(req.body);
    const eventType = event.event;

    if (eventType === 'payment.captured') {
      const paymentId = event.payload.payment.entity.id;
      const razorpayOrderId = event.payload.payment.entity.order_id;

      // Find the order by razorpayOrderId and mark as paid
      if (razorpayOrderId) {
        await Order.findOneAndUpdate(
          { razorpayOrderId },
          { paymentStatus: 'Paid', razorpayPaymentId: paymentId }
        );
        console.log(`[Razorpay Webhook] Payment captured: ${paymentId} for order: ${razorpayOrderId}`);
      }
    }

    if (eventType === 'payment.failed') {
      const razorpayOrderId = event.payload.payment.entity.order_id;
      if (razorpayOrderId) {
        await Order.findOneAndUpdate(
          { razorpayOrderId },
          { paymentStatus: 'Failed' }
        );
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Razorpay Webhook] Error:', error.message);
    res.status(200).json({ received: true }); // Always acknowledge to prevent retries
  }
});

module.exports = router;
