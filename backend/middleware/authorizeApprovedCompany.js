const Company = require('../models/Company');

// Ensures the authenticated user is a company with approved status
module.exports = async function authorizeApprovedCompany(req, res, next) {
  try {
    if (!req.user || req.user.type !== 'company') {
      return res.status(403).json({ success: false, message: 'Only companies can perform this action' });
    }

    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    if (company.approvalStatus !== 'approved') {
      return res.status(403).json({ success: false, message: 'Company profile is not approved yet' });
    }

    // attach for downstream use if needed
    req.company = company;
    next();
  } catch (err) {
    console.error('authorizeApprovedCompany error:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
