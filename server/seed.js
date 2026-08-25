const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const Product = require('./models/Product');
const Carousel = require('./models/Carousel');
const User = require('./models/User');
const { getSampleProducts } = require('./controllers/productController');
const { getSampleBanners } = require('./controllers/carouselController');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/enen_ecommerce';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    console.log('[ENEN Seed] Connected to MongoDB for seeding...');

    await Product.deleteMany({});
    await Carousel.deleteMany({});
    await User.deleteMany({});

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
      return rest;
    });
    await Carousel.insertMany(cleanBanners);
    console.log(`[ENEN Seed] Successfully seeded ${cleanBanners.length} carousel banners!`);

    // Seed Admin User
    await User.create({
      firstName: 'ENEN',
      lastName: 'Admin',
      email: 'admin@enen.com',
      password: 'adminpassword123',
      phone: '+91 9999988888',
      role: 'admin',
      addresses: [{
        name: 'ENEN HQ',
        phone: '+91 9999988888',
        street: '100 Flame Way, Cyber District',
        city: 'Tokyo',
        state: 'Kanto',
        pincode: '400002',
        country: 'India',
        isDefault: true
      }]
    });

    // Seed Demo User
    await User.create({
      firstName: 'Flame',
      lastName: 'Rider',
      email: 'demo@enen.com',
      password: 'enen123',
      phone: '+91 9876543210',
      role: 'user',
      addresses: [{
        name: 'Flame Rider',
        phone: '+91 9876543210',
        street: '77 Anime Boulevard, Flame District',
        city: 'Tokyo',
        state: 'Kanto',
        pincode: '400001',
        country: 'India',
        isDefault: true
      }]
    });

    console.log('[ENEN Seed] Created Admin User (admin@enen.com / adminpassword123)');
    console.log('[ENEN Seed] Created Demo User (demo@enen.com / enen123)');

    process.exit(0);
  } catch (error) {
    console.error('[ENEN Seed Notice] Seeding warning:', error.message);
    process.exit(0);
  }
};

seedData();
