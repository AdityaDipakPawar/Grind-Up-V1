const mongoose = require('mongoose');

const jobPostsSchema = new mongoose.Schema({
  // Job Basic Information
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 5000
  },
  shortDescription: { 
    type: String,
    maxlength: 500
  },
  
  // Company Reference
  company: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },
  
  // Job Details
  jobType: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    required: true,
    default: 'full-time'
  },
  workMode: { 
    type: String, 
    enum: ['onsite', 'remote', 'hybrid'],
    required: true,
    default: 'onsite'
  },
  
  // Location Information
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    address: { type: String },
    isRemote: { type: Boolean, default: false }
  },
  
  // Salary Information
  salary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'INR' },
    period: { type: String, enum: ['per-annum', 'per-month', 'per-hour'], default: 'per-annum' },
    isNegotiable: { type: Boolean, default: false },
    additionalBenefits: [{ type: String }]
  },
  
  // Experience & Education
  experience: {
    min: { type: Number, default: 0 },
    max: { type: Number },
    level: { 
      type: String, 
      enum: ['fresher', 'entry-level', 'mid-level', 'senior-level', 'executive'],
      default: 'fresher'
    }
  },
  education: {
    required: { type: String, enum: ['10th', '12th', 'diploma', 'bachelor', 'master', 'phd'] },
    preferred: [{ type: String }],
    specialization: [{ type: String }]
  },
  
  // Skills & Requirements
  requiredSkills: [{ 
    type: String
  }],
  preferredSkills: [{ 
    type: String 
  }],
  technicalSkills: [{ 
    type: String 
  }],
  softSkills: [{ 
    type: String 
  }],
  
  // Job Requirements
  requirements: { 
    type: String,
    maxlength: 2000
  },
  responsibilities: [{ 
    type: String 
  }],
  qualifications: [{ 
    type: String 
  }],
  
  // Application Details
  vacancies: { 
    type: Number, 
    required: true,
    min: 1,
    default: 1
  },
  applicationDeadline: { 
    type: Date,
    required: true
  },
  applicationProcess: { 
    type: String,
    enum: ['direct', 'campus', 'referral', 'walk-in'],
    default: 'direct'
  },
  
  // Job Status
  status: { 
    type: String, 
    enum: ['active', 'paused', 'closed', 'draft'],
    default: 'active'
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  
  // Application Statistics
  stats: {
    totalApplications: { type: Number, default: 0 },
    shortlisted: { type: Number, default: 0 },
    interviewed: { type: Number, default: 0 },
    hired: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 }
  },
  
  // Job Categories & Tags
  category: { 
    type: String,
    required: true
  },
  subcategory: { 
    type: String 
  },
  tags: [{ 
    type: String 
  }],
  
  // Additional Information
  benefits: [{ 
    type: String 
  }],
  perks: [{ 
    type: String 
  }],
  workEnvironment: { 
    type: String,
    maxlength: 1000
  },
  
  // Contact Information
  contactPerson: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    designation: { type: String }
  },
  
  // Application Instructions
  applicationInstructions: { 
    type: String,
    maxlength: 1000
  },
  documentsRequired: [{ 
    type: String 
  }],
  
  // SEO & Search
  keywords: [{ 
    type: String 
  }],
  searchableText: { 
    type: String 
  },
  
  // Timestamps
  postedAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date 
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
jobPostsSchema.index({ company: 1 });
jobPostsSchema.index({ status: 1 });
jobPostsSchema.index({ isActive: 1 });
jobPostsSchema.index({ 'location.city': 1 });
jobPostsSchema.index({ 'location.state': 1 });
jobPostsSchema.index({ category: 1 });
jobPostsSchema.index({ jobType: 1 });
jobPostsSchema.index({ 'experience.level': 1 });
jobPostsSchema.index({ postedAt: -1 });
jobPostsSchema.index({ applicationDeadline: 1 });
jobPostsSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });

// Pre-save middleware to update searchableText
jobPostsSchema.pre('save', function(next) {
  this.searchableText = `${this.title} ${this.description} ${this.requiredSkills.join(' ')} ${this.preferredSkills.join(' ')}`;
  this.updatedAt = new Date();
  next();
});

// Virtual for days until deadline
jobPostsSchema.virtual('daysUntilDeadline').get(function() {
  if (!this.applicationDeadline) return null;
  const now = new Date();
  const deadline = new Date(this.applicationDeadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for salary range display
jobPostsSchema.virtual('salaryRange').get(function() {
  if (!this.salary.min && !this.salary.max) return 'Not specified';
  if (this.salary.min && this.salary.max) {
    return `${this.salary.currency} ${this.salary.min} - ${this.salary.max} ${this.salary.period}`;
  }
  if (this.salary.min) {
    return `${this.salary.currency} ${this.salary.min}+ ${this.salary.period}`;
  }
  return `${this.salary.currency} Up to ${this.salary.max} ${this.salary.period}`;
});

module.exports = mongoose.model('JobPosts', jobPostsSchema);

