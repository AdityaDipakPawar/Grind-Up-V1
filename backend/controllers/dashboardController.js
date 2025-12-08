const College = require('../models/College');
const Company = require('../models/Company');
const JobPosts = require('../models/JobPosts');
const JobApplication = require('../models/JobApplication');
const Invite = require('../models/Invite');
const User = require('../models/User');

// College Dashboard Controller
exports.getCollegeDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get college details
    const college = await College.findOne({ user: userId }).select('-password');
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    // Get total companies engaged with this college
    const totalCompanies = await Invite.distinct('companyId', { collegeId: college._id });
    
    // Get invites statistics
    const invitesStats = await Invite.aggregate([
      { $match: { collegeId: college._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const invitesMap = invitesStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    // Get active job openings by companies
    const activeJobs = await JobPosts.countDocuments({ status: 'approved' });
    
    // Get recent invites
    const recentInvites = await Invite.find({ collegeId: college._id })
      .populate('jobPostId', 'jobTitle salary')
      .populate('companyId', 'companyName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get application statistics
    const applicationStats = await JobApplication.aggregate([
      { $match: { collegeId: college._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const applicationsMap = applicationStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    // Get total applications
    const totalApplications = await JobApplication.countDocuments({ collegeId: college._id });

    // Get trending companies (by invite count)
    const trendingCompanies = await Invite.aggregate([
      { $match: { collegeId: college._id } },
      {
        $group: {
          _id: '$companyId',
          inviteCount: { $sum: 1 }
        }
      },
      { $sort: { inviteCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' }
    ]);

    res.status(200).json({
      success: true,
      data: {
        college: {
          name: college.collegeName,
          email: college.email,
          city: college.collegeCity,
          avgCTC: college.avgCTC,
          placementPercent: college.placementPercent
        },
        metrics: {
          totalCompanies: totalCompanies.length,
          activeJobOpenings: activeJobs,
          totalApplications: totalApplications,
          invites: {
            total: recentInvites.length,
            ...invitesMap
          },
          applications: applicationsMap
        },
        recentInvites: recentInvites.map(invite => ({
          id: invite._id,
          company: invite.companyId?.companyName,
          job: invite.jobPostId?.jobTitle,
          salary: invite.jobPostId?.salary,
          status: invite.status,
          createdAt: invite.createdAt
        })),
        trendingCompanies: trendingCompanies.map(item => ({
          id: item._id,
          name: item.company.companyName,
          invites: item.inviteCount
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching college dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard',
      error: error.message
    });
  }
};

// Company Dashboard Controller
exports.getCompanyDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get company details
    const company = await Company.findOne({ user: userId }).select('-password');
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get total colleges reached
    const totalColleges = await Invite.distinct('collegeId', { companyId: company._id });
    
    // Get job posts statistics
    const jobPostStats = await JobPosts.aggregate([
      { $match: { companyId: company._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const jobPostMap = jobPostStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    // Get total job openings
    const totalPositions = await JobPosts.aggregate([
      { $match: { companyId: company._id, status: 'approved' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$positions' }
        }
      }
    ]);

    // Get application statistics
    const applicationStats = await JobApplication.aggregate([
      {
        $lookup: {
          from: 'jobposts',
          localField: 'jobPostId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      { $match: { 'job.companyId': company._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const applicationsMap = applicationStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    // Get total applications
    const totalAppliedCount = applicationStats.reduce((sum, stat) => sum + stat.count, 0);

    // Get active job posts
    const activeJobs = await JobPosts.find({ companyId: company._id, status: 'approved' })
      .select('jobTitle positions salary status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent applications
    const recentApplications = await JobApplication.find()
      .populate('jobPostId', 'jobTitle')
      .populate('collegeId', 'collegeName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Filter applications for this company
    const companyApplications = recentApplications.filter(app => 
      app.jobPostId?.companyId?.toString() === company._id.toString()
    );

    // Get invite statistics
    const inviteStats = await Invite.aggregate([
      { $match: { companyId: company._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const invitesMap = inviteStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    // Get top performing colleges (by applications)
    const topColleges = await JobApplication.aggregate([
      {
        $lookup: {
          from: 'jobposts',
          localField: 'jobPostId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      { $match: { 'job.companyId': company._id } },
      {
        $group: {
          _id: '$collegeId',
          applicationCount: { $sum: 1 }
        }
      },
      { $sort: { applicationCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'colleges',
          localField: '_id',
          foreignField: '_id',
          as: 'college'
        }
      },
      { $unwind: '$college' }
    ]);

    res.status(200).json({
      success: true,
      data: {
        company: {
          name: company.companyName,
          email: company.email,
          industry: company.industry,
          size: company.companySize
        },
        metrics: {
          totalCollegesReached: totalColleges.length,
          totalJobPostings: jobPostMap.approved || 0,
          totalPositions: totalPositions[0]?.total || 0,
          totalApplications: totalAppliedCount,
          jobPosts: jobPostMap,
          applications: applicationsMap,
          invites: invitesMap
        },
        activeJobs: activeJobs.map(job => ({
          id: job._id,
          title: job.jobTitle,
          positions: job.positions,
          salary: job.salary,
          status: job.status,
          postedAt: job.createdAt
        })),
        recentApplications: companyApplications.slice(0, 5).map(app => ({
          id: app._id,
          job: app.jobPostId?.jobTitle,
          college: app.collegeId?.collegeName,
          status: app.status,
          appliedAt: app.createdAt
        })),
        topColleges: topColleges.map(item => ({
          id: item._id,
          name: item.college.collegeName,
          applications: item.applicationCount
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching company dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard',
      error: error.message
    });
  }
};

// Get dashboard stats for both roles
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.type === 'college') {
      return exports.getCollegeDashboard(req, res);
    } else if (user.type === 'company') {
      return exports.getCompanyDashboard(req, res);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};
