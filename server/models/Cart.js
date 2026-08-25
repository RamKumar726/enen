const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1, min: 1 },
  size: { type: String, required: true, enum: ['S', 'M', 'L', 'XL', 'XXL'] },
  color: { type: String, default: 'Black' }
}, { _id: true });

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', CartSchema);
