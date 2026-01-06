const JobApplication = require('../models/JobApplication');
const JobPosts = require('../models/JobPosts');
const College = require('../models/College');
const Company = require('../models/Company');
const emailService = require('../services/emailService');

// Apply for a job
exports.applyForJob = async (req, res) => {
  try {
    console.log('=== APPLY FOR JOB REQUEST ===');
    console.log('User:', req.user);
    console.log('Job ID:', req.params.jobId);
    console.log('Request body:', req.body);

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

    // Remove studentDetails if it's empty or incomplete (for college applications)
    // Colleges don't need to provide studentDetails - they apply on behalf of students

    const jobId = req.params.jobId;

    // Debug: Log user information
    console.log('=== USER TYPE CHECK ===');
    console.log('req.user:', JSON.stringify(req.user, null, 2));
    console.log('req.user.type:', req.user.type);
    console.log('Type of req.user.type:', typeof req.user.type);

    // Check if user is a college
    if (!req.user || req.user.type !== 'college') {
      return res.status(403).json({
        success: false,
        message: `Only colleges can apply for jobs. Current user type: ${req.user?.type || 'unknown'}`,
        debug: {
          userType: req.user?.type,
          user: req.user
        }
      });
    }

    // Check if college is approved/verified
    const college = await College.findOne({ user: req.user.id });
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College profile not found'
      });
    }

    if (college.approvalStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your college account is not yet approved. Please wait for admin approval before applying to jobs.'
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
      applicant: college._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    // Note: College applications don't require cover letter, resume, or studentDetails
    // Colleges apply on behalf of their students
    // studentDetails will be added in future when colleges can add individual student profiles
    const applicationData = {
      job: jobId,
      applicant: college._id
    };

    // Only include cover letter if provided (optional for college applications)
    if (coverLetter && coverLetter.trim().length > 0) {
      applicationData.coverLetter = coverLetter.trim();
    }

    // Only include resume if provided (optional for college applications)
    if (resume && resume.trim().length > 0) {
      applicationData.resume = resume.trim();
    }

    // Only include studentDetails if ALL required fields are provided
    // This is for future functionality where colleges can add individual student profiles
    if (studentDetails && 
        studentDetails.name && 
        studentDetails.email && 
        studentDetails.phone && 
        studentDetails.course) {
      applicationData.studentDetails = studentDetails;
    }
    // Don't include studentDetails if any required field is missing

    // Other optional fields for future use
    if (academicInfo && Object.keys(academicInfo).length > 0) {
      applicationData.academicInfo = academicInfo;
    }
    if (skills && Array.isArray(skills) && skills.length > 0) {
      applicationData.skills = skills;
    }
    if (technicalSkills && Array.isArray(technicalSkills) && technicalSkills.length > 0) {
      applicationData.technicalSkills = technicalSkills;
    }
    if (projects && Array.isArray(projects) && projects.length > 0) {
      applicationData.projects = projects;
    }
    if (internships && Array.isArray(internships) && internships.length > 0) {
      applicationData.internships = internships;
    }
    if (additionalInfo && Object.keys(additionalInfo).length > 0) {
      applicationData.additionalInfo = additionalInfo;
    }
    if (documents) {
      applicationData.documents = documents;
    }

    const application = new JobApplication(applicationData);
    await application.save();

    // Get company details for email
    const company = await Company.findById(job.company);

    // Send notification emails (optional - only if email service is configured)
    try {
      if (company && company.email) {
        await emailService.sendJobApplicationNotification(
          company.email,
          company.companyName,
          college.collegeName,
          job.title
        );
      }
    } catch (emailError) {
      console.error('Failed to send notification email to company:', emailError);
      // Don't fail the application if email fails
    }

    // Send confirmation email to college (optional)
    try {
      if (college && college.email) {
        await emailService.sendJobApplicationConfirmation(
          college.email,
          college.collegeName,
          job.title,
          company?.companyName || 'A Company'
        );
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email to college:', emailError);
      // Don't fail the application if email fails
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
    console.error('Error applying for job:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + validationErrors.join(', '),
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while processing application'
    });
  }
};

// Get applications for a job (company view)
exports.getJobApplications = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    console.log('=== GET JOB APPLICATIONS ===');
    console.log('Job ID:', jobId);
    console.log('User:', req.user);

    // Check if job exists and user owns it
    const job = await JobPosts.findById(jobId).populate('company', 'user companyName');
    if (!job) {
      console.log('Job not found');
      return res.status(404).json({
        success: false,
        message: 'Job post not found'
      });
    }

    console.log('Job found:', {
      jobCompanyId: job.company?._id,
      jobCompanyUserId: job.company?.user,
      reqUserId: req.user.id,
      userType: req.user.type
    });

    // Check authorization: Only admin or the company that owns the job can view applications
    let isAuthorized = false;
    
    if (req.user.type === 'admin') {
      isAuthorized = true;
    } else if (req.user.type === 'company') {
      // Check if the job's company belongs to this user
      // job.company can be either an ObjectId or a populated Company document
      if (job.company) {
        const companyUserId = job.company.user?.toString() || job.company.user;
        const companyId = job.company._id?.toString() || job.company.toString();
        
        // Check if company.user matches req.user.id, or if company._id matches req.user.id (fallback)
        if (companyUserId === req.user.id || companyId === req.user.id) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      console.log('Authorization failed');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job'
      });
    }

    console.log('Authorization passed');

    const { page = 1, limit = 10, status } = req.query;
    
    let query = { job: jobId };
    
    if (status) {
      query.status = status;
    }

    const applications = await JobApplication.find(query)
      .populate('applicant', 'collegeName email contactNo collegeCity tpoName tpoContactNo universityAffiliation courses numStudents highestCGPA avgCTC avgPlaced placementPercent grade linkedinProfile collegeWebsite')
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
    let collegeId = req.params.collegeId;
    
    // If no collegeId provided, find college for current user
    if (!collegeId) {
      if (req.user.type !== 'college') {
        return res.status(403).json({
          success: false,
          message: 'Only colleges can view their applications'
        });
      }
      const college = await College.findOne({ user: req.user.id });
      if (!college) {
        return res.status(404).json({
          success: false,
          message: 'College profile not found'
        });
      }
      collegeId = college._id;
    }
    
    // Check if user is authorized (only admin can view other colleges' applications)
    if (req.user.type !== 'admin') {
      if (req.user.type === 'college') {
        const college = await College.findOne({ user: req.user.id });
        if (!college || college._id.toString() !== collegeId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to view these applications'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view these applications'
        });
      }
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
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'user companyName'
        }
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the job
    let isAuthorized = false;
    
    if (req.user.type === 'admin') {
      isAuthorized = true;
    } else if (req.user.type === 'company' && application.job?.company) {
      const companyUserId = application.job.company.user?.toString() || application.job.company.user;
      const companyId = application.job.company._id?.toString() || application.job.company.toString();
      
      if (companyUserId === req.user.id || companyId === req.user.id) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
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
    console.log('=== GET APPLICATION BY ID ===');
    console.log('Application ID:', applicationId);
    console.log('User:', req.user);

    const application = await JobApplication.findById(applicationId)
      .populate({
        path: 'job',
        select: 'title company location salary jobType requirements description requiredSkills',
        populate: {
          path: 'company',
          select: 'companyName logo industry website user'
        }
      })
      .populate('applicant', 'collegeName email contactNo collegeCity tpoName tpoContactNo universityAffiliation courses numStudents highestCGPA avgCTC avgPlaced placementPercent grade linkedinProfile collegeWebsite');

    if (!application) {
      console.log('Application not found');
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    console.log('Application found:', {
      jobCompany: application.job?.company?._id,
      applicantId: application.applicant?._id,
      userType: req.user.type,
      userId: req.user.id
    });

    // Check if user is authorized to view this application
    let isAuthorized = req.user.type === 'admin';
    
    // Check if user owns the job (company)
    if (req.user.type === 'company' && application.job?.company) {
      // Company is populated, check if the company's user field matches
      const companyUserId = application.job.company.user?.toString() || application.job.company._id.toString();
      if (companyUserId === req.user.id || application.job.company._id.toString() === req.user.id) {
        isAuthorized = true;
      }
    }
    
    // Check if user is the applicant (college)
    if (req.user.type === 'college') {
      const college = await College.findOne({ user: req.user.id });
      if (college && application.applicant && application.applicant._id.toString() === college._id.toString()) {
        isAuthorized = true;
      }
    }

    console.log('Authorization check:', { isAuthorized });

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
    console.error('Error in getApplicationById:', error);
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
    // Find the college for this user
    if (req.user.type !== 'college') {
      return res.status(403).json({
        success: false,
        message: 'Only colleges can withdraw applications'
      });
    }
    
    const college = await College.findOne({ user: req.user.id });
    if (!college || application.applicant.toString() !== college._id.toString()) {
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

