const Carousel = require('../models/Carousel');

// Initial default sample carousel banners (Used by seed script)
const sampleCarouselBanners = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1400&q=80',
    title: 'SUMMER DROP — 30% OFF ON ALL ANIME TEES',
    description: 'Unleash the blaze with 240 GSM heavyweight oversized streetwear. Set your style ablaze!',
    discountPercentage: 30,
    ctaText: 'EXPLORE DROP NOW',
    ctaLink: '/shop?category=Oversized',
    isActive: true,
    displayOrder: 1
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1400&q=80',
    title: 'DEMON SLAYER EXCLUSIVE HASHIRA COLLECTION',
    description: 'Tanjiro, Nezuko, Rengoku, and Muzan high-density puff prints. Never fades.',
    discountPercentage: 20,
    ctaText: 'SHOP DEMON SLAYER',
    ctaLink: '/collection/Demon Slayer',
    isActive: true,
    displayOrder: 2
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1400&q=80',
    title: 'ONE PIECE GEAR 5 SUN GOD NIKA RELEASE',
    description: 'The Warrior of Liberation. Ultra heavyweight boxy tees with metallic foil accents.',
    discountPercentage: 25,
    ctaText: 'VIEW ONE PIECE DROP',
    ctaLink: '/collection/One Piece',
    isActive: true,
    displayOrder: 3
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1400&q=80',
    title: 'ATTACK ON TITAN FREEDOM WINGS SWEATSHIRTS',
    description: 'If you win, you live. Distressed vintage washed heavy Terry sweatshirts.',
    discountPercentage: 15,
    ctaText: 'EXPLORE SWEATSHIRTS',
    ctaLink: '/shop?category=Sweatshirt',
    isActive: true,
    displayOrder: 4
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1400&q=80',
    title: 'MY HERO ACADEMIA PLUS ULTRA STREETWEAR',
    description: 'Deku, Bakugo, & All Might limited edition graphic prints.',
    discountPercentage: 35,
    ctaText: 'GET PLUS ULTRA',
    ctaLink: '/collection/My Hero Academia',
    isActive: true,
    displayOrder: 5
  }
];

exports.getActiveBanners = async (req, res) => {
  try {
    let banners = await Carousel.find({ isActive: true }).sort({ displayOrder: 1 });
    if (banners.length === 0) {
      banners = await Carousel.insertMany(sampleCarouselBanners);
      console.log('[Carousel Controller] Auto-seeded default carousel banners');
    }
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Carousel.find().sort({ displayOrder: 1 });
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const { imageUrl, title, description, discountPercentage, ctaText, ctaLink, displayOrder } = req.body;

    if (!imageUrl || !title) {
      return res.status(400).json({ success: false, message: 'Image URL and Title are required' });
    }

    const count = await Carousel.countDocuments();
    const banner = await Carousel.create({
      imageUrl,
      title,
      description: description || '',
      discountPercentage: Number(discountPercentage) || 0,
      ctaText: ctaText || 'Shop Now',
      ctaLink: ctaLink || '/shop',
      displayOrder: Number(displayOrder) || count + 1,
      isActive: true
    });

    res.status(201).json({ success: true, message: 'Carousel banner created successfully!', banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Carousel.findByIdAndUpdate(id, req.body, { new: true });

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.json({ success: true, message: 'Banner updated successfully!', banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Carousel.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.json({ success: true, message: 'Carousel banner deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Carousel.findById(id);

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json({ success: true, message: `Banner status toggled to ${banner.isActive ? 'Active' : 'Inactive'}`, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSampleBanners = () => sampleCarouselBanners;
