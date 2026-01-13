const College = require('../models/College');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new college
exports.registerCollege = async (req, res) => {
  try {
    const {
      collegeName,
      email,
      password,
      contactNo,
    } = req.body;

    // Check if college already exists
    const existingCollege = await College.findOne({ 
      $or: [{ email }, { collegeName }] 
    });
    
    if (existingCollege) {
      return res.status(400).json({
        success: false,
        message: 'College with this email or name already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create college
    const college = new College({
      collegeName,
      email,
      password: hashedPassword,
      contactNo,
      
    });

    await college.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: college._id, 
        email: college.email, 
        type: 'college' 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      message: 'College registered successfully',
      data: {
        token,
        college: {
          id: college._id,
          collegeName: college.collegeName,
          email: college.email,
          type: 'college'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Login college
exports.loginCollege = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find college
    const college = await College.findOne({ email });
    if (!college) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, college.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: college._id, 
        email: college.email, 
        type: 'college' 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        college: {
          id: college._id,
          collegeName: college.collegeName,
          email: college.email,
          type: 'college'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all colleges
exports.getAllColleges = async (req, res) => {
  try {
    const { page = 1, limit = 100, search, state, city, approvedOnly } = req.query;
    
    // Show all non-rejected colleges by default (pending + approved)
    // Companies can invite colleges regardless of approval status
    // Admins can filter by passing approvedOnly=true to see only approved
    let query = {};
    
    if (approvedOnly === 'true' || approvedOnly === true) {
      // Only show approved colleges
      query.approvalStatus = 'approved';
    } else {
      // Default: show all non-rejected colleges (pending + approved)
      query.approvalStatus = { $in: ['pending', 'approved'] };
    }
    
    if (search) {
      query.$or = [
        { collegeName: new RegExp(search, 'i') },
        { universityAffiliation: new RegExp(search, 'i') },
        { collegeCity: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    
    if (state) {
      query.collegeCity = new RegExp(state, 'i');
    }
    
    if (city) {
      query.collegeCity = new RegExp(city, 'i');
    }

    const colleges = await College.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await College.countDocuments(query);

    res.json({
      success: true,
      data: {
        colleges,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get college by ID
exports.getCollegeById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id)
      .select('-password');

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    res.json({
      success: true,
      data: college
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update college profile
exports.updateCollege = async (req, res) => {
  try {
    const collegeId = req.params.id;
    
    // Check if user is authorized to update this college
    if (req.user.id !== collegeId && req.user.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this college'
      });
    }

    const updatedCollege = await College.findByIdAndUpdate(
      collegeId,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedCollege) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    res.json({
      success: true,
      message: 'College updated successfully',
      data: updatedCollege
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete college
exports.deleteCollege = async (req, res) => {
  try {
    const collegeId = req.params.id;
    
    // Check if user is authorized to delete this college
    if (req.user.id !== collegeId && req.user.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this college'
      });
    }

    const college = await College.findByIdAndDelete(collegeId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    res.json({
      success: true,
      message: 'College deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get current college profile
exports.getCurrentCollege = async (req, res) => {
  try {
    const college = await College.findById(req.user.id)
      .select('-password');

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    res.json({
      success: true,
      data: college
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

