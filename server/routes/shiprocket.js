const express = require("express");
const router = express.Router();
const axios = require("axios");
const { verifyToken, isAdmin } = require("../middleware/auth");
const Order = require("../models/Order");
const mongoose = require('mongoose');

const SR_BASE = "https://apiv2.shiprocket.in/v1/external";

// ── Cache Shiprocket token (expires ~10 days) ──
let srToken = null;
let srTokenFetchedAt = null;
const SR_TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000; // 9 days

const getSRToken = async () => {
  const now = Date.now();
  if (srToken && srTokenFetchedAt && (now - srTokenFetchedAt) < SR_TOKEN_TTL_MS) {
    return srToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    const error = new Error('Shiprocket credentials are not configured'); error.status = 503; throw error;
  }

  const res = await axios.post(`${SR_BASE}/auth/login`, { email, password }, { timeout: 15000 });
  srToken = res.data.token;
  srTokenFetchedAt = now;
  return srToken;
};

// ─────────────────────────────────────────────────────────────
// POST /api/shiprocket/ship/:orderId
// Creates a Shiprocket shipment for a given ENEN order
// Admin only
// ─────────────────────────────────────────────────────────────
router.post("/ship/:orderId", verifyToken, isAdmin, async (req, res) => {
  let claimedOrderId;
  try {
    if (!mongoose.isValidObjectId(req.params.orderId)) return res.status(404).json({ success: false, message: 'Order not found' });
    const order = await Order.findById(req.params.orderId)
      .populate("userId", "firstName lastName email phone")
      .populate("products.productId", "name hsnCode weightKg");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.paymentMethod !== 'Cash on Delivery' && order.paymentStatus !== 'Paid') {
      return res.status(409).json({ success: false, message: 'Only paid orders can be shipped' });
    }
    if (order.orderStatus !== 'Processing') {
      return res.status(409).json({ success: false, message: 'This order is not eligible for shipment' });
    }

    if (order.shiprocketOrderId) {
      return res.status(400).json({
        success: false,
        message: `Shipment already created. AWB: ${order.trackingNumber}`
      });
    }

    if (order.products.some(item => !item.productId || !/^\d{4,8}$/.test(item.productId.hsnCode || '') || !(item.productId.weightKg > 0))) {
      return res.status(422).json({ success: false, message: 'Set a valid HSN code and unit weight on every product before shipping' });
    }
    if (![order.totalAmount, order.itemsPrice, order.discountAmount, order.shippingPrice, ...order.products.map(item => item.price)].every(Number.isInteger)) {
      return res.status(422).json({ success: false, message: 'Shiprocket accepts whole-rupee amounts. Correct the product and order amounts before shipping.' });
    }
    const dimensions = ['SHIPROCKET_PACKAGE_LENGTH_CM', 'SHIPROCKET_PACKAGE_WIDTH_CM', 'SHIPROCKET_PACKAGE_HEIGHT_CM']
      .map(key => Number(process.env[key]));
    if (dimensions.some(value => !Number.isFinite(value) || value <= 0.5)) {
      return res.status(503).json({ success: false, message: 'Set valid Shiprocket parcel dimensions in the server environment' });
    }
    const token = await getSRToken();
    if (!process.env.SHIPROCKET_PICKUP_LOCATION) {
      const error = new Error('Configure the exact Shiprocket pickup location name'); error.status = 503; throw error;
    }
    const claimed = await Order.findOneAndUpdate({ _id: order._id, shiprocketStatus: 'Not Created', shiprocketOrderId: '', orderStatus: 'Processing' },
      { $set: { shiprocketStatus: 'Creating' } }, { new: true });
    if (!claimed) return res.status(409).json({ success: false, message: 'Shipment creation is already in progress or needs reconciliation' });
    claimedOrderId = order._id;
    const headers = { Authorization: `Bearer ${token}` };

    const addr = order.shippingAddress;
    const customerParts = String(addr.name || '').trim().split(/\s+/);
    const customerName = customerParts.shift() || 'Customer';
    const customerLastName = customerParts.join(' ') || '-';
    const customerEmail = order.userId?.email;
    const phoneDigits = addr.phone.replace(/\D/g, '');
    const customerPhone = phoneDigits.length === 12 && phoneDigits.startsWith('91') ? phoneDigits.slice(2)
      : phoneDigits.length === 11 && phoneDigits.startsWith('0') ? phoneDigits.slice(1) : phoneDigits;
    if (!customerEmail || !customerPhone) {
      await Order.updateOne({ _id: order._id, shiprocketStatus: 'Creating' }, { $set: { shiprocketStatus: 'Not Created' } });
      claimedOrderId = null;
      return res.status(422).json({ success: false, message: 'A valid customer email and phone are required for shipping' });
    }

    // ── 1. Create Shiprocket order ──
    const srOrderPayload = {
      order_id: `ENEN-${order._id.toString().toUpperCase()}`,
      order_date: new Date(order.createdAt).toISOString().split("T")[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,
      billing_customer_name: customerName,
      billing_last_name: customerLastName,
      billing_address: addr.street,
      billing_city: addr.city,
      billing_pincode: Number(addr.pincode),
      billing_state: addr.state,
      billing_country: addr.country || "India",
      billing_email: customerEmail,
      billing_isd_code: '+91',
      billing_phone: Number(customerPhone),
      shipping_is_billing: true,
      order_items: order.products.map(p => ({
        name: p.name,
        sku: `ENEN-${p.size}-${p.productId?._id?.toString().slice(-6) || "000000"}`,
        units: p.quantity,
        selling_price: p.price,
        discount: 0,
        tax: "",
        hsn: Number(p.productId?.hsnCode)
      })),
      payment_method: order.paymentMethod === "Cash on Delivery" ? "COD" : "Prepaid",
      sub_total: order.products.reduce((sum, p) => sum + p.price * p.quantity, 0),
      shipping_charges: order.shippingPrice,
      length: dimensions[0],
      breadth: dimensions[1],
      height: dimensions[2],
      weight: order.products.reduce((sum, p) => sum + p.productId.weightKg * p.quantity, 0)
    };

    const srOrderRes = await axios.post(`${SR_BASE}/orders/create/adhoc`, srOrderPayload, { headers, timeout: 20000 });
    const srOrderId = srOrderRes.data.order_id;
    const shipmentId = srOrderRes.data.shipment_id;

    if (!srOrderId || !shipmentId) {
      await Order.updateOne({ _id: order._id, shiprocketStatus: 'Creating' }, { $set: { shiprocketStatus: 'Needs Reconciliation' } });
      return res.status(502).json({
        success: false,
        message: "Shiprocket did not return an order ID; verify the provider dashboard before retrying"
      });
    }

    // ── 2. Auto-assign best courier ──
    let awbNumber = null;
    try {
      const awbRes = await axios.post(
        `${SR_BASE}/courier/assign/awb`,
        { shipment_id: String(shipmentId) },
        { headers, timeout: 15000 }
      );
      awbNumber = awbRes.data?.response?.data?.awb_code || null;
    } catch (awbErr) {
      console.warn("[Shiprocket] AWB assignment failed:", awbErr.response?.data || awbErr.message);
      // Not fatal — order still created in Shiprocket
    }

    // ── 3. Update ENEN order ──
    const updatedOrder = await Order.findOneAndUpdate({ _id: order._id, shiprocketStatus: 'Creating', orderStatus: 'Processing' }, { $set: {
      shiprocketOrderId: String(srOrderId), shiprocketShipmentId: String(shipmentId), shiprocketStatus: 'Created', orderStatus: 'Shipped',
      ...(awbNumber ? { trackingNumber: awbNumber } : {})
    } }, { new: true });
    if (!updatedOrder) {
      await Order.findByIdAndUpdate(order._id, { $set: { shiprocketOrderId: String(srOrderId), shiprocketShipmentId: String(shipmentId), shiprocketStatus: 'Needs Reconciliation' } });
      return res.status(409).json({ success: false, message: 'Carrier shipment was created but the order changed concurrently. Reconcile this shipment.' });
    }

    return res.json({
      success: true,
      message: awbNumber
        ? `Shipment created! AWB: ${awbNumber}`
        : "Shiprocket order created. AWB assignment pending — check Shiprocket dashboard.",
      shiprocketOrderId: srOrderId,
      awbNumber,
      trackingUrl: awbNumber ? `https://shiprocket.co/tracking/${awbNumber}` : null
    });

  } catch (err) {
    console.error("[Shiprocket] Error:", err.response?.status || err.message);
    if (claimedOrderId) await Order.updateOne({ _id: claimedOrderId, shiprocketStatus: 'Creating' }, { $set: { shiprocketStatus: 'Needs Reconciliation' } }).catch(() => {});
    return res.status(err.status || 502).json({
      success: false, message: claimedOrderId ? 'Shipment request outcome is uncertain. Check Shiprocket before retrying.' : 'Shipment provider request failed'
    });
  }
});

router.post('/resolve/:orderId', verifyToken, isAdmin, async (req, res) => {
  const { resolution, shiprocketOrderId, shiprocketShipmentId, trackingNumber } = req.body;
  try {
    if (!mongoose.isValidObjectId(req.params.orderId)) return res.status(404).json({ success: false, message: 'Order not found' });
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!['Creating', 'Needs Reconciliation'].includes(order.shiprocketStatus)) {
      return res.status(409).json({ success: false, message: 'This shipment does not need reconciliation' });
    }
    if (resolution === 'no_shipment') {
      if (order.shiprocketOrderId || order.shiprocketShipmentId) return res.status(409).json({ success: false, message: 'Carrier IDs already exist; resolve this as an existing shipment' });
      order.shiprocketStatus = 'Not Created';
      await order.save();
      return res.json({ success: true, message: 'Shipment can now be retried after confirming the carrier has no order' });
    }
    if (resolution !== 'shipment_exists' || typeof shiprocketOrderId !== 'string' || !shiprocketOrderId.trim() ||
        typeof shiprocketShipmentId !== 'string' || !/^\d+$/.test(shiprocketShipmentId) ||
        (trackingNumber !== undefined && (typeof trackingNumber !== 'string' || trackingNumber.length > 100))) {
      return res.status(400).json({ success: false, message: 'Provide carrier order and shipment IDs for an existing shipment' });
    }
    order.shiprocketOrderId = shiprocketOrderId.trim();
    order.shiprocketShipmentId = shiprocketShipmentId;
    order.shiprocketStatus = 'Created';
    order.orderStatus = 'Shipped';
    order.trackingNumber = trackingNumber?.trim() || '';
    await order.save();
    return res.json({ success: true, message: 'Carrier shipment linked to the order', order });
  } catch (_) {
    return res.status(500).json({ success: false, message: 'Unable to reconcile shipment' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/shiprocket/track/:awb
// Gets live tracking status from Shiprocket for a given AWB
// ─────────────────────────────────────────────────────────────
router.get("/track/:awb", verifyToken, async (req, res) => {
  try {
    if (!/^[A-Za-z0-9-]{3,100}$/.test(req.params.awb)) return res.status(400).json({ success: false, message: 'Invalid tracking number' });
    const order = await Order.findOne({ trackingNumber: req.params.awb }).select('userId trackingNumber orderStatus');
    if (!order) return res.status(404).json({ success: false, message: 'Tracking number not found' });
    if (String(order.userId) !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied' });
    const token = await getSRToken();
    const trackRes = await axios.get(
      `${SR_BASE}/courier/track/awb/${encodeURIComponent(req.params.awb)}`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 }
    );
    return res.json({ success: true, tracking: trackRes.data });
  } catch (err) {
    return res.status(502).json({ success: false, message: 'Tracking provider request failed' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/shiprocket/pickup/:orderId
// Schedules a pickup request for an already-shipped order
// ─────────────────────────────────────────────────────────────
router.post("/pickup/:orderId", verifyToken, isAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.orderId)) return res.status(404).json({ success: false, message: 'Order not found' });
    const order = await Order.findById(req.params.orderId);
    if (!order || !order.shiprocketShipmentId) {
      return res.status(400).json({ success: false, message: "No Shiprocket shipment found for this order" });
    }

    const token = await getSRToken();
    const pickupRes = await axios.post(
      `${SR_BASE}/courier/generate/pickup`,
      { shipment_id: [Number(order.shiprocketShipmentId)] },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 }
    );

    return res.json({
      success: true,
      message: "Pickup scheduled successfully!",
      data: pickupRes.data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Pickup scheduling failed: " + (err.response?.data?.message || err.message)
    });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/shiprocket/test-connection
// Tests if Shiprocket credentials are valid (admin only)
// ─────────────────────────────────────────────────────────────
router.get("/test-connection", verifyToken, isAdmin, async (req, res) => {
  try {
    srToken = null; // force fresh login
    const token = await getSRToken();
    return res.json({
      success: true,
      message: "✅ Shiprocket connection successful! Credentials are valid.",
      hasToken: !!token
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "❌ Shiprocket connection failed: " + err.message
    });
  }
});

module.exports = router;
