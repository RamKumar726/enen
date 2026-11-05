const mongoose = require('mongoose');
const User = require('../models/User');

const validAddress = (address) => {
  const fields = ['name', 'phone', 'street', 'city', 'state', 'pincode'];
  return address && fields.every(key => typeof address[key] === 'string' && address[key].trim().length > 0 && address[key].length <= 200)
    && /^\d{6}$/.test(address.pincode) && /^\+?[\d\s()-]+$/.test(address.phone) && (() => { const digits = address.phone.replace(/\D/g, ''); return digits.length === 10 || (digits.length === 12 && digits.startsWith('91')) || (digits.length === 11 && digits.startsWith('0')); })();
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken -resetPasswordToken -resetPasswordExpire');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load profile' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const updates = {};
    for (const field of ['firstName', 'lastName', 'phone']) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== 'string' || !req.body[field].trim() || req.body[field].length > 100) {
          return res.status(400).json({ success: false, message: `Invalid ${field}` });
        }
        updates[field] = req.body[field].trim();
      }
    }
    if (updates.phone && (!/^\+?[\d\s()-]+$/.test(updates.phone) || updates.phone.replace(/\D/g, '').length < 10 || updates.phone.replace(/\D/g, '').length > 15)) {
      return res.status(400).json({ success: false, message: 'Provide a valid phone number' });
    }
    if (req.body.profileImage !== undefined) {
      try {
        const imageUrl = new URL(req.body.profileImage);
        if (imageUrl.protocol !== 'https:') throw new Error('invalid protocol');
        updates.profileImage = imageUrl.toString();
      } catch (_) { return res.status(400).json({ success: false, message: 'Profile image must be an HTTPS URL' }); }
    }
    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true, runValidators: true })
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to update profile' });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load addresses' });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const { name, phone, street, city, state, pincode, country = 'India', isDefault = false } = req.body;
    if (!validAddress({ name, phone, street, city, state, pincode }) || country !== 'India' || typeof isDefault !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Provide a valid address, phone number, and six-digit pincode' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.addresses.length >= 20) return res.status(409).json({ success: false, message: 'Address book limit reached' });
    const makeDefault = isDefault || user.addresses.length === 0;
    if (makeDefault) user.addresses.forEach(address => { address.isDefault = false; });
    user.addresses.push({ name: name.trim(), phone: phone.trim(), street: street.trim(), city: city.trim(), state: state.trim(), pincode, country, isDefault: makeDefault });
    await user.save();
    return res.status(201).json({ success: true, message: 'Address added', addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to save address' });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid address id' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    const wasDefault = address.isDefault;
    user.addresses.pull(req.params.id);
    if (wasDefault && user.addresses.length) user.addresses[0].isDefault = true;
    await user.save();
    return res.json({ success: true, message: 'Address deleted', addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to delete address' });
  }
};
