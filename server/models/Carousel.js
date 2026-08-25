const mongoose = require('mongoose');

const CarouselSchema = new mongoose.Schema({
  imageUrl: { type: String, required: [true, 'Banner image URL is required'] },
  title: { type: String, required: [true, 'Banner title is required'], trim: true },
  description: { type: String, default: '' },
  discountPercentage: { type: Number, default: 0 },
  ctaText: { type: String, default: 'Shop Now' },
  ctaLink: { type: String, default: '/shop' },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 1 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Carousel', CarouselSchema);
