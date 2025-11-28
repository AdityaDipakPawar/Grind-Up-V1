const College = require('../models/College');
const Company = require('../models/Company');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary, getDownloadUrl } = require('../utils/cloudinaryUpload');

exports.createProfile = async (req, res) => {
  try {
    const model = req.user.type === 'college' ? College : Company;
    const doc = await model.findOneAndUpdate(
      { user: req.user.id },
      { ...req.body, user: req.user.id },
      { new: true, upsert: true }
    );
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    // console.log('getMyProfile - req.user:', req.user);
    const model = req.user.type === 'college' ? College : Company;
    // console.log('getMyProfile - looking up with user id:', req.user.id, 'type:', req.user.type);
    let doc = await model.findOne({ user: req.user.id });
    // console.log('getMyProfile - found doc:', doc);
    
    // If profile record exists, return it
    if (doc) {
      return res.json({ success: true, data: doc });
    }
    
    // If no profile record exists, fetch user data (registration data) and return as profile template
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // console.log('getMyProfile - no profile found, using user registration data');
    // Return registration data as pre-filled profile template
    if (req.user.type === 'college') {
      return res.json({ 
        success: true, 
        data: { 
          user: req.user.id,
          collegeName: user.collegeName || '',
          contactNo: user.contactNo || '',
          collegeCity: '',
          grade: '',
          tpoName: '',
          tpoContactNo: '',
          universityAffiliation: '',
          courses: '',
          numStudents: '',
          highestCGPA: '',
          avgCTC: '',
          avgPlaced: '',
          placementPercent: ''
        } 
      });
    } else {
      return res.json({ 
        success: true, 
        data: { 
          user: req.user.id,
          companyName: user.companyName || '',
          contactNo: user.contactNo || '',
          industry: user.industry || '',
          companySize: user.companySize || '',
          location: user.location || ''
        } 
      });
    }
  } catch (err) {
    console.error('getMyProfile error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const model = req.user.type === 'college' ? College : Company;
    const doc = await model.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, upsert: true }
    );
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const model = req.user.type === 'college' ? College : Company;
    const doc = await model.findOneAndDelete({ user: req.user.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Upload placement records (Excel file to Cloudinary)
exports.uploadPlacementRecords = async (req, res) => {
  try {
    // Only colleges can upload placement records
    if (req.user.type !== 'college') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only colleges can upload placement records' 
      });
    }

    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file provided' 
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, 'raw');

    // Get download URL with forced attachment
    const downloadUrl = getDownloadUrl(uploadResult.secure_url);

    // Update college profile with the Cloudinary URL
    const college = await College.findOneAndUpdate(
      { user: req.user.id },
      {
        placementRecordUrl: downloadUrl,
        placementRecordUploadedAt: new Date(),
      },
      { new: true }
    );

    if (!college) {
      return res.status(404).json({ 
        success: false, 
        message: 'College profile not found' 
      });
    }

    res.json({
      success: true,
      message: 'Placement records uploaded successfully',
      data: {
        placementRecordUrl: college.placementRecordUrl,
        placementRecordUploadedAt: college.placementRecordUploadedAt,
      },
    });
  } catch (err) {
    console.error('Placement record upload error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload placement records', 
      error: err.message 
    });
  }
};

// Delete placement records
exports.deletePlacementRecords = async (req, res) => {
  try {
    // Only colleges can delete placement records
    if (req.user.type !== 'college') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only colleges can delete placement records' 
      });
    }

    // Get current college profile
    const college = await College.findOne({ user: req.user.id });
    if (!college || !college.placementRecordUrl) {
      return res.status(404).json({ 
        success: false, 
        message: 'No placement records found' 
      });
    }

    // Extract public ID from URL for deletion
    // URL format: https://res.cloudinary.com/[cloud]/raw/upload/[public_id].[ext]
    const urlParts = college.placementRecordUrl.split('/');
    const fileWithExt = urlParts[urlParts.length - 1];
    const publicId = `placement-records/${fileWithExt.split('.')[0]}`;

    // Delete from Cloudinary
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    // Update college profile to remove the URL
    const updatedCollege = await College.findOneAndUpdate(
      { user: req.user.id },
      {
        placementRecordUrl: null,
        placementRecordUploadedAt: null,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Placement records deleted successfully',
      data: updatedCollege,
    });
  } catch (err) {
    console.error('Placement record deletion error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete placement records', 
      error: err.message 
    });
  }
};
