const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String, required: true, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
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
    enum: ['Online', 'UPI', 'Cash on Delivery'],
    default: 'Online'
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Failed', 'Refund Pending', 'Refunded'], 
    default: 'Pending' 
  },
  paymentId: { type: String, default: '' },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  paymentHoldExpiresAt: { type: Date, default: undefined },
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
    enum: ['None', 'Initiated', 'Processing', 'Completed', 'N/A'],
    default: 'None' 
  },
  refundAmount: { type: Number, default: 0 },
  refundId: { type: String, default: '' },
  refundReceipt: { type: String, default: '' },
  itemsPrice: { type: Number, required: true, default: 0 },
  discountAmount: { type: Number, default: 0 },
  promoCode: { type: String, default: '' },
  taxPrice: { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true },
  trackingNumber: { type: String, default: '' },
  shiprocketOrderId: { type: String, default: '' },
  shiprocketShipmentId: { type: String, default: '' },
  shiprocketStatus: { type: String, enum: ['Not Created', 'Creating', 'Created', 'Needs Reconciliation'], default: 'Not Created' },
  carrierStatus: { type: String, default: '' },
  carrierUpdatedAt: { type: Date, default: undefined },
  deliveredAt: { type: Date }
}, {
  timestamps: true
});

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, paymentHoldExpiresAt: 1 });
OrderSchema.index({ trackingNumber: 1 }, { sparse: true });

module.exports = mongoose.model('Order', OrderSchema);
