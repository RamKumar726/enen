const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

dotenv.config({ path: path.join(__dirname, '.env') });

const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});
const configuredProxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS || '0', 10);
app.set('trust proxy', Number.isInteger(configuredProxyHops) && configuredProxyHops >= 0 ? configuredProxyHops : 0);

if (process.env.NODE_ENV === 'production') {
  const required = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'ALLOWED_ORIGINS', 'CLIENT_URL'];
  const missing = required.filter(name => !process.env[name]);
  if (missing.length) throw new Error(`Missing required production configuration: ${missing.join(', ')}`);
  if (process.env.JWT_SECRET.length < 32 || process.env.JWT_REFRESH_SECRET.length < 32 || process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
    throw new Error('Production JWT secrets must be distinct random values of at least 32 characters');
  }
  for (const origin of process.env.ALLOWED_ORIGINS.split(',')) {
    try {
      const parsed = new URL(origin.trim());
      if (parsed.protocol !== 'https:' || parsed.origin !== origin.trim()) throw new Error('invalid');
    } catch (_) {
      throw new Error('ALLOWED_ORIGINS must contain exact HTTPS origins in production');
    }
  }
  try {
    const clientUrl = new URL(process.env.CLIENT_URL);
    if (clientUrl.protocol !== 'https:' || clientUrl.origin !== process.env.CLIENT_URL.replace(/\/$/, '')) throw new Error('invalid');
  } catch (_) {
    throw new Error('CLIENT_URL must be an HTTPS origin in production');
  }
}

// ── Security Headers (helmet) ──
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));

// ── CORS with proper origin allowlist ──
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    const error = new Error('Origin is not allowed by CORS');
    error.status = 403;
    return callback(error);
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
  legacyHeaders: false,
  skip: req => req.path === '/api/health'
});

app.use(generalLimiter);

app.use(express.json({
  limit: '1mb',
  verify: (req, res, buffer) => {
    if (req.originalUrl.startsWith('/api/payment/webhook')) req.rawBody = Buffer.from(buffer);
  }
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use((req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) req.body = {};
  next();
});
app.use((req, res, next) => {
  req.cookies = Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(part => {
    const index = part.indexOf('=');
    const value = part.slice(index + 1).trim();
    try { return [part.slice(0, index).trim(), decodeURIComponent(value)]; }
    catch (_) { return [part.slice(0, index).trim(), '']; }
  }));
  next();
});

// Run after request parsers so parsed JSON and form bodies are sanitized.
app.use(mongoSanitize());

// Static directory for uploaded images
app.use('/uploads', express.static(process.env.UPLOADS_DIR || path.join(__dirname, 'uploads'), { maxAge: '1d', immutable: false }));

// Request logger (disabled in production)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const safePath = req.path.replace(/\/reset-password\/[^/]+/, '/reset-password/[redacted]');
    console.log(`[${new Date().toISOString()}] ${req.id} ${req.method} ${safePath}`);
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
app.use('/api/fulfillment-events', require('./routes/fulfillmentEvents'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const databaseReady = require('mongoose').connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? 'online' : 'degraded',
    database: databaseReady ? 'connected' : 'unavailable',
    brand: 'ENEN',
    tagline: 'UNLEASH THE BLAZE',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date()
  });
});

app.use((req, res) => res.status(404).json({ success: false, message: 'API route not found' }));

// Global Error Handler
app.use(errorHandler);

const startServer = async () => {
  const { connectDB } = require('./config/db');
  const { expirePendingPaymentOrders } = require('./controllers/orderController');
  await connectDB();
  const port = Number(process.env.PORT || 5000);
  const server = app.listen(port, () => console.log(`[ENEN API] Listening on port ${port}`));
  const paymentExpiryTimer = setInterval(() => {
    expirePendingPaymentOrders().catch(err => console.error('[Order expiry] Failed:', err.message));
  }, 60 * 1000);
  paymentExpiryTimer.unref();

  const shutdown = () => {
    clearInterval(paymentExpiryTimer);
    server.close(() => require('mongoose').disconnect().finally(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
  return server;
};

if (require.main === module) startServer().catch(error => {
  console.error('[ENEN API] Startup failed:', error.message);
  process.exitCode = 1;
});

module.exports = app;
module.exports.startServer = startServer;
