const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

dotenv.config();

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB Database
connectDB();

const app = express();

// ── Security Headers (helmet) ──
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Needed for Razorpay embedded checkout
  contentSecurityPolicy: false      // Managed by frontend
}));

// ── NoSQL Injection Prevention ──
app.use(mongoSanitize());

// ── CORS with proper origin allowlist ──
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS policy: origin ${origin} is not allowed`));
  },
  credentials: true
}));

// ── Rate Limiters ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 20,                   // max 20 login/register attempts per window
  message: { success: false, message: 'Too many attempts from this IP. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 150,            // max 150 requests per minute per IP
  message: { success: false, message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(generalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static directory for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logger (disabled in production)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── API Routes ──
app.use('/api/auth', authLimiter, require('./routes/auth')); // strict rate limit on auth
app.use('/api/products', require('./routes/products'));
app.use('/api/carousel', require('./routes/carousel'));
app.use('/api/clans', require('./routes/clans'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/users', require('./routes/users'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/shiprocket', require('./routes/shiprocket'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    brand: 'ENEN',
    tagline: 'UNLEASH THE BLAZE',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date()
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
=====================================================
 🔥 ENEN API Server Running on Port ${PORT} 🔥
 Tagline: UNLEASH THE BLAZE
 URL: http://localhost:${PORT}
 Health Check: http://localhost:${PORT}/api/health
 Security: helmet ✅  mongoSanitize ✅  rateLimit ✅
=====================================================
  `);
});

module.exports = app;
