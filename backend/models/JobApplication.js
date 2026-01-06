const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  // Job Reference
  job: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'JobPosts', 
    required: true 
  },
  
  // Applicant Reference (College)
  applicant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'College', 
    required: true 
  },
  
  // Application Status
  status: { 
    type: String, 
    enum: ['applied', 'under-review', 'shortlisted', 'interview-scheduled', 'interviewed', 'accepted', 'rejected', 'withdrawn'],
    default: 'applied' 
  },
  
  // Application Details
  appliedAt: { 
    type: Date, 
    default: Date.now 
  },
  coverLetter: { 
    type: String,
    maxlength: 2000
  },
  resume: { 
    type: String 
  },
  
  // Student Information (Optional - for future individual student applications)
  // Currently, colleges apply on behalf of their students, so this entire field is optional
  // When colleges add individual student profiles in the future, they can include studentDetails
  studentDetails: {
    name: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    course: { type: String, required: false },
    specialization: { type: String, required: false },
    currentYear: { type: String, required: false },
    expectedGraduation: { type: Date, required: false },
    cgpa: { type: String, required: false },
    percentage: { type: String, required: false }
  },
  
  // Academic Information
  academicInfo: {
    tenthPercentage: { type: String },
    twelfthPercentage: { type: String },
    graduationPercentage: { type: String },
    mastersPercentage: { type: String },
    backlogs: { type: Number, default: 0 },
    gapYears: { type: Number, default: 0 }
  },
  
  // Skills & Experience
  skills: [{ 
    type: String 
  }],
  technicalSkills: [{ 
    type: String 
  }],
  projects: [{
    projectName: { type: String },
    description: { type: String },
    technologies: [{ type: String }],
    duration: { type: String },
    role: { type: String }
  }],
  internships: [{
    companyName: { type: String },
    position: { type: String },
    duration: { type: String },
    description: { type: String }
  }],
  
  // Additional Information
  additionalInfo: {
    languages: [{ 
      language: { type: String },
      proficiency: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'native'] }
    }],
    certifications: [{ 
      name: { type: String },
      issuer: { type: String },
      date: { type: Date }
    }],
    achievements: [{ 
      type: String 
    }],
    hobbies: [{ 
      type: String 
    }]
  },
  
  // Application Process Tracking
  processTracking: {
    applicationReceived: { type: Date, default: Date.now },
    underReview: { type: Date },
    shortlisted: { type: Date },
    interviewScheduled: { type: Date },
    interviewed: { type: Date },
    finalDecision: { type: Date },
    decision: { type: String, enum: ['accepted', 'rejected', 'pending'] }
  },
  
  // Interview Details
  interviewDetails: {
    scheduledDate: { type: Date },
    interviewType: { type: String, enum: ['online', 'offline', 'phone'] },
    interviewRounds: [{ 
      roundName: { type: String },
      scheduledDate: { type: Date },
      completedDate: { type: Date },
      status: { type: String, enum: ['scheduled', 'completed', 'cancelled'] },
      feedback: { type: String },
      score: { type: Number }
    }],
    interviewer: { 
      name: { type: String },
      email: { type: String },
      designation: { type: String }
    }
  },
  
  // Documents
  documents: [{
    documentType: { type: String, required: true },
    documentName: { type: String, required: true },
    documentUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Communication
  communications: [{
    type: { type: String, enum: ['email', 'phone', 'message'], required: true },
    direction: { type: String, enum: ['incoming', 'outgoing'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    sender: { type: String },
    recipient: { type: String }
  }],
  
  // Notes & Feedback
  notes: { 
    type: String,
    maxlength: 1000
  },
  feedback: { 
    type: String,
    maxlength: 1000
  },
  rejectionReason: { 
    type: String 
  },
  
  // Status Flags
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isWithdrawn: { 
    type: Boolean, 
    default: false 
  },
  withdrawnAt: { 
    type: Date 
  },
  withdrawnReason: { 
    type: String 
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
jobApplicationSchema.index({ job: 1 });
jobApplicationSchema.index({ applicant: 1 });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ appliedAt: -1 });
jobApplicationSchema.index({ 'studentDetails.email': 1 });
jobApplicationSchema.index({ 'processTracking.finalDecision': 1 });

// Compound indexes
jobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
jobApplicationSchema.index({ job: 1, status: 1 });
jobApplicationSchema.index({ applicant: 1, status: 1 });

module.exports = mongoose.model('JobApplication', jobApplicationSchema); 