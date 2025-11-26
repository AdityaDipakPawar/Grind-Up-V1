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
    
    let token, responseUser;

    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }
      token = jwt.sign(
        { id: user._id, email: user.email, type: user.type },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      responseUser = {
        id: user._id,
        email: user.email,
        type: user.type,
        collegeName: user.collegeName,
        companyName: user.companyName
      };
    } else {
      const college = await College.findOne({ email });
      if (college) {
        const isMatch = await bcrypt.compare(password, college.password);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
        token = jwt.sign(
          { id: college._id, email: college.email, type: 'college' },
          process.env.JWT_SECRET,
          { expiresIn: '1d' }
        );
        responseUser = {
          id: college._id,
          email: college.email,
          type: 'college',
          collegeName: college.collegeName
        };
      } else {
        const company = await Company.findOne({ email });
        if (!company) {
          return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, company.password);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
        token = jwt.sign(
          { id: company._id, email: company.email, type: 'company' },
          process.env.JWT_SECRET,
          { expiresIn: '1d' }
        );
        responseUser = {
          id: company._id,
          email: company.email,
          type: 'company',
          companyName: company.companyName
        };
      }
    }

    res.json({ success: true, message: 'Login successful', data: { token, user: responseUser } });
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
    const { id, type } = req.user;
    let entity;
    if (type === 'college') {
      entity = await College.findById(id).select('-password');
      if (!entity) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.json({
        success: true,
        user: {
          id: entity._id,
          email: entity.email,
          type: 'college',
          collegeName: entity.collegeName
        }
      });
    }
    if (type === 'company') {
      entity = await Company.findById(id).select('-password');
      if (!entity) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.json({
        success: true,
        user: {
          id: entity._id,
          email: entity.email,
          type: 'company',
          companyName: entity.companyName
        }
      });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({
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
