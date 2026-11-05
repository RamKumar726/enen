const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Carousel = require('./models/Carousel');
const User = require('./models/User');
const { getSampleProducts } = require('./controllers/productController');
const { getSampleBanners } = require('./controllers/carouselController');
const { getDefaultClans } = require('./controllers/clanController');
const Clan = require('./models/Clan');

dotenv.config({ path: require('path').join(__dirname, '.env') });

const seedData = async () => {
  try {
    if (process.env.NODE_ENV === 'production') throw new Error('Seeding is disabled in production');
    if (process.env.SEED_DESTRUCTIVE !== 'true') throw new Error('Set SEED_DESTRUCTIVE=true to replace catalog and carousel data');
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/enen_ecommerce';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    console.log('[ENEN Seed] Connected to MongoDB for seeding...');

    await Product.deleteMany({});
    await Carousel.deleteMany({});

    // Seed Products
    const sampleProds = getSampleProducts();
    const cleanProds = sampleProds.map(p => {
      const { _id, ...rest } = p;
      return rest;
    });
    await Product.insertMany(cleanProds);
    console.log(`[ENEN Seed] Successfully seeded ${cleanProds.length} products!`);

    // Seed Carousel Banners
    const sampleBanners = getSampleBanners();
    const cleanBanners = sampleBanners.map(b => {
      const { _id, ...rest } = b;
      return { ...rest, isActive: false };
    });
    await Carousel.insertMany(cleanBanners);
    console.log(`[ENEN Seed] Successfully seeded ${cleanBanners.length} carousel banners!`);

    if (await Clan.countDocuments() === 0) {
      const defaultClans = getDefaultClans();
      await Clan.insertMany(defaultClans.map(clan => ({ ...clan, isActive: false })));
      console.log(`[ENEN Seed] Successfully seeded ${defaultClans.length} collections!`);
    }

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase().trim() });
      if (!existingAdmin) await User.create({
        firstName: process.env.ADMIN_FIRST_NAME || 'Store', lastName: 'Admin',
        email: process.env.ADMIN_EMAIL.toLowerCase().trim(), password: process.env.ADMIN_PASSWORD, role: 'admin'
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('[ENEN Seed Notice] Seeding warning:', error.message);
    process.exitCode = 1;
    await mongoose.disconnect().catch(() => {});
  }
};

seedData();
