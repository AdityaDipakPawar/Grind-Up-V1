const mongoose = require('mongoose');

// Database configuration
let isConnecting = false;
let connectionPromise = null;

const connectDB = async () => {
  try {
    // If already connected, return immediately
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
    
    // If connection is in progress, wait for it
    if (isConnecting && connectionPromise) {
      return await connectionPromise;
    }
    
    // Start new connection
    isConnecting = true;
    
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('MONGO_URI is not set. Cannot connect to database.');
      isConnecting = false;
      throw new Error('MONGO_URI is not set in environment variables');
    }

    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 30000, // 30 seconds
      connectTimeoutMS: 10000, // 10 seconds
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 1, // Reduced for serverless
      bufferCommands: false, // Disable mongoose buffering - fail fast if not connected
      bufferMaxEntries: 0, // Disable mongoose buffering
    };

    connectionPromise = mongoose.connect(uri, options);
    const conn = await connectionPromise;

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (${process.env.NODE_ENV} mode)`);
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnecting = false;
      connectionPromise = null;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnecting = false;
      connectionPromise = null;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
    isConnecting = false;
    return conn;
  } catch (error) {
    isConnecting = false;
    connectionPromise = null;
    console.error('❌ Error connecting to MongoDB:', error.message);
    throw error; // Re-throw to allow callers to handle
  }
};

// Helper function to ensure DB is connected before queries
const ensureConnected = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  
  try {
    await connectDB();
    return true;
  } catch (error) {
    console.error('Failed to ensure database connection:', error);
    return false;
  }
};

// Database models
const College = require('../models/College');
const Company = require('../models/Company');
const JobPosts = require('../models/JobPosts');
const JobApplication = require('../models/JobApplication');
const User = require('../models/User');

// Export models and connection function
module.exports = {
  connectDB,
  ensureConnected,
  College,
  Company,
  JobPosts,
  JobApplication,
  User
};
