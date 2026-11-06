const mongoose = require('mongoose');

const CarouselSchema = new mongoose.Schema({
  imageUrl: { type: String, required: [true, 'Banner image URL is required'], maxlength: 2048 },
  title: { type: String, required: [true, 'Banner title is required'], trim: true, maxlength: 160 },
  description: { type: String, default: '', maxlength: 1000 },
  discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
  ctaText: { type: String, default: 'Shop Now', trim: true, maxlength: 60 },
  ctaLink: { type: String, default: '/shop', maxlength: 2048 },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 1, min: 1, max: 10000 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Carousel', CarouselSchema);
