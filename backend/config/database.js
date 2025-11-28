const mongoose = require('mongoose');

// Database configuration
let isConnecting = false;
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    if (isConnecting) {
      return;
    }
    isConnecting = true;

    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn('MONGO_URI is not set. Skipping DB connection.');
      isConnecting = false;
      return;
    }

    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    const conn = await mongoose.connect(uri, options);

    console.log(`MongoDB Connected: ${conn.connection.host} (${process.env.NODE_ENV} mode)`);
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  } finally {
    isConnecting = false;
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
  College,
  Company,
  JobPosts,
  JobApplication,
  User
};
