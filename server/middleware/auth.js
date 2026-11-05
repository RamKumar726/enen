const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('[ENEN Auth] FATAL: JWT_SECRET env var is missing!');
    return res.status(500).json({ success: false, message: 'Server configuration error.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const isAdmin = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }
  try {
    const currentUser = await User.findById(req.user.id).select('role');
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
    return next();
  } catch (_) {
    return res.status(503).json({ success: false, message: 'Authorization service unavailable' });
  }
};

module.exports = { verifyToken, isAdmin };
