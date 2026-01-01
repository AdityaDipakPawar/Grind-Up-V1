const JobPosts = require('../models/JobPosts');
const Company = require('../models/Company');

// Create a new job post
exports.createJobPost = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      jobType,
      workMode,
      location,
      salary,
      experience,
      education,
      requiredSkills,
      preferredSkills,
      technicalSkills,
      softSkills,
      requirements,
      responsibilities,
      qualifications,
      vacancies,
      applicationDeadline,
      applicationProcess,
      category,
      subcategory,
      tags,
      benefits,
      perks,
      workEnvironment,
      contactPerson,
      applicationInstructions,
      documentsRequired,
      keywords
    } = req.body;

    console.log('createJobPost - req.user:', req.user);
    console.log('createJobPost - req.body:', req.body);

    // Check if user is a company
    if (req.user.type !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Only companies can post jobs'
      });
    }

    // Verify company exists - find by user reference, not by id
    const company = await Company.findOne({ user: req.user.id });
    console.log('createJobPost - company found:', company ? 'yes' : 'no');
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found. Please complete your profile first.'
      });
    }

    // Create job post
    const jobPost = new JobPosts({
      title,
      description,
      shortDescription,
      company: company._id,
      jobType,
      workMode,
      location,
      salary,
      experience,
      education,
      requiredSkills,
      preferredSkills,
      technicalSkills,
      softSkills,
      requirements,
      responsibilities,
      qualifications,
      vacancies,
      applicationDeadline,
      applicationProcess,
      category,
      subcategory,
      tags,
      benefits,
      perks,
      workEnvironment,
      contactPerson,
      applicationInstructions,
      documentsRequired,
      keywords
    });

    await jobPost.save();
    await jobPost.populate('company', 'companyName email contactNo industry companySize logo');

    res.status(201).json({
      success: true,
      message: 'Job post created successfully',
      data: jobPost
    });
  } catch (error) {
    console.error('Job posting error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed: ' + messages.join(', '),
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all job posts
exports.getAllJobPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      location, 
      jobType, 
      category, 
      experienceLevel,
      salaryMin,
      salaryMax,
      companyId,
      sortBy = 'postedAt',
      sortOrder = 'desc'
    } = req.query;
    
    let query = { status: 'active', isActive: true };
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } },
        { category: new RegExp(search, 'i') }
      ];
    }
    
    // Location filter
    if (location) {
      query.$or = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.state': new RegExp(location, 'i') }
      ];
    }
    
    // Job type filter
    if (jobType) {
      query.jobType = jobType;
    }
    
    // Category filter
    if (category) {
      query.category = new RegExp(category, 'i');
    }
    
    // Experience level filter
    if (experienceLevel) {
      query['experience.level'] = experienceLevel;
    }
    
    // Salary range filter
    if (salaryMin || salaryMax) {
      query['salary.min'] = {};
      if (salaryMin) query['salary.min'].$gte = parseInt(salaryMin);
      if (salaryMax) query['salary.min'].$lte = parseInt(salaryMax);
    }
    
    // Company filter
    if (companyId) {
      query.company = companyId;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const jobPosts = await JobPosts.find(query)
      .populate('company', 'companyName email contactNo industry companySize logo')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await JobPosts.countDocuments(query);

    res.json({
      success: true,
      data: {
        jobPosts,
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

// Get job post by ID
exports.getJobPostById = async (req, res) => {
  try {
    const jobPost = await JobPosts.findById(req.params.id)
      .populate('company', 'companyName email contactNo industry companySize logo website description');

    if (!jobPost) {
      return res.status(404).json({
        success: false,
        message: 'Job post not found'
      });
    }

    res.json({
      success: true,
      data: jobPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update job post
exports.updateJobPost = async (req, res) => {
  try {
    const jobPostId = req.params.id;

    // Find job post
    const jobPost = await JobPosts.findById(jobPostId);
    if (!jobPost) {
      return res.status(404).json({
        success: false,
        message: 'Job post not found'
      });
    }

    // Check if user owns the job post
    if (jobPost.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job post'
      });
    }

    const updatedJobPost = await JobPosts.findByIdAndUpdate(
      jobPostId,
      req.body,
      { new: true, runValidators: true }
    ).populate('company', 'companyName email contactNo industry companySize logo');

    res.json({
      success: true,
      message: 'Job post updated successfully',
      data: updatedJobPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete job post
exports.deleteJobPost = async (req, res) => {
  try {
    const jobPostId = req.params.id;

    // Find job post
    const jobPost = await JobPosts.findById(jobPostId);
    if (!jobPost) {
      return res.status(404).json({
        success: false,
        message: 'Job post not found'
      });
    }

    // Check if user owns the job post
    if (jobPost.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job post'
      });
    }

    await JobPosts.findByIdAndDelete(jobPostId);

    res.json({
      success: true,
      message: 'Job post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get job posts by company
exports.getJobPostsByCompany = async (req, res) => {
  try {
    let companyId = req.params.companyId;

    // If no companyId param, derive from logged-in user by finding their company profile
    if (!companyId) {
      const companyDoc = await Company.findOne({ user: req.user.id }).select('_id');
      if (!companyDoc) {
        return res.status(404).json({
          success: false,
          message: 'Company profile not found for the current user'
        });
      }
      companyId = companyDoc._id;
    }
    
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { company: companyId };
    
    if (status) {
      query.status = status;
    }

    const jobPosts = await JobPosts.find(query)
      .populate('company', 'companyName email contactNo industry companySize logo')
      .sort({ postedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await JobPosts.countDocuments(query);

    res.json({
      success: true,
      data: {
        jobPosts,
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

// Search job posts
exports.searchJobPosts = async (req, res) => {
  try {
    const { 
      q, 
      location, 
      jobType, 
      category, 
      experienceLevel,
      page = 1, 
      limit = 10 
    } = req.query;
    
    let query = { status: 'active', isActive: true };
    
    // Text search
    if (q) {
      query.$text = { $search: q };
    }
    
    // Additional filters
    if (location) {
      query.$or = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.state': new RegExp(location, 'i') }
      ];
    }
    
    if (jobType) {
      query.jobType = jobType;
    }
    
    if (category) {
      query.category = new RegExp(category, 'i');
    }
    
    if (experienceLevel) {
      query['experience.level'] = experienceLevel;
    }

    const jobPosts = await JobPosts.find(query)
      .populate('company', 'companyName email contactNo industry companySize logo')
      .sort({ score: { $meta: 'textScore' }, postedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await JobPosts.countDocuments(query);

    res.json({
      success: true,
      data: {
        jobPosts,
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

