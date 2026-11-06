const Product = require('../models/Product');
const User = require('../models/User');
const Carousel = require('../models/Carousel');
const mongoose = require('mongoose');

// GET /api/admin/dashboard — catalog and account KPIs
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalProducts, totalUsers, activeBanners] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Carousel.countDocuments({ isActive: true })
    ]);

    res.json({
      success: true,
      stats: { totalProducts, totalUsers, activeBanners }
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
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire')
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
