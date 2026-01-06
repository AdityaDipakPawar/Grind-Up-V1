const Invite = require('../models/Invite');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const College = require('../models/College');
const JobPosts = require('../models/JobPosts');

// Send invite to college (company invites college for a job)
exports.sendInvite = async (req, res) => {
  try {
    const { collegeId, jobId, message } = req.body;

    // Check if user is a company
    if (req.user.type !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Only companies can send invites'
      });
    }

    // Check if college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    // Check if job exists and belongs to the company
    const job = await JobPosts.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send invite for this job'
      });
    }

    // Check if invite already exists
    const existingInvite = await Invite.findOne({
      college: collegeId,
      job: jobId,
      company: req.user.id
    });

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'Invite already sent to this college for this job'
      });
    }

    // Create invite
    const invite = new Invite({
      college: collegeId,
      job: jobId,
      company: req.user.id,
      message: message || `You have been invited to apply for ${job.title}`,
      status: 'pending'
    });

    await invite.save();

    const populatedInvite = await Invite.findById(invite._id)
      .populate('college', 'collegeName email')
      .populate('job', 'title');

    res.status(201).json({
      success: true,
      message: 'Invite sent successfully',
      data: populatedInvite
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Get invites for a college
exports.getCollegeInvites = async (req, res) => {
  try {
    // Check if user is a college
    if (req.user.type !== 'college') {
      return res.status(403).json({
        success: false,
        message: 'Only colleges can view invites'
      });
    }

    const invites = await Invite.find({ college: req.user.id })
      .populate('job', 'title description location salary employmentType')
      .populate('company', 'companyName email contactNo industry companySize location')
      .sort({ invitedAt: -1 });

    res.json({
      success: true,
      data: invites
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Get invites sent by a company
exports.getCompanyInvites = async (req, res) => {
  try {
    // Check if user is a company
    if (req.user.type !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Only companies can view sent invites'
      });
    }

    const invites = await Invite.find({ company: req.user.id })
      .populate('job', 'title description location salary employmentType')
      .populate('college', 'collegeName email contactNo')
      .sort({ invitedAt: -1 });

    res.json({
      success: true,
      data: invites
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Accept invite (college accepts company invitation)
exports.acceptInvite = async (req, res) => {
  try {
    const inviteId = req.params.id;

    // Check if user is a college
    if (req.user.type !== 'college') {
      return res.status(403).json({
        success: false,
        message: 'Only colleges can accept invites'
      });
    }

    const invite = await Invite.findById(inviteId)
      .populate('job')
      .populate('company');

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found'
      });
    }

    // Check if invite belongs to the user
    if (invite.college.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this invite'
      });
    }

    // Check if invite is still pending
    if (invite.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invite has already been responded to'
      });
    }

    // Check if already applied for this job
    const existingApplication = await JobApplication.findOne({
      job: invite.job._id,
      applicant: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create job application
    const application = new JobApplication({
      job: invite.job._id,
      applicant: req.user.id,
      coverLetter: `Applied through invitation from ${invite.company.companyName}`
    });

    await application.save();

    // Update invite status
    invite.status = 'accepted';
    await invite.save();

    await application.populate('job', 'title company');
    await application.populate('applicant', 'collegeName email');

    res.json({
      success: true,
      message: 'Invite accepted and application submitted successfully',
      data: {
        invite,
        application
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

// Decline invite (college declines company invitation)
exports.declineInvite = async (req, res) => {
  try {
    const inviteId = req.params.id;

    // Check if user is a college
    if (req.user.type !== 'college') {
      return res.status(403).json({
        success: false,
        message: 'Only colleges can decline invites'
      });
    }

    const invite = await Invite.findById(inviteId);

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found'
      });
    }

    // Check if invite belongs to the user
    if (invite.college.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to decline this invite'
      });
    }

    // Check if invite is still pending
    if (invite.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invite has already been responded to'
      });
    }

    // Update invite status
    invite.status = 'declined';
    await invite.save();

    res.json({
      success: true,
      message: 'Invite declined successfully',
      data: invite
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Get invite by ID
exports.getInviteById = async (req, res) => {
  try {
    const invite = await Invite.findById(req.params.id)
      .populate('job', 'title description location salary employmentType')
      .populate('company', 'companyName email contactNo industry companySize location')
      .populate('college', 'collegeName email contactNo');

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found'
      });
    }

    // Check if user is authorized to view this invite
    if (invite.college.toString() !== req.user.id && invite.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this invite'
      });
    }

    res.json({
      success: true,
      data: invite
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Delete invite (company can delete their sent invites)
exports.deleteInvite = async (req, res) => {
  try {
    const inviteId = req.params.id;

    // Check if user is a company
    if (req.user.type !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Only companies can delete invites'
      });
    }

    const invite = await Invite.findById(inviteId);

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found'
      });
    }

    // Check if user owns the invite
    if (invite.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this invite'
      });
    }

    await Invite.findByIdAndDelete(inviteId);

    res.json({
      success: true,
      message: 'Invite deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
}; 