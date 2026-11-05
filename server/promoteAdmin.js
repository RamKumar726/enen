const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

async function promoteAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) throw new Error('Set ADMIN_EMAIL in server/.env first');
  if (!process.env.MONGO_URI) throw new Error('Set MONGO_URI in server/.env first');

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  const user = await User.findOne({ email });
  if (!user) throw new Error(`No account exists for ${email}. Register that account in the storefront first.`);

  if (user.role !== 'admin') {
    user.role = 'admin';
    user.refreshToken = '';
    await user.save();
  }
  console.log(`Admin access enabled for ${email}. Sign out and sign back in.`);
}

promoteAdmin()
  .catch(error => {
    console.error(`[Admin promotion] ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
