const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Carousel = require('../models/Carousel');
const mongoose = require('mongoose');

// GET /api/admin/dashboard — KPI stats + recent orders
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalOrders, totalProducts, totalUsers, activeBanners, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Carousel.countDocuments({ isActive: true }),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'firstName lastName email')
    ]);

    // Calculate total revenue using aggregation
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'Paid', orderStatus: { $nin: ['Cancelled', 'Returned'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Orders placed today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const ordersToday = await Order.countDocuments({ createdAt: { $gte: todayStart } });

    // Revenue this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthRevenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: monthStart }, paymentStatus: 'Paid', orderStatus: { $nin: ['Cancelled', 'Returned'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const monthRevenue = monthRevenueAgg.length > 0 ? monthRevenueAgg[0].total : 0;

    res.json({
      success: true,
      stats: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        totalProducts,
        totalUsers,
        activeBanners,
        ordersToday,
        monthRevenue: Number(monthRevenue.toFixed(2))
      },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};

// GET /api/admin/analytics — real revenue by collection & category from orders
exports.getAnalyticsData = async (req, res) => {
  try {
    // Aggregate revenue by collection from actual orders
    const orders = await Order.find({ paymentStatus: 'Paid', orderStatus: { $nin: ['Cancelled', 'Returned'] } });

    const collectionRevenueMap = {};
    const collectionOrdersMap = {};
    const categoryUnitsMap = {};

    orders.forEach(order => {
      (order.products || []).forEach(item => {
        // We need to look up the product to get collection & category
        // Since order items don't store collection/category, we'll aggregate differently
        const revenue = (item.price || 0) * (item.quantity || 1);
        // Track by product for later lookup
        if (!collectionRevenueMap._orderItems) {
          collectionRevenueMap._orderItems = [];
        }
        collectionRevenueMap._orderItems.push({
          productId: item.productId,
          revenue,
          quantity: item.quantity || 1
        });
      });
    });

    // Get all products to map productId → collection/category
    const products = await Product.find({}, 'collectionName category');
    const productMap = {};
    products.forEach(p => {
      productMap[p._id.toString()] = {
        collection: p.collectionName || 'One Piece',
        category: p.category || 'Regular T-Shirt'
      };
    });

    // Build real aggregations
    const collectionSalesMap = {};
    const categoryCountMap = {};

    if (collectionRevenueMap._orderItems) {
      collectionRevenueMap._orderItems.forEach(item => {
        const info = productMap[item.productId?.toString()] || { collection: 'Other', category: 'Regular T-Shirt' };

        // Collection revenue
        if (!collectionSalesMap[info.collection]) {
          collectionSalesMap[info.collection] = { sales: 0, orders: 0 };
        }
        collectionSalesMap[info.collection].sales += item.revenue;
        collectionSalesMap[info.collection].orders += 1;

        // Category units
        if (!categoryCountMap[info.category]) {
          categoryCountMap[info.category] = 0;
        }
        categoryCountMap[info.category] += item.quantity;
      });
    }

    // Format response
    let collectionSales = Object.keys(collectionSalesMap).map(name => ({
      name: `${name} Collection`,
      sales: Number(collectionSalesMap[name].sales.toFixed(2)),
      orders: collectionSalesMap[name].orders
    })).sort((a, b) => b.sales - a.sales);

    let categorySales = Object.keys(categoryCountMap).map(category => ({
      category,
      count: categoryCountMap[category]
    })).sort((a, b) => b.count - a.count);

    // If no orders exist yet, fall back to product-based estimates
    if (collectionSales.length === 0) {
      const productsByCollection = {};
      products.forEach(p => {
        const col = p.collectionName || 'One Piece';
        productsByCollection[col] = (productsByCollection[col] || 0) + 1;
      });
      collectionSales = Object.keys(productsByCollection).map(name => ({
        name: `${name} Collection`,
        sales: 0,
        orders: 0
      }));
    }

    if (categorySales.length === 0) {
      const productsByCategory = {};
      products.forEach(p => {
        const cat = p.category || 'Regular T-Shirt';
        productsByCategory[cat] = (productsByCategory[cat] || 0) + 1;
      });
      categorySales = Object.keys(productsByCategory).map(category => ({
        category,
        count: 0
      }));
    }

    res.json({
      success: true,
      collectionSales,
      categorySales
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};

// GET /api/admin/orders — all orders for admin management
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const search = String(req.query.search || '').trim();
    if (search.length > 100) return res.status(400).json({ success: false, message: 'Search query is too long' });

    let query = {};
    if (status && status !== 'All') {
      if (!['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid order status filter' });
      }
      query.orderStatus = status;
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matchingUsers = await User.find({ $or: [
        { email: { $regex: escaped, $options: 'i' } },
        { firstName: { $regex: escaped, $options: 'i' } },
        { lastName: { $regex: escaped, $options: 'i' } }
      ] }).select('_id').limit(500);
      const searchOptions = [ { trackingNumber: { $regex: escaped, $options: 'i' } } ];
      if (/^[a-f0-9]{24}$/i.test(search)) searchOptions.push({ _id: new mongoose.Types.ObjectId(search) });
      if (matchingUsers.length) searchOptions.push({ userId: { $in: matchingUsers.map(user => user._id) } });
      query.$or = searchOptions;
    }

    const pageNumber = Math.min(10000, Math.max(1, Number.parseInt(page, 10) || 1));
    const pageLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 50));
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageLimit)
      .limit(pageLimit)
      .populate('userId', 'firstName lastName email phone');

    const totalOrders = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      page: pageNumber,
      pages: Math.ceil(totalOrders / pageLimit) || 1,
      totalOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};

// GET /api/admin/users — all registered users
exports.getAllUsers = async (req, res) => {
  try {
    const pageNumber = Math.min(10000, Math.max(1, Number.parseInt(req.query.page, 10) || 1));
    const pageLimit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
    const search = String(req.query.search || '').trim();
    if (search.length > 100) return res.status(400).json({ success: false, message: 'Search query is too long' });
    const query = search ? { $or: ['firstName', 'lastName', 'email'].map(field => ({ [field]: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } })) } : {};
    const [users, totalUsers, admins, members] = await Promise.all([User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 }).skip((pageNumber - 1) * pageLimit).limit(pageLimit),
      User.countDocuments(query), User.countDocuments({ role: 'admin' }), User.countDocuments({ role: 'user' })]);

    res.json({
      success: true,
      users,
      page: pageNumber,
      pages: Math.ceil(totalUsers / pageLimit) || 1,
      totalUsers,
      stats: { admins, members }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};

// PUT /api/admin/users/:id/role — toggle user role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'User not found' });

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be "user" or "admin"' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from demoting themselves
    if (user._id.toString() === req.user.id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot demote your own admin account' });
    }

    user.role = role;
    user.refreshToken = '';
    await user.save();

    res.json({
      success: true,
      message: `User ${user.firstName} ${user.lastName} is now ${role}`,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request could not be completed' });
  }
};
