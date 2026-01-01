const College = require('../models/College');
const Company = require('../models/Company');
const JobPosts = require('../models/JobPosts');
const JobApplication = require('../models/JobApplication');

/**
 * Get analytics data for admin dashboard
 */
exports.getAnalytics = async (req, res) => {
  try {
    // Count all entities
    const [
      totalColleges,
      totalCompanies,
      totalJobs,
      totalApplications,
      pendingColleges,
      pendingCompanies,
      approvedColleges,
      approvedCompanies,
      rejectedColleges,
      rejectedCompanies,
      activeJobs,
      closedJobs,
    ] = await Promise.all([
      College.countDocuments(),
      Company.countDocuments(),
      JobPosts.countDocuments(),
      JobApplication.countDocuments(),
      College.countDocuments({ approvalStatus: 'pending' }),
      Company.countDocuments({ approvalStatus: 'pending' }),
      College.countDocuments({ approvalStatus: 'approved' }),
      Company.countDocuments({ approvalStatus: 'approved' }),
      College.countDocuments({ approvalStatus: 'rejected' }),
      Company.countDocuments({ approvalStatus: 'rejected' }),
      JobPosts.countDocuments({ status: 'active', isActive: true }),
      JobPosts.countDocuments({ status: 'closed' }),
    ]);

    // Get application status breakdown
    const applicationsByStatus = await JobApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const applicationStatusMap = applicationsByStatus.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Get jobs by type
    const jobsByType = await JobPosts.aggregate([
      {
        $group: {
          _id: '$jobType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentColleges = await College.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const recentCompanies = await Company.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const recentJobs = await JobPosts.countDocuments({
      postedAt: { $gte: thirtyDaysAgo }
    });

    const recentApplications = await JobApplication.countDocuments({
      appliedAt: { $gte: thirtyDaysAgo }
    });

    // Get top companies by job postings
    const topCompanies = await JobPosts.aggregate([
      {
        $group: {
          _id: '$company',
          jobCount: { $sum: 1 }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'companyInfo'
        }
      },
      { $unwind: '$companyInfo' },
      {
        $project: {
          name: '$companyInfo.companyName',
          jobCount: 1
        }
      }
    ]);

    // Get most applied jobs
    const mostAppliedJobs = await JobApplication.aggregate([
      {
        $group: {
          _id: '$job',
          applicationCount: { $sum: 1 }
        }
      },
      { $sort: { applicationCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'jobposts',
          localField: '_id',
          foreignField: '_id',
          as: 'jobInfo'
        }
      },
      { $unwind: '$jobInfo' },
      {
        $project: {
          title: '$jobInfo.title',
          applicationCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalColleges,
          totalCompanies,
          totalJobs,
          totalApplications,
        },
        approvals: {
          colleges: {
            pending: pendingColleges,
            approved: approvedColleges,
            rejected: rejectedColleges,
          },
          companies: {
            pending: pendingCompanies,
            approved: approvedCompanies,
            rejected: rejectedCompanies,
          },
        },
        jobs: {
          active: activeJobs,
          closed: closedJobs,
          byType: jobsByType,
        },
        applications: {
          total: totalApplications,
          byStatus: applicationStatusMap,
        },
        recent: {
          colleges: recentColleges,
          companies: recentCompanies,
          jobs: recentJobs,
          applications: recentApplications,
        },
        topCompanies,
        mostAppliedJobs,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
