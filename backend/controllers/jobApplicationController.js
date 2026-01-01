const JobApplication = require('../models/JobApplication');
const JobPosts = require('../models/JobPosts');
const College = require('../models/College');
const Company = require('../models/Company');
const emailService = require('../services/emailService');

// Apply for a job
exports.applyForJob = async (req, res) => {
  try {
    const {
      coverLetter,
      resume,
      studentDetails,
      academicInfo,
      skills,
      technicalSkills,
      projects,
      internships,
      additionalInfo,
      documents
    } = req.body;

    const jobId = req.params.jobId;

    // Check if user is a college
    if (req.user.type !== 'college') {
      return res.status(403).json({
        success: false,
        message: 'Only colleges can apply for jobs'
      });
    }

    // Check if job exists
    const job = await JobPosts.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job post not found'
      });
    }

    // Check if job is still active
    if (job.status !== 'active' || !job.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }

    // Check if application deadline has passed
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check if already applied
    const existingApplication = await JobApplication.findOne({
      job: jobId,
      applicant: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const application = new JobApplication({
      job: jobId,
      applicant: req.user.id,
      coverLetter,
      resume,
      studentDetails,
      academicInfo,
      skills,
      technicalSkills,
      projects,
      internships,
      additionalInfo,
      documents
    });

    await application.save();

    // Get company details for email
    const company = await Company.findById(job.company);

    // Send notification emails
    if (company && company.email) {
      await emailService.sendJobApplicationNotification(
        company.email,
        company.companyName,
        req.user.collegeName,
        job.title
      );
    }

    // Send confirmation email to college
    const college = await College.findOne({ user: req.user.id });
    if (college && college.email) {
      await emailService.sendJobApplicationConfirmation(
        college.email,
        college.collegeName,
        job.title,
        company?.companyName || 'A Company'
      );
    }

    // Update job post statistics
    await JobPosts.findByIdAndUpdate(jobId, {
      $inc: { 'stats.totalApplications': 1 }
    });

    // Populate the application with job and college details
    await application.populate('job', 'title company');
    await application.populate('applicant', 'collegeName email');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get applications for a job (company view)
exports.getJobApplications = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // Check if job exists and user owns it
    const job = await JobPosts.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job post not found'
      });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job'
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    
    let query = { job: jobId };
    
    if (status) {
      query.status = status;
    }

    const applications = await JobApplication.find(query)
      .populate('applicant', 'collegeName email contactNo universityAffiliation')
      .populate('job', 'title')
      .sort({ appliedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await JobApplication.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
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

// Get applications by college
exports.getCollegeApplications = async (req, res) => {
  try {
    const collegeId = req.params.collegeId || req.user.id;
    
    // Check if user is authorized
    if (req.user.id !== collegeId && req.user.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these applications'
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    
    let query = { applicant: collegeId };
    
    if (status) {
      query.status = status;
    }

    const applications = await JobApplication.find(query)
      .populate('job', 'title company location salary jobType')
      .populate('job.company', 'companyName logo industry')
      .sort({ appliedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await JobApplication.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
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

// Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, feedback, notes } = req.body;
    const applicationId = req.params.applicationId;

    const application = await JobApplication.findById(applicationId)
      .populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the job
    if (application.job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Update application
    application.status = status;
    if (feedback) application.feedback = feedback;
    if (notes) application.notes = notes;

    // Update process tracking
    const now = new Date();
    switch (status) {
      case 'under-review':
        application.processTracking.underReview = now;
        break;
      case 'shortlisted':
        application.processTracking.shortlisted = now;
        break;
      case 'interview-scheduled':
        application.processTracking.interviewScheduled = now;
        break;
      case 'interviewed':
        application.processTracking.interviewed = now;
        break;
      case 'accepted':
        application.processTracking.finalDecision = now;
        application.processTracking.decision = 'accepted';
        break;
      case 'rejected':
        application.processTracking.finalDecision = now;
        application.processTracking.decision = 'rejected';
        break;
    }

    await application.save();

    // Update job post statistics
    const jobId = application.job._id;
    const updateStats = {};
    
    switch (status) {
      case 'shortlisted':
        updateStats['stats.shortlisted'] = 1;
        break;
      case 'interviewed':
        updateStats['stats.interviewed'] = 1;
        break;
      case 'accepted':
        updateStats['stats.hired'] = 1;
        break;
      case 'rejected':
        updateStats['stats.rejected'] = 1;
        break;
    }

    if (Object.keys(updateStats).length > 0) {
      await JobPosts.findByIdAndUpdate(jobId, { $inc: updateStats });
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get application by ID
exports.getApplicationById = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;

    const application = await JobApplication.findById(applicationId)
      .populate('job', 'title company location salary jobType requirements')
      .populate('job.company', 'companyName logo industry website')
      .populate('applicant', 'collegeName email contactNo universityAffiliation');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized to view this application
    const isAuthorized = 
      application.applicant._id.toString() === req.user.id ||
      application.job.company._id.toString() === req.user.id ||
      req.user.type === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Withdraw application
exports.withdrawApplication = async (req, res) => {
  try {
    const { reason } = req.body;
    const applicationId = req.params.applicationId;

    const application = await JobApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is the applicant
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }

    // Check if application can be withdrawn
    if (application.status === 'accepted' || application.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw application that has been accepted or rejected'
      });
    }

    // Update application
    application.status = 'withdrawn';
    application.isWithdrawn = true;
    application.withdrawnAt = new Date();
    application.withdrawnReason = reason;

    await application.save();

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get application statistics
exports.getApplicationStats = async (req, res) => {
  try {
    const { jobId, collegeId } = req.query;
    
    let matchQuery = {};
    
    if (jobId) {
      matchQuery.job = jobId;
    }
    
    if (collegeId) {
      matchQuery.applicant = collegeId;
    }

    const stats = await JobApplication.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = await JobApplication.countDocuments(matchQuery);

    res.json({
      success: true,
      data: {
        stats,
        totalApplications
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

