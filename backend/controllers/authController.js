const User = require('../models/User');
const College = require('../models/College');
const Company = require('../models/Company');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

// Helper function to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 7 * 60 * 1000); // 7 minutes from now
    
    // Create user
    const user = new User({ 
      email, 
      password: hashedPassword, 
      type: 'college',
      collegeName,
      contactNo,
      isEmailVerified: false,
      otp,
      otpExpiry
    });
    
    await user.save();
    await new College({
      user: user._id,
      collegeName,
      email,
      contactNo
    }).save();

    // Send OTP email
    const emailSent = await emailService.sendOTPEmail(email, otp, collegeName, 'college');
    if (!emailSent) {
      console.error(`Failed to send OTP email to ${email}`);
      // In development mode, log OTP to console for testing
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n⚠️  DEVELOPMENT MODE: OTP for ${email} is: ${otp}\n`);
      }
      // Return error if email fails - user should know about the issue
      return res.status(500).json({
        success: false,
        message: 'Registration successful, but we could not send the verification email. Please check your email configuration (SMTP settings) or contact support. You can try resending the OTP from the verification page.',
        data: {
          userId: user._id,
          email: user.email,
          userType: user.type,
          // In development, include OTP in response for testing
          ...(process.env.NODE_ENV === 'development' && { otp })
        }
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the verification code.',
      data: {
        userId: user._id,
        email: user.email,
        userType: user.type
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
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 7 * 60 * 1000); // 7 minutes from now
    
    // Create user
    const user = new User({ 
      email, 
      password: hashedPassword, 
      type: 'company',
      companyName,
      contactNo,
      industry,
      companySize,
      location,
      isEmailVerified: false,
      otp,
      otpExpiry
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

    // Send OTP email
    const emailSent = await emailService.sendOTPEmail(email, otp, companyName, 'company');
    if (!emailSent) {
      console.error(`Failed to send OTP email to ${email}`);
      // In development mode, log OTP to console for testing
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n⚠️  DEVELOPMENT MODE: OTP for ${email} is: ${otp}\n`);
      }
      // Return error if email fails - user should know about the issue
      return res.status(500).json({
        success: false,
        message: 'Registration successful, but we could not send the verification email. Please check your email configuration (SMTP settings) or contact support. You can try resending the OTP from the verification page.',
        data: {
          userId: user._id,
          email: user.email,
          userType: user.type,
          // In development, include OTP in response for testing
          ...(process.env.NODE_ENV === 'development' && { otp })
        }
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the verification code.',
      data: {
        userId: user._id,
        email: user.email,
        userType: user.type
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
    
    // Check if email is verified (for college and company users, admin is always verified)
    if (user.type !== 'admin' && !user.isEmailVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email before logging in. Check your inbox for the verification code. If you did not receive it, you can resend it from the verification page.',
        requiresVerification: true,
        email: user.email,
        userType: user.type
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

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Find user by email (case-insensitive search)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address. Please check your email or register again.'
      });
    }
    
    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified. You can login directly.'
      });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 7 * 60 * 1000); // 7 minutes from now
    
    // Update user with new OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    
    // Send OTP email
    const userName = user.collegeName || user.companyName || email;
    const userType = user.type;
    
    try {
      const emailSent = await emailService.sendOTPEmail(email, otp, userName, userType);
      
      if (!emailSent) {
        console.error(`Failed to resend OTP email to ${email}`);
        // In development mode, log OTP to console for testing
        if (process.env.NODE_ENV === 'development') {
          console.log(`\n⚠️  DEVELOPMENT MODE: Resend OTP for ${email} is: ${otp}\n`);
        }
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP email. Please check your email configuration (SMTP settings) or contact support. The OTP has been generated and saved, but the email could not be sent.',
          // In development, include OTP in response for testing
          ...(process.env.NODE_ENV === 'development' && { otp })
        });
      }
      
      res.json({
        success: true,
        message: 'OTP has been resent to your email'
      });
    } catch (emailError) {
      console.error('Error in sendOTPEmail:', emailError);
      // Even if email fails, return a response (don't crash)
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please check your email configuration (SMTP settings) or contact support. The OTP has been generated and saved, but the email could not be sent.',
        // In development, include OTP in response for testing
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
    }
  } catch (err) {
    console.error('Resend OTP error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while resending OTP. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }
    
    // Check if OTP exists
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new OTP'
      });
    }
    
    // Check if OTP has expired
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP'
      });
    }
    
    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again'
      });
    }
    
    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Check profile completion
    const ProfileModel = user.type === 'college' ? College : Company;
    const profile = await ProfileModel.findOne({ user: user._id });
    const profileComplete = isProfileComplete(profile, user.type);
    const approvalStatus = profile?.approvalStatus || 'pending';
    
    res.json({
      success: true,
      message: 'Email verified successfully',
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
