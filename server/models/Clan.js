const mongoose = require('mongoose');

const ClanSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Clan name is required'], trim: true },
  value: { type: String, required: [true, 'Clan value slug is required'], trim: true },
  subtitle: { type: String, default: '' },
  image: { type: String, required: [true, 'Clan image URL is required'] },
  badge: { type: String, default: 'Popular' },
  accent: { type: String, default: '#E85D3D' },
  icon: { type: String, default: '⚓' },
  displayOrder: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Clan', ClanSchema);
