const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI environment variable is required');
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
