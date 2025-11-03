const mongoose = require('mongoose');

// Database configuration
const connectDB = async () => {
  try {
    // Production-ready MongoDB connection options
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://skilledengineer71:grindup@grindup.onp2z1p.mongodb.net/?appName=Grindup', options);

    console.log(`MongoDB Connected: ${conn.connection.host} (${process.env.NODE_ENV} mode)`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
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
