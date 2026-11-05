const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true }
}, { _id: false });

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, default: 'ENEN T-Shirt' }
}, { _id: false });

const ReviewItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true },
  slug: { type: String, lowercase: true, trim: true },
  description: { type: String, required: [true, 'Product description is required'] },
  price: { type: Number, required: [true, 'Product price is required'], min: 1, validate: Number.isInteger },
  originalPrice: { type: Number, default: 0, min: 0, validate: Number.isInteger },
  stock: { type: Number, required: [true, 'Stock count is required'], default: 0, min: 0, validate: Number.isInteger },
  images: { type: [ImageSchema], validate: [items => items.length > 0, 'At least one product image is required'] },
  sizes: { 
    type: [String], 
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    default: ['S', 'M', 'L', 'XL', 'XXL'] 
  },
  colors: [ColorSchema],
  category: { 
    type: String, 
    required: true, 
    enum: ['Sleeveless', 'Regular T-Shirt', 'Sweatshirt', 'Oversized'],
    default: 'Regular T-Shirt'
  },
  collectionName: { type: String, required: true, trim: true, maxlength: 100, default: 'One Piece' },
  animeSeries: { type: String, default: 'General Anime' },
  fabric: { type: String, default: '240 GSM Heavyweight 100% Cotton' },
  printType: { type: String, default: 'High-Density Puff & Screen Print' },
  hsnCode: { type: String, default: '', trim: true, maxlength: 8 },
  weightKg: { type: Number, default: 0, min: 0 },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  ratings: [ReviewItemSchema],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 }
}, {
  timestamps: true
});

ProductSchema.index({ slug: 1 }, { unique: true, sparse: true });
ProductSchema.index({ isActive: 1, createdAt: -1 });
ProductSchema.index({ isActive: 1, collectionName: 1, createdAt: -1 });
ProductSchema.index({ isActive: 1, category: 1, createdAt: -1 });

ProductSchema.pre('validate', function() {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120);
  }
});

module.exports = mongoose.model('Product', ProductSchema);
