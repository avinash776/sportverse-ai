// ==================================================
// SportVerse AI - MongoDB Atlas Database Configuration
// ==================================================
// Uses Mongoose for MongoDB Atlas (Free Tier M0) connection.
// Provides connection with retry logic and connection pooling.
// ==================================================

const mongoose = require('mongoose');

let isConnected = false;

/**
 * Connect to MongoDB Atlas with retry logic
 */
async function connectDatabase() {
  if (isConnected) return;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI environment variable is not set. Add it to your .env file.');
  }

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 3000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      isConnected = true;
      console.log('📦 Connected to MongoDB Atlas successfully');

      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
        isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        isConnected = true;
      });

      return;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);
      if (attempt < MAX_RETRIES) {
        console.log(`   Retrying in ${RETRY_DELAY / 1000}s...`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY));
      } else {
        throw new Error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts: ${error.message}`);
      }
    }
  }
}

/**
 * Disconnect from MongoDB (for graceful shutdown)
 */
async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('📦 MongoDB disconnected');
  }
}

module.exports = { connectDatabase, disconnectDatabase };
