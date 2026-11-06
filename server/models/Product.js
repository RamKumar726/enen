const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 40 },
  code: { type: String, required: true, match: /^#[0-9a-f]{6}$/i }
}, { _id: false });

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true, maxlength: 2048, match: /^https:\/\//i },
  alt: { type: String, default: 'ENEN T-Shirt', maxlength: 160 }
}, { _id: false });

const ReviewItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 160 },
  slug: { type: String, lowercase: true, trim: true, maxlength: 120, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  description: { type: String, required: [true, 'Product description is required'], trim: true, maxlength: 5000 },
  price: { type: Number, required: [true, 'Product price is required'], min: 1, max: 10000000, validate: Number.isInteger },
  amazonUrl: { type: String, trim: true, default: '', required: [function() { return this.isActive; }, 'Amazon product URL is required for active products'], validate: { validator: value => !value || /^https:\/\/(?:(?:www\.)?amazon\.in\/(?:[^/?#]+\/)?(?:dp\/|gp\/product\/)[A-Z0-9]{10}(?:[/?#].*)?|amzn\.in\/d\/[A-Z0-9]+(?:[/?#].*)?)$/i.test(value), message: 'Enter a valid Amazon.in product URL' } },
  originalPrice: { type: Number, default: 0, min: 0, max: 10000000, validate: Number.isInteger },
  stock: { type: Number, required: [true, 'Stock count is required'], default: 0, min: 0, max: 10000000, validate: Number.isInteger },
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
  animeSeries: { type: String, default: 'General Anime', trim: true, maxlength: 100 },
  fabric: { type: String, default: '240 GSM Heavyweight 100% Cotton', trim: true, maxlength: 160 },
  printType: { type: String, default: 'High-Density Puff & Screen Print', trim: true, maxlength: 160 },
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
