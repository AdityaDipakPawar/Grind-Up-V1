const User = require('../models/User');
const College = require('../models/College');
const Company = require('../models/Company');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// College Registration
exports.registerCollege = async (req, res) => {
  try {
    const { password, collegeName, email, contactNo } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({ 
      email, 
      password: hashedPassword, 
      type: 'college',
      collegeName,
      contactNo
    });
    
    await user.save();
    await new College({
      user: user._id,
      collegeName,
      email,
      contactNo
    }).save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, type: user.type }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'College registration successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          type: user.type,
          collegeName: user.collegeName
        }
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Company Registration
exports.registerCompany = async (req, res) => {
  try {
    const { companyName, password, email, contactNo, industry, companySize, location } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({ 
      email, 
      password: hashedPassword, 
      type: 'company',
      companyName,
      contactNo,
      industry,
      companySize,
      location
    });
    
    await user.save();
    await new Company({
      user: user._id,
      companyName,
      email,
      contactNo,
      industry,
      companySize,
      location
    }).save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, type: user.type }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Company registration successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          type: user.type,
          companyName: user.companyName
        }
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, type: user.type }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          type: user.type,
          collegeName: user.collegeName,
          companyName: user.companyName
        }
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        type: user.type,
        collegeName: user.collegeName,
        companyName: user.companyName
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
}; 
