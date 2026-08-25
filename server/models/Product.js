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
  price: { type: Number, required: [true, 'Product price is required'], min: 0 },
  originalPrice: { type: Number, default: 0 },
  stock: { type: Number, required: [true, 'Stock count is required'], default: 100 },
  images: [ImageSchema],
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
  collectionName: { 
    type: String, 
    required: true,
    enum: ['One Piece', 'Demon Slayer', 'Naruto', 'Attack on Titan', 'My Hero Academia'],
    default: 'One Piece'
  },
  animeSeries: { type: String, default: 'General Anime' },
  fabric: { type: String, default: '240 GSM Heavyweight 100% Cotton' },
  printType: { type: String, default: 'High-Density Puff & Screen Print' },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  ratings: [ReviewItemSchema],
  averageRating: { type: Number, default: 4.8 },
  numReviews: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
