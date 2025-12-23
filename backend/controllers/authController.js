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
          collegeName: user.collegeName,
          profileComplete: false,
          approvalStatus: 'pending'
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

// Admin Registration (protected by ADMIN_SIGNUP_KEY)
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password, adminKey } = req.body;

    if (!process.env.ADMIN_SIGNUP_KEY) {
      return res.status(500).json({ success: false, message: 'Admin signup is not configured' });
    }
    if (!adminKey || adminKey !== process.env.ADMIN_SIGNUP_KEY) {
      return res.status(403).json({ success: false, message: 'Invalid admin key' });
    }
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, type: 'admin' });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin registration successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          type: user.type,
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
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
          companyName: user.companyName,
          profileComplete: false,
          approvalStatus: 'pending'
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
    
    // Check profile completion for login
    const ProfileModel = user.type === 'college' ? College : Company;
    const profile = await ProfileModel.findOne({ user: user._id });
    const profileComplete = isProfileComplete(profile, user.type);
    const approvalStatus = profile?.approvalStatus || 'pending';
    
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
          companyName: user.companyName,
          profileComplete,
          approvalStatus
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

// Helper function to check if profile is complete
const isProfileComplete = (profile, userType) => {
  if (!profile) return false;
  
  if (userType === 'college') {
    // College profile is complete when ALL fields are filled
    return !!(
      profile.collegeName && 
      profile.contactNo && 
      profile.collegeCity && 
      profile.grade && 
      profile.tpoName && 
      profile.tpoContactNo && 
      profile.universityAffiliation && 
      profile.courses && 
      profile.numStudents && 
      profile.highestCGPA && 
      profile.avgCTC && 
      profile.avgPlaced && 
      profile.placementPercent && 
      profile.placementRecordUrl
    );
  } else if (userType === 'company') {
    // Company profile is complete when ALL fields are filled
    return !!(
      profile.companyName && 
      profile.contactNo && 
      profile.industry && 
      profile.companySize && 
      profile.location && 
      profile.recruiterName && 
      profile.recruiterEmail && 
      profile.companyBio && 
      profile.yearsOfExperience
    );
  }
  return false;
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const { id, type } = req.user;
    // console.log('getMe - Getting user with id:', id, 'type:', type);
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      // console.log('getMe - User not found with id:', id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check profile completion
    const ProfileModel = type === 'college' ? College : Company;
    const profile = await ProfileModel.findOne({ user: id });
    const profileComplete = isProfileComplete(profile, type);
    const approvalStatus = profile?.approvalStatus || 'pending';
    
    // console.log('getMe - Found user:', user);
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        type: user.type,
        collegeName: user.collegeName,
        companyName: user.companyName,
        profileComplete,
        approvalStatus
      }
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Check profile completion status
exports.checkProfileCompletion = async (req, res) => {
  try {
    const { id, type } = req.user;
    
    const ProfileModel = type === 'college' ? College : Company;
    const profile = await ProfileModel.findOne({ user: id });
    
    const profileComplete = isProfileComplete(profile, type);
    
    res.json({
      success: true,
      profileComplete,
      missingFields: getMissingFields(profile, type)
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Helper to get missing fields for profile completion
const getMissingFields = (profile, userType) => {
  const missing = [];
  
  if (userType === 'college') {
    if (!profile?.tpoName) missing.push('TPO Name');
    if (!profile?.collegeCity) missing.push('College City');
    if (!profile?.avgCTC) missing.push('Average CTC');
    if (!profile?.placementPercent) missing.push('Placement Percentage');
    if (!profile?.placementRecordUrl) missing.push('Placement Record');
  } else if (userType === 'company') {
    if (!profile?.recruiterName) missing.push('Recruiter Name');
    if (!profile?.recruiterEmail) missing.push('Recruiter Email');
    if (!profile?.companyBio) missing.push('Company Bio');
    if (!profile?.yearsOfExperience) missing.push('Years of Experience');
  }
  
  return missing;
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
