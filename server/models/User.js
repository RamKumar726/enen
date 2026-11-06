const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: [true, 'First name is required'], trim: true, maxlength: 80 },
  lastName: { type: String, required: [true, 'Last name is required'], trim: true, maxlength: 80 },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254
  },
  password: { type: String, required: [true, 'Password is required'], minlength: 8, maxlength: 72 },
  phone: { type: String, default: '' },
  profileImage: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  addresses: [AddressSchema],
  refreshToken: { type: String, default: '' },
  resetPasswordToken: { type: String, default: undefined },
  resetPasswordExpire: { type: Date, default: undefined }
}, {
  timestamps: true
});

UserSchema.index({ resetPasswordToken: 1 }, { sparse: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Match user password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
