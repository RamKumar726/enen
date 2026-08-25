const mongoose = require('mongoose');
const dns = require('dns');

// Set DNS servers to Google DNS for reliable SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log(`[ENEN DB] MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[ENEN DB] Critical MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
