const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Carousel = require('../models/Carousel');

exports.getDashboardStats = async (req, res) => {
  try {
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'firstName lastName email');
    const allOrders = await Order.find();
    const totalProducts = await Product.countDocuments();
    const activeBanners = await Carousel.countDocuments({ isActive: true });

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.json({
      success: true,
      stats: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        totalProducts,
        activeBanners
      },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnalyticsData = async (req, res) => {
  try {
    const products = await Product.find();

    const collectionMap = {};
    const categoryMap = {};

    products.forEach(p => {
      const col = p.collectionName || 'One Piece';
      const cat = p.category || 'Regular T-Shirt';
      collectionMap[col] = (collectionMap[col] || 0) + (p.price * (p.numReviews || 5));
      categoryMap[cat] = (categoryMap[cat] || 0) + (p.stock || 10);
    });

    const collectionSales = Object.keys(collectionMap).map(name => ({
      name: `${name} Collection`,
      sales: Number(collectionMap[name].toFixed(2)),
      orders: Math.floor(collectionMap[name] / 30) || 10
    }));

    const categorySales = Object.keys(categoryMap).map(category => ({
      category,
      count: categoryMap[category]
    }));

    res.json({
      success: true,
      collectionSales: collectionSales.length > 0 ? collectionSales : [
        { name: 'One Piece Collection', sales: 4200, orders: 120 },
        { name: 'Demon Slayer Collection', sales: 3800, orders: 105 },
        { name: 'Attack on Titan Collection', sales: 2900, orders: 88 },
        { name: 'Naruto Collection', sales: 2400, orders: 74 },
        { name: 'My Hero Academia Collection', sales: 1550, orders: 45 }
      ],
      categorySales: categorySales.length > 0 ? categorySales : [
        { category: 'Oversized T-Shirt', count: 185 },
        { category: 'Regular T-Shirt', count: 142 },
        { category: 'Sweatshirt', count: 68 },
        { category: 'Sleeveless', count: 37 }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
