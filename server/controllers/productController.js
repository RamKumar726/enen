const Product = require('../models/Product');
const mongoose = require('mongoose');

const validProductOptions = data => {
  if (data.images !== undefined && (!Array.isArray(data.images) || data.images.length < 1 || data.images.length > 6 ||
      data.images.some(image => !image || typeof image.url !== 'string' || !/^https:\/\//i.test(image.url) || image.url.length > 2048 || (image.alt !== undefined && String(image.alt).length > 160)))) return false;
  if (data.colors !== undefined && (!Array.isArray(data.colors) || data.colors.length < 1 || data.colors.length > 20 ||
      data.colors.some(color => !color || typeof color.name !== 'string' || !color.name.trim() || color.name.length > 40 || !/^#[0-9a-f]{6}$/i.test(color.code || '')))) return false;
  if (data.sizes !== undefined && (!Array.isArray(data.sizes) || data.sizes.length < 1 || data.sizes.some(size => !['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(size)))) return false;
  return true;
};

const sampleProducts = [
  // ONE PIECE COLLECTION (4 DESIGNS)
  {
    _id: 'prod_op_101',
    name: 'Luffy Gear 5 Sun God Nika Graphic Tee',
    slug: 'luffy-gear-5-sun-god-nika-tee',
    description: 'The Warrior of Liberation! Fiery cloud hair motif in pure white and sun flare yellow on heavyweight drop-shoulder tee.',
    price: 699,
    originalPrice: 1399,
    stock: 85,
    images: [
      { url: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80', alt: 'Luffy Gear 5 Front' },
      { url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80', alt: 'Luffy Back Print' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Cream White', code: '#F5F1EB' }, { name: 'Obsidian Black', code: '#121212' }],
    category: 'Regular T-Shirt',
    collectionName: 'One Piece',
    animeSeries: 'One Piece',
    fabric: '240 GSM 100% Terry Cotton',
    printType: 'High-Puff Soft Rubber Print',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },
  {
    _id: 'prod_op_102',
    name: 'Roronoa Zoro Three-Sword Style Swordmaster Tee',
    slug: 'roronoa-zoro-swordmaster-tee',
    description: 'King of Hell three-sword green flame aura. High-density screen print with metallic green foil highlights.',
    price: 699,
    originalPrice: 1199,
    stock: 60,
    images: [
      { url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80', alt: 'Zoro Front View' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Emerald Green', code: '#1B3B2B' }, { name: 'Pitch Black', code: '#000000' }],
    category: 'Regular T-Shirt',
    collectionName: 'One Piece',
    animeSeries: 'One Piece',
    fabric: '240 GSM Ring-Spun Cotton',
    printType: 'Metallic Screen Print',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },
  {
    _id: 'prod_op_103',
    name: 'Sanji Diable Jambe Flame Kick Oversized Tee',
    slug: 'sanji-diable-jambe-kick-tee',
    description: 'Ifrit Jambe blue-orange hellfire kick. Drop-shoulder relaxed boxy fit engineered for streetwear enthusiasts.',
    price: 699,
    originalPrice: 1399,
    stock: 45,
    images: [
      { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', alt: 'Sanji Kick Tee' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Flame Blue Black', code: '#0F172A' }],
    category: 'Oversized',
    collectionName: 'One Piece',
    animeSeries: 'One Piece',
    fabric: '260 GSM Heavyweight Terry Cotton',
    printType: 'Discharge High-Density Print',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },
  {
    _id: 'prod_op_104',
    name: 'Chopper Monster Point Heavyweight Sweatshirt',
    slug: 'chopper-monster-point-sweatshirt',
    description: 'Chopper transformed into Monster Point beast. Heavy fleece lined winter sweatshirt with embroidered front badge.',
    price: 899,
    originalPrice: 1699,
    stock: 30,
    images: [
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80', alt: 'Chopper Sweatshirt' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Cherry Red', code: '#991B1B' }, { name: 'Obsidian Black', code: '#121212' }],
    category: 'Sweatshirt',
    collectionName: 'One Piece',
    animeSeries: 'One Piece',
    fabric: '320 GSM Fleece Washed Cotton',
    printType: 'Embroidered & Screen Print',
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },

  // DEMON SLAYER COLLECTION (4 DESIGNS)
  {
    _id: 'prod_ds_201',
    name: 'Tanjiro Sun Breathing Hinokami Kagura Tee',
    slug: 'tanjiro-sun-breathing-tee',
    description: 'Set your heart ablaze! Features Tanjiros flame dragon aura and Nichirin blade graphics.',
    price: 699,
    originalPrice: 1399,
    stock: 70,
    images: [
      { url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80', alt: 'Tanjiro Sun Breathing Tee' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Flame Red', code: '#E85D3D' }, { name: 'Obsidian Black', code: '#121212' }],
    category: 'Regular T-Shirt',
    collectionName: 'Demon Slayer',
    animeSeries: 'Demon Slayer',
    fabric: '240 GSM Heavyweight Terry Cotton',
    printType: '3D High-Puff Print',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },
  {
    _id: 'prod_ds_202',
    name: 'Nezuko Demon Form Flame Art Sleeveless Tee',
    slug: 'nezuko-demon-form-sleeveless-tee',
    description: 'Blood Demon Art Exploding Flames. Breathable muscle tank cut for gym sessions and summer street style.',
    price: 699,
    originalPrice: 1099,
    stock: 50,
    images: [
      { url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80', alt: 'Nezuko Sleeveless Tee' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Rose Crimson', code: '#BE123C' }, { name: 'Pitch Black', code: '#000000' }],
    category: 'Sleeveless',
    collectionName: 'Demon Slayer',
    animeSeries: 'Demon Slayer',
    fabric: '220 GSM Ribbed Combed Cotton',
    printType: 'Soft Rubber Print',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },
  {
    _id: 'prod_ds_203',
    name: 'Hashira Squad Nine Pillars Flame Oversized Tee',
    slug: 'hashira-squad-nine-pillars-tee',
    description: 'All 9 Hashira Pillars featured on back panel with Kanji calligraphy across the chest.',
    price: 899,
    originalPrice: 1599,
    stock: 90,
    images: [
      { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', alt: 'Hashira Squad Tee' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Acid Washed Charcoal', code: '#2C2C2C' }],
    category: 'Oversized',
    collectionName: 'Demon Slayer',
    animeSeries: 'Demon Slayer',
    fabric: '260 GSM Heavy Acid Washed Cotton',
    printType: 'Multi-Color Screen Print',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },
  {
    _id: 'prod_ds_204',
    name: 'Muzan Demon King Infinity Castle Sweatshirt',
    slug: 'muzan-demon-king-sweatshirt',
    description: 'The King of Demons inside the revolving Infinity Castle. Premium brushed fleece lined sweatshirt.',
    price: 899,
    originalPrice: 1799,
    stock: 40,
    images: [
      { url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80', alt: 'Muzan Sweatshirt' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Obsidian Black', code: '#121212' }],
    category: 'Sweatshirt',
    collectionName: 'Demon Slayer',
    animeSeries: 'Demon Slayer',
    fabric: '320 GSM Terry Fleece Cotton',
    printType: 'Metallic Ink Screen Print',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },

  // NARUTO COLLECTION (3 DESIGNS)
  {
    _id: 'prod_nr_301',
    name: 'Naruto Sage Mode Nine-Tails Chakra Tee',
    slug: 'naruto-sage-mode-chakra-tee',
    description: 'Golden Kurama chakra seal and Toad Sage eyes. Double-layered graphic print.',
    price: 699,
    originalPrice: 1199,
    stock: 75,
    images: [
      { url: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80', alt: 'Naruto Sage Mode Tee' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Chakra Gold Black', code: '#1A1810' }],
    category: 'Regular T-Shirt',
    collectionName: 'Naruto',
    animeSeries: 'Naruto Shippuden',
    fabric: '240 GSM Ring-Spun Cotton',
    printType: 'Metallic Gold Foil & Rubber Print',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },
  {
    _id: 'prod_nr_302',
    name: 'Sasuke Rinnegan Susanoo Armor Tee',
    slug: 'sasuke-rinnegan-susanoo-tee',
    description: 'Purple lightning Indra Susanoo aura with Mangekyou Sharingan eye on front pocket.',
    price: 699,
    originalPrice: 1299,
    stock: 65,
    images: [
      { url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80', alt: 'Sasuke Susanoo Tee' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Dark Indigo', code: '#1E1B4B' }, { name: 'Obsidian Black', code: '#121212' }],
    category: 'Regular T-Shirt',
    collectionName: 'Naruto',
    animeSeries: 'Naruto Shippuden',
    fabric: '240 GSM Combed Cotton',
    printType: 'Discharge High-Detail Print',
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },
  {
    _id: 'prod_nr_303',
    name: 'Kakashi Sharingan Lightning Blade Sleeveless Tee',
    slug: 'kakashi-lightning-blade-sleeveless-tee',
    description: 'The Copy Ninja Kakashi wielding Raikiri Lightning Blade. Cut-off athletic sleeveless tank.',
    price: 899,
    originalPrice: 1399,
    stock: 45,
    images: [
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80', alt: 'Kakashi Sleeveless Tee' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Military Grey', code: '#374151' }, { name: 'Pitch Black', code: '#000000' }],
    category: 'Sleeveless',
    collectionName: 'Naruto',
    animeSeries: 'Naruto Shippuden',
    fabric: '230 GSM Ribbed Terry Cotton',
    printType: 'Puff Rubber Print',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },

  // ATTACK ON TITAN COLLECTION (4 DESIGNS)
  {
    _id: 'prod_aot_401',
    name: 'Eren Attack Titan Founder Flame Tee',
    slug: 'eren-attack-titan-founder-tee',
    description: 'Rumbling activation! Eren in Attack Titan form roaring under blood red lightning.',
    price: 899,
    originalPrice: 1499,
    stock: 80,
    images: [
      { url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80', alt: 'Eren Titan Tee' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Obsidian Black', code: '#121212' }],
    category: 'Regular T-Shirt',
    collectionName: 'Attack on Titan',
    animeSeries: 'Attack on Titan',
    fabric: '250 GSM Heavywashed Cotton',
    printType: 'Vintage Heavy Screen Print',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },
  {
    _id: 'prod_aot_402',
    name: 'Levi Ackerman Captain Blades Graphic Tee',
    slug: 'levi-ackerman-blades-tee',
    description: 'Humanitys Strongest Soldier! Levi in mid-air ODM gear spin attack.',
    price: 699,
    originalPrice: 1199,
    stock: 95,
    images: [
      { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', alt: 'Levi Ackerman Tee' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Survey Green', code: '#1E293B' }, { name: 'Cream White', code: '#F5F1EB' }],
    category: 'Regular T-Shirt',
    collectionName: 'Attack on Titan',
    animeSeries: 'Attack on Titan',
    fabric: '240 GSM Terry Cotton',
    printType: 'High-Density Puff Print',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },
  {
    _id: 'prod_aot_403',
    name: 'Mikasa Red Scarf Wings of Freedom Oversized Tee',
    slug: 'mikasa-scraf-wings-tee',
    description: 'If I dont win, I die. If I win, I live. Mikasas iconic red scarf with Wings of Freedom back emblem.',
    price: 699,
    originalPrice: 1399,
    stock: 55,
    images: [
      { url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80', alt: 'Mikasa Scarf Tee' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Washed Charcoal', code: '#2C2C2C' }],
    category: 'Oversized',
    collectionName: 'Attack on Titan',
    animeSeries: 'Attack on Titan',
    fabric: '260 GSM Acid Washed Terry',
    printType: 'Soft Rubber Screen Print',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },
  {
    _id: 'prod_aot_404',
    name: 'Colossal Titan Wall Maria Steam Heavyweight Sweatshirt',
    slug: 'colossal-titan-steam-sweatshirt',
    description: 'On that day, humanity received a grim reminder. Steam heat print wrapping around chest and sleeves.',
    price: 1499,
    originalPrice: 1999,
    stock: 35,
    images: [
      { url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80', alt: 'Colossal Titan Sweatshirt' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Steam Red Black', code: '#0F0F12' }],
    category: 'Sweatshirt',
    collectionName: 'Attack on Titan',
    animeSeries: 'Attack on Titan',
    fabric: '340 GSM Fleece Terry Cotton',
    printType: '3D Puff & Thermal Print',
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },

  // MY HERO ACADEMIA COLLECTION (3 DESIGNS)
  {
    _id: 'prod_mha_501',
    name: 'Deku One For All Full Cowl Plus Ultra Tee',
    slug: 'deku-one-for-all-full-cowl-tee',
    description: '100% One For All green lightning glow. UV reactive print that shines under night city lights.',
    price: 699,
    originalPrice: 1299,
    stock: 75,
    images: [
      { url: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80', alt: 'Deku Plus Ultra Tee' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Neon Cyber Black', code: '#0A0A10' }],
    category: 'Regular T-Shirt',
    collectionName: 'My Hero Academia',
    animeSeries: 'My Hero Academia',
    fabric: '240 GSM Ring-Spun Cotton',
    printType: 'UV Reactive Glow Print',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },
  {
    _id: 'prod_mha_502',
    name: 'Bakugo Howitzer Impact Explosion Tee',
    slug: 'bakugo-howitzer-impact-explosion-tee',
    description: 'SHINEEE! Orange explosion sparks and gauntlet grenades across the back panel.',
    price: 699,
    originalPrice: 1199,
    stock: 60,
    images: [
      { url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80', alt: 'Bakugo Explosion Tee' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Explosion Orange', code: '#EA580C' }, { name: 'Pitch Black', code: '#000000' }],
    category: 'Regular T-Shirt',
    collectionName: 'My Hero Academia',
    animeSeries: 'My Hero Academia',
    fabric: '240 GSM Heavy Cotton',
    printType: 'Discharge Rubber Print',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  },
  {
    _id: 'prod_mha_503',
    name: 'All Might Symbol of Peace Flame Oversized Tee',
    slug: 'all-might-symbol-of-peace-tee',
    description: 'I am here! All Might in classic silver-age comic book art style on drop-shoulder boxy tee.',
    price: 899,
    originalPrice: 1599,
    stock: 45,
    images: [
      { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', alt: 'All Might Oversized Tee' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Freedom Blue', code: '#1D4ED8' }, { name: 'Cream White', code: '#F5F1EB' }],
    category: 'Oversized',
    collectionName: 'My Hero Academia',
    animeSeries: 'My Hero Academia',
    fabric: '260 GSM Heavyweight Washed Terry',
    printType: '3D High-Puff Print',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isActive: false,
    averageRating: 0,
    numReviews: 0,
    ratings: []
  }
];

exports.getProducts = async (req, res) => {
  try {
    const { category, collection, featured, bestseller, search, sort, minPrice, maxPrice, size, color, page = 1, limit = 12 } = req.query;

    let query = { isActive: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (collection && collection !== 'All') {
      query.collectionName = collection;
    }

    if (featured === 'true') query.isFeatured = true;
    if (bestseller === 'true') query.isBestSeller = true;

    if (size) {
      if (!['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(size)) return res.status(400).json({ success: false, message: 'Invalid size filter' });
      query.sizes = size;
    }
    if (color) {
      if (String(color).length > 40) return res.status(400).json({ success: false, message: 'Color filter is too long' });
      const safeColor = String(color).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query['colors.name'] = new RegExp(`^${safeColor}$`, 'i');
    }

    if ((minPrice !== undefined && (!Number.isFinite(Number(minPrice)) || Number(minPrice) < 0)) ||
        (maxPrice !== undefined && (!Number.isFinite(Number(maxPrice)) || Number(maxPrice) < 0))) {
      return res.status(400).json({ success: false, message: 'Price filters must be non-negative numbers' });
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
      if (query.price.$gte !== undefined && query.price.$lte !== undefined && query.price.$gte > query.price.$lte) {
        return res.status(400).json({ success: false, message: 'Minimum price cannot exceed maximum price' });
      }
    }

    if (search) {
      if (String(search).length > 100) return res.status(400).json({ success: false, message: 'Search query is too long' });
      const safeSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { animeSeries: { $regex: safeSearch, $options: 'i' } },
        { collectionName: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    let sortOptions = {};
    if (sort === 'price-low') sortOptions.price = 1;
    else if (sort === 'price-high') sortOptions.price = -1;
    else if (sort === 'rating') sortOptions.averageRating = -1;
    else sortOptions.createdAt = -1;

    const pageNumber = Math.min(10000, Math.max(1, Number.parseInt(page, 10) || 1));
    const pageLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 12));
    const count = await Product.countDocuments(query);
    const dbProducts = await Product.find(query)
      .sort(sortOptions)
      .skip((pageNumber - 1) * pageLimit)
      .limit(pageLimit);

    return res.json({
      success: true,
      products: dbProducts,
      page: pageNumber,
      pages: Math.ceil(count / pageLimit) || 1,
      totalProducts: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'Product not found' });
    const product = await Product.findOne({ _id: id, isActive: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};

exports.getAdminProductById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'Product not found' });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, product });
  } catch (error) {
    return res.status(error.name === 'CastError' ? 404 : 500).json({ success: false, message: 'Unable to load product' });
  }
};

exports.getAdminProducts = async (req, res) => {
  try {
    const page = Math.min(10000, Math.max(1, Number.parseInt(req.query.page, 10) || 1));
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
    const search = String(req.query.search || '').trim();
    if (search.length > 100) return res.status(400).json({ success: false, message: 'Search query is too long' });
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const query = {};
    if (search) query.$or = ['name', 'animeSeries', 'collectionName'].map(field => ({ [field]: { $regex: safeSearch, $options: 'i' } }));
    if (req.query.category && req.query.category !== 'All') query.category = req.query.category;
    if (req.query.collection && req.query.collection !== 'All') query.collectionName = req.query.collection;
    if (req.query.active === 'true') query.isActive = true;
    if (req.query.active === 'false') query.isActive = false;
    const [products, totalProducts] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(query)
    ]);
    return res.json({ success: true, products, page, pages: Math.ceil(totalProducts / limit) || 1, totalProducts });
  } catch (_) {
    return res.status(500).json({ success: false, message: 'Unable to load catalog' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const allowedFields = ['name', 'slug', 'description', 'price', 'amazonUrl', 'originalPrice', 'stock', 'images', 'sizes', 'colors', 'category', 'collectionName', 'animeSeries', 'fabric', 'printType', 'hsnCode', 'weightKg', 'isFeatured', 'isBestSeller', 'isNewArrival', 'isActive'];
    const input = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    if (input.isActive !== false && !input.amazonUrl) return res.status(400).json({ success: false, message: 'Add the Amazon product URL before activating a product' });
    if (!validProductOptions(input)) return res.status(400).json({ success: false, message: 'Images, sizes, or color options are invalid' });
    const product = await Product.create(input);
    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.code === 11000 ? 400 : 500)
      .json({ success: false, message: error.name === 'ValidationError' ? Object.values(error.errors).map(e => e.message).join(', ') : 'Unable to create product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'Product not found' });
    const allowedFields = ['name', 'slug', 'description', 'price', 'amazonUrl', 'originalPrice', 'stock', 'images', 'sizes', 'colors', 'category', 'collectionName', 'animeSeries', 'fabric', 'printType', 'hsnCode', 'weightKg', 'isFeatured', 'isBestSeller', 'isNewArrival', 'isActive'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    if (updates.amazonUrl !== undefined && !updates.amazonUrl && updates.isActive !== false) {
      const existing = await Product.findById(id).select('isActive');
      if (existing?.isActive) return res.status(400).json({ success: false, message: 'Active products must keep a valid Amazon product URL' });
    }
    if (updates.isActive === true && !updates.amazonUrl) {
      const existing = await Product.findById(id).select('amazonUrl');
      if (!existing?.amazonUrl) return res.status(400).json({ success: false, message: 'Add the Amazon product URL before activating a product' });
    }
    if (!validProductOptions(updates)) return res.status(400).json({ success: false, message: 'Images, sizes, or color options are invalid' });
    const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : error.name === 'ValidationError' ? 400 : error.name === 'CastError' ? 404 : 500)
      .json({ success: false, message: error.name === 'ValidationError' ? Object.values(error.errors).map(e => e.message).join(', ') : 'Unable to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'Product not found' });
    const product = await Product.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product archived successfully', product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};

exports.getSampleProducts = () => sampleProducts;
