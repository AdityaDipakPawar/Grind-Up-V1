const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  // Basic Information
  companyName: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true
  },
  password: { 
    type: String 
  },
  
  // Contact Information
  contactNo: { 
    type: String, 
    required: true,
    trim: true 
  },
  // alternateContactNo: { 
  //   type: String,
  //   trim: true 
  // },
  // website: { 
  //   type: String,
  //   trim: true 
  // },
  
  // Address Information
  // address: {
  //   street: { type: String, required: true },
  //   city: { type: String, required: true },
  //   state: { type: String, required: true },
  //   pincode: { type: String, required: true },
  //   country: { type: String, default: 'India' }
  // },
  
  // Company Details
  industry: { 
    type: String, 
    required: true 
  },
  companySize: { 
    type: String, 
    // enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  // foundedYear: { 
  //   type: Number 
  // },
  // companyType: { 
  //   type: String, 
  //   enum: ['startup', 'mnc', 'government', 'private', 'public'],
  //   default: 'private'
  // },
  
  // Business Information
  // description: { 
  //   type: String,
  //   maxlength: 2000
  // },
  // mission: { 
  //   type: String,
  //   maxlength: 1000
  // },
  // vision: { 
  //   type: String,
  //   maxlength: 1000
  // },
  
  // HR Information
  // hrDetails: {
  //   name: { type: String, required: true },
  //   email: { type: String, required: true },
  //   contactNo: { type: String, required: true },
  //   designation: { type: String, default: 'HR Manager' }
  // },
  
  // Company Culture
  // workCulture: {
  //   workFromHome: { type: Boolean, default: false },
  //   flexibleHours: { type: Boolean, default: false },
  //   dressCode: { type: String, enum: ['formal', 'casual', 'smart-casual'] },
  //   teamSize: { type: String }
  // },
  
  // Benefits & Perks
  // benefits: [{
  //   benefitType: { type: String, required: true },
  //   description: { type: String },
  //   isOffered: { type: Boolean, default: true }
  // }],
  
  // Technology Stack
  // techStack: [{ 
  //   type: String 
  // }],
  
  // Hiring Preferences
  // hiringPreferences: {
  //   preferredColleges: [{ type: String }],
  //   preferredCourses: [{ type: String }],
  //   minimumCGPA: { type: String },
  //   preferredSkills: [{ type: String }],
  //   experienceLevel: { 
  //     type: String, 
  //     enum: ['fresher', '0-2', '2-5', '5-10', '10+'],
  //     default: 'fresher'
  //   }
  // },
  
  // Verification Status
  // isVerified: { 
  //   type: Boolean, 
  //   default: false 
  // },
  // verificationDocuments: [{
  //   documentType: { type: String },
  //   documentUrl: { type: String },
  //   uploadedAt: { type: Date, default: Date.now }
  // }],
  
  // Status
  // isActive: { 
  //   type: Boolean, 
  //   default: true 
  // },
  
  // Social Media
  // socialMedia: {
  //   linkedin: { type: String },
  //   facebook: { type: String },
  //   twitter: { type: String },
  //   instagram: { type: String }
  // },
  
  // Company Logo and Images
  // logo: { 
  //   type: String 
  // },
//   gallery: [{
//     imageUrl: { type: String },
//     caption: { type: String },
//     uploadedAt: { type: Date, default: Date.now }
//   }]
// }
}, { 
  timestamps: true 
});

// Index for better query performance (email and companyName already have unique indexes)
// companySchema.index({ industry: 1 });
// companySchema.index({ 'address.city': 1 });
// companySchema.index({ 'address.state': 1 });
// companySchema.index({ companySize: 1 });

module.exports = mongoose.model('Company', companySchema);
