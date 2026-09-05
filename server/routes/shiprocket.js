const express = require("express");
const router = express.Router();
const axios = require("axios");
const { verifyToken, isAdmin } = require("../middleware/auth");
const Order = require("../models/Order");

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
    throw new Error("Shiprocket credentials not configured. Add SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD to .env");
  }

  const res = await axios.post(`${SR_BASE}/auth/login`, { email, password });
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
  try {
    const order = await Order.findById(req.params.orderId).populate("userId", "firstName lastName email phone");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.shiprocketOrderId) {
      return res.status(400).json({
        success: false,
        message: `Shipment already created. AWB: ${order.trackingNumber}`
      });
    }

    const token = await getSRToken();
    const headers = { Authorization: `Bearer ${token}` };

    const addr = order.shippingAddress;
    const customerName = order.userId
      ? `${order.userId.firstName} ${order.userId.lastName}`
      : addr.name || "Customer";
    const customerEmail = order.userId?.email || "customer@enen.com";
    const customerPhone = addr.phone || order.userId?.phone || "9999999999";

    // ── 1. Create Shiprocket order ──
    const srOrderPayload = {
      order_id: `ENEN-${order._id.toString().slice(-8).toUpperCase()}`,
      order_date: new Date(order.createdAt).toISOString().split("T")[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
      billing_customer_name: customerName,
      billing_last_name: "",
      billing_address: addr.street,
      billing_city: addr.city,
      billing_pincode: addr.pincode,
      billing_state: addr.state,
      billing_country: addr.country || "India",
      billing_email: customerEmail,
      billing_phone: customerPhone,
      shipping_is_billing: true,
      order_items: order.products.map(p => ({
        name: p.name,
        sku: `ENEN-${p.size}-${p.productId?.toString().slice(-6) || "000000"}`,
        units: p.quantity,
        selling_price: p.price,
        discount: 0,
        tax: "",
        hsn: 6109 // HSN code for T-shirts
      })),
      payment_method: order.paymentMethod === "Cash on Delivery" ? "COD" : "Prepaid",
      sub_total: order.itemsPrice || order.totalAmount,
      length: 28,
      breadth: 22,
      height: 3,
      weight: 0.4 * order.products.reduce((s, p) => s + p.quantity, 0)
    };

    const srOrderRes = await axios.post(`${SR_BASE}/orders/create/adhoc`, srOrderPayload, { headers });
    const srOrderId = srOrderRes.data.order_id;
    const shipmentId = srOrderRes.data.shipment_id;

    if (!srOrderId) {
      return res.status(500).json({
        success: false,
        message: "Shiprocket order creation failed",
        detail: srOrderRes.data
      });
    }

    // ── 2. Auto-assign best courier ──
    let awbNumber = null;
    try {
      const awbRes = await axios.post(
        `${SR_BASE}/courier/assign/awb`,
        { shipment_id: String(shipmentId) },
        { headers }
      );
      awbNumber = awbRes.data?.response?.data?.awb_code || null;
    } catch (awbErr) {
      console.warn("[Shiprocket] AWB assignment failed:", awbErr.response?.data || awbErr.message);
      // Not fatal — order still created in Shiprocket
    }

    // ── 3. Update ENEN order ──
    order.shiprocketOrderId = String(srOrderId);
    order.shiprocketShipmentId = String(shipmentId);
    order.orderStatus = "Shipped";
    if (awbNumber) {
      order.trackingNumber = awbNumber;
    }
    await order.save();

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
    const detail = err.response?.data || err.message;
    console.error("[Shiprocket] Error:", detail);
    return res.status(500).json({
      success: false,
      message: "Shiprocket API error: " + (err.response?.data?.message || err.message),
      detail
    });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/shiprocket/track/:awb
// Gets live tracking status from Shiprocket for a given AWB
// ─────────────────────────────────────────────────────────────
router.get("/track/:awb", verifyToken, async (req, res) => {
  try {
    const token = await getSRToken();
    const trackRes = await axios.get(
      `${SR_BASE}/courier/track/awb/${req.params.awb}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.json({ success: true, tracking: trackRes.data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Tracking fetch failed: " + (err.response?.data?.message || err.message)
    });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/shiprocket/pickup/:orderId
// Schedules a pickup request for an already-shipped order
// ─────────────────────────────────────────────────────────────
router.post("/pickup/:orderId", verifyToken, isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order || !order.shiprocketShipmentId) {
      return res.status(400).json({ success: false, message: "No Shiprocket shipment found for this order" });
    }

    const token = await getSRToken();
    const pickupRes = await axios.post(
      `${SR_BASE}/courier/generate/pickup`,
      { shipment_id: [Number(order.shiprocketShipmentId)] },
      { headers: { Authorization: `Bearer ${token}` } }
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
