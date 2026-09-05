const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String, required: true, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
  color: { type: String, default: 'Black' }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [OrderItemSchema],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  billingAddress: {
    name: { type: String },
    phone: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: 'India' }
  },
  paymentMethod: { 
    type: String, 
    enum: ['UPI', 'Cash on Delivery'], 
    default: 'UPI' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Failed', 'Refund Pending', 'Refunded'], 
    default: 'Pending' 
  },
  paymentId: { type: String, default: '' },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  orderStatus: { 
    type: String, 
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'], 
    default: 'Processing' 
  },
  cancelReason: { type: String, default: '' },
  returnReason: { type: String, default: '' },
  customerUpiForRefund: { type: String, default: '' },
  refundStatus: { 
    type: String, 
    enum: ['None', 'Initiated', 'Completed', 'N/A'], 
    default: 'None' 
  },
  refundAmount: { type: Number, default: 0 },
  refundId: { type: String, default: '' },
  itemsPrice: { type: Number, required: true, default: 0 },
  taxPrice: { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true },
  trackingNumber: { type: String, default: '' },
  shiprocketOrderId: { type: String, default: '' },
  shiprocketShipmentId: { type: String, default: '' },
  deliveredAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
