const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const hashRefreshToken = token => crypto.createHash('sha256').update(token).digest('hex');

// ── Helper: assert required env vars exist ──
const requireEnv = (key) => {
  if (!process.env[key]) {
    throw new Error(`FATAL: Missing required environment variable: ${key}`);
  }
  return process.env[key];
};

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
    requireEnv('JWT_SECRET'),
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    requireEnv('JWT_REFRESH_SECRET'),
    { expiresIn: '7d' }
  );
};

// ── Nodemailer Gmail transporter ──
const createMailTransporter = () => {
  const port = Number.parseInt(process.env.EMAIL_PORT || '587', 10);
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: process.env.EMAIL_SECURE === 'true' || port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const setRefreshCookie = (res, token) => res.cookie('enen_refresh', token, {
  httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api/auth', maxAge: 7 * 24 * 60 * 60 * 1000
});

// ─────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof email !== 'string' || typeof password !== 'string' ||
        !firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (firstName.trim().length > 80 || lastName.trim().length > 80 || email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        (phone !== undefined && (typeof phone !== 'string' || phone.length > 30 || (phone && (!/^\+?[\d\s()-]{7,30}$/.test(phone) || phone.replace(/\D/g, '').length < 10 || phone.replace(/\D/g, '').length > 15)))) ||
        Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ success: false, message: 'Provide a valid name, email, phone number, and password' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters and no more than 72 UTF-8 bytes' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      role: 'user'
    });

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = hashRefreshToken(refreshToken);
    await user.save();
    setRefreshCookie(res, refreshToken);

    // Send welcome email (non-blocking)
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = createMailTransporter();
        await transporter.sendMail({
          from: `"ENEN Apparel" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: '🔥 Welcome to ENEN — Unleash the Blaze!',
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0F0F12;color:#F5F1EB;padding:40px;border-radius:16px">
              <h1 style="color:#E85D3D;font-size:32px;margin:0">ENEN 🔥</h1>
              <p style="font-size:12px;color:#FF7A00;text-transform:uppercase;letter-spacing:2px">UNLEASH THE BLAZE</p>
              <h2 style="color:#fff">Hey ${escapeHtml(user.firstName)}, welcome aboard!</h2>
              <p style="color:#ccc">Your account has been created successfully. Start exploring our premium anime graphic tees.</p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/shop" 
                 style="display:inline-block;background:#E85D3D;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:16px">
                Shop Now →
              </a>
              <p style="color:#666;font-size:12px;margin-top:32px">ENEN Apparel Co. · Unleash the Blaze</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.warn('[ENEN Email] Welcome email failed:', emailErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to ENEN.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        addresses: user.addresses
      }
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    res.status(500).json({ success: false, message: 'Unable to register account' });
  }
};

// ─────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password || Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPass = password; // Do NOT trim passwords — spaces are valid

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      // Generic message — don't reveal whether email exists
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(cleanPass);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = hashRefreshToken(refreshToken);
    await user.save();
    setRefreshCookie(res, refreshToken);

    return res.json({
      success: true,
      message: 'Flame ignited! Welcome back to ENEN.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        addresses: user.addresses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to sign in' });
  }
};

// ─────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.enen_refresh;
    if (refreshToken) await User.findOneAndUpdate({ refreshToken: hashRefreshToken(refreshToken) }, { refreshToken: '' });
  } catch (_) {}
  res.clearCookie('enen_refresh', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', path: '/api/auth' });
  res.json({ success: true, message: 'Logged out successfully' });
};

// ─────────────────────────────────────────
// POST /api/auth/refresh-token
// ─────────────────────────────────────────
exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.enen_refresh;
  if (!refreshToken) {
    return res.json({ success: false, message: 'No active session' });
  }

  try {
    const decoded = jwt.verify(refreshToken, requireEnv('JWT_REFRESH_SECRET'));
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== hashRefreshToken(refreshToken)) {
      res.clearCookie('enen_refresh', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', path: '/api/auth' });
      return res.json({ success: false, message: 'No active session' });
    }

    const token = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = hashRefreshToken(newRefreshToken);
    await user.save();
    setRefreshCookie(res, newRefreshToken);

    return res.json({ success: true, token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName,
      email: user.email, phone: user.phone, role: user.role, profileImage: user.profileImage, addresses: user.addresses } });
  } catch (err) {
    res.clearCookie('enen_refresh', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', path: '/api/auth' });
    return res.json({ success: false, message: 'No active session' });
  }
};

// ─────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (typeof email !== 'string' || !email.trim() || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(503).json({ success: false, message: 'Password reset email is not configured. Contact store support.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond generically — don't reveal whether email exists
    const genericResponse = {
      success: true,
      message: 'If an account with this email exists, you will receive a password reset link shortly.'
    };

    if (!user) {
      return res.json(genericResponse);
    }

    // Generate a secure random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    // Send email
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = createMailTransporter();
        await transporter.sendMail({
          from: `"ENEN Apparel" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: '🔥 ENEN — Password Reset Request',
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0F0F12;color:#F5F1EB;padding:40px;border-radius:16px">
              <h1 style="color:#E85D3D;font-size:32px;margin:0">ENEN 🔥</h1>
              <p style="font-size:12px;color:#FF7A00;text-transform:uppercase;letter-spacing:2px">UNLEASH THE BLAZE</p>
              <h2 style="color:#fff">Password Reset</h2>
              <p style="color:#ccc">Hi ${escapeHtml(user.firstName)}, you requested a password reset. Click the button below — this link expires in <strong>30 minutes</strong>.</p>
              <a href="${resetUrl}" 
                 style="display:inline-block;background:#E85D3D;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:16px">
                Reset Password →
              </a>
              <p style="color:#888;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email. Your password remains unchanged.</p>
              <p style="color:#666;font-size:12px;margin-top:32px">ENEN Apparel Co. · Unleash the Blaze</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('[ENEN Email] Password reset email failed:', emailErr.message);
        // Rollback token if email fails
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.json(genericResponse);
      }
    }

    return res.json(genericResponse);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to request password reset' });
  }
};

// ─────────────────────────────────────────
// PUT /api/auth/reset-password/:token
// ─────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!/^[a-f0-9]{64}$/i.test(token)) return res.status(400).json({ success: false, message: 'Invalid or expired reset token. Please request a new one.' });
    if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters and no more than 72 UTF-8 bytes' });
    }

    // Hash the incoming token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: Date.now() } // Must not be expired
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token. Please request a new one.' });
    }

    user.password = password;
    user.refreshToken = '';
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.clearCookie('enen_refresh', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', path: '/api/auth' });

    // Send confirmation email (non-blocking)
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = createMailTransporter();
        await transporter.sendMail({
          from: `"ENEN Apparel" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: '✅ ENEN — Your Password Has Been Reset',
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0F0F12;color:#F5F1EB;padding:40px;border-radius:16px">
              <h1 style="color:#E85D3D;font-size:32px;margin:0">ENEN 🔥</h1>
              <h2 style="color:#fff">Password Reset Successful</h2>
              <p style="color:#ccc">Hi ${escapeHtml(user.firstName)}, your password has been changed successfully. You can now log in with your new password.</p>
              <p style="color:#888;font-size:12px;margin-top:24px">If you didn't do this, contact us immediately.</p>
            </div>
          `
        });
      } catch (_) {}
    }

    return res.json({ success: true, message: 'Password reset successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to reset password' });
  }
};

