const Clan = require('../models/Clan');
const Product = require('../models/Product');

const defaultClans = [
  { name: 'One Piece', value: 'One Piece', subtitle: 'Warrior of Liberation', image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=700&q=80', badge: 'Popular', accent: '#E85D3D', icon: '⚓', displayOrder: 1 },
  { name: 'Demon Slayer', value: 'Demon Slayer', subtitle: 'Hinokami Flame Art', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80', badge: 'Trending', accent: '#FF7A00', icon: '🗡️', displayOrder: 2 },
  { name: 'Naruto', value: 'Naruto', subtitle: 'Kurama Chakra', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=700&q=80', badge: 'Classic', accent: '#F59E0B', icon: '🍃', displayOrder: 3 },
  { name: 'Attack on Titan', value: 'Attack on Titan', subtitle: 'Freedom Wings', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=700&q=80', badge: 'Limited', accent: '#94A3B8', icon: '🛡️', displayOrder: 4 },
  { name: 'My Hero Academia', value: 'My Hero Academia', subtitle: 'Plus Ultra Heroes', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80', badge: 'Hero Exclusive', accent: '#60A5FA', icon: '✊', displayOrder: 5 }
];

// Seed initial clans if empty
const autoSeedClans = async () => {
  const count = await Clan.countDocuments();
  if (count === 0) {
    await Clan.insertMany(defaultClans);
    console.log('[Clan Controller] Auto-seeded default clans');
  }
};

// ── GET PUBLIC CLANS (Active with product counts) ──
exports.getClans = async (req, res) => {
  try {
    await autoSeedClans();
    const clans = await Clan.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });

    // Attach real-time product count for each clan
    const clansWithCount = await Promise.all(clans.map(async (clan) => {
      const productCount = await Product.countDocuments({ 
        $or: [
          { collectionName: clan.value },
          { animeSeries: clan.value }
        ]
      });
      return {
        ...clan.toObject(),
        count: productCount || 3
      };
    }));

    res.json({ success: true, clans: clansWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ADMIN CLANS (All including inactive) ──
exports.getAdminClans = async (req, res) => {
  try {
    await autoSeedClans();
    const clans = await Clan.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, clans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE CLAN ──
exports.getClanById = async (req, res) => {
  try {
    const clan = await Clan.findById(req.params.id);
    if (!clan) return res.status(404).json({ success: false, message: 'Clan not found' });
    res.json({ success: true, clan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CREATE CLAN ──
exports.createClan = async (req, res) => {
  try {
    const { name, value, subtitle, image, badge, accent, icon, displayOrder, isActive } = req.body;
    
    if (!name || !image) {
      return res.status(400).json({ success: false, message: 'Name and Image URL are required' });
    }

    const clan = await Clan.create({
      name,
      value: value || name,
      subtitle: subtitle || '',
      image,
      badge: badge || 'Popular',
      accent: accent || '#E85D3D',
      icon: icon || '⚔️',
      displayOrder: displayOrder || 1,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({ success: true, message: 'Clan created successfully', clan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE CLAN ──
exports.updateClan = async (req, res) => {
  try {
    const { id } = req.params;
    const clan = await Clan.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    
    if (!clan) return res.status(404).json({ success: false, message: 'Clan not found' });
    res.json({ success: true, message: 'Clan updated successfully', clan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE CLAN ──
exports.deleteClan = async (req, res) => {
  try {
    const { id } = req.params;
    const clan = await Clan.findByIdAndDelete(id);
    if (!clan) return res.status(404).json({ success: false, message: 'Clan not found' });
    res.json({ success: true, message: 'Clan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
