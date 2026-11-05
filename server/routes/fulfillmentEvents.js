const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Order = require('../models/Order');

router.post('/', async (req, res) => {
  const configured = process.env.SHIPROCKET_WEBHOOK_TOKEN;
  const supplied = req.get('x-api-key') || '';
  if (!configured) return res.status(503).json({ success: false, message: 'Fulfillment webhook is not configured' });
  const expectedBuffer = Buffer.from(configured);
  const suppliedBuffer = Buffer.from(supplied);
  if (expectedBuffer.length !== suppliedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)) {
    return res.status(401).json({ success: false, message: 'Invalid webhook token' });
  }

  const awb = req.body?.awb || req.body?.awb_code;
  const statusValue = req.body?.current_status || req.body?.shipment_status;
  if (typeof awb !== 'string' || !/^[A-Za-z0-9-]{3,100}$/.test(awb) || typeof statusValue !== 'string' || !statusValue.trim() || statusValue.length > 100) {
    return res.status(400).json({ success: false, message: 'A valid tracking number and shipment status are required' });
  }
  const status = statusValue.trim().toUpperCase();

  const update = { carrierStatus: status, carrierUpdatedAt: new Date() };
  if (['DELIVERED', 'DELIVERED TO CONSIGNEE'].includes(status)) {
    update.orderStatus = 'Delivered';
    update.deliveredAt = new Date();
  } else if (['PICKED UP', 'IN TRANSIT', 'OUT FOR DELIVERY', 'REACHED AT DESTINATION HUB', 'SHIPPED'].includes(status)) {
    update.orderStatus = 'Shipped';
  }
  try {
    const order = await Order.findOne({ trackingNumber: awb, shiprocketShipmentId: { $ne: '' } });
    if (!order) return res.status(404).json({ success: false, message: 'Shipment not found' });
    if (['Cancelled', 'Returned'].includes(order.orderStatus) || (update.orderStatus === 'Shipped' && order.orderStatus === 'Delivered')) {
      return res.status(200).json({ received: true, ignored: true });
    }
    if (update.orderStatus === 'Delivered' && order.paymentMethod === 'Cash on Delivery' && order.paymentStatus === 'Pending') update.paymentStatus = 'Paid';
    await Order.updateOne({ _id: order._id, orderStatus: order.orderStatus }, { $set: update });
    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Fulfillment event processing failed' });
  }
});

module.exports = router;
