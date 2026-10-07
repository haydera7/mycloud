const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');
const logger = require('../utils/logger');

async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
