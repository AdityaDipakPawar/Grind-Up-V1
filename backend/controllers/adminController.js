const College = require('../models/College');
const Company = require('../models/Company');
const emailService = require('../services/emailService');

// List pending registrations
exports.listPending = async (req, res) => {
  try {
    const { type } = req.params; // 'colleges' | 'companies'
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const Model = type === 'colleges' ? College : Company;

    const [items, total] = await Promise.all([
      Model.find({ approvalStatus: 'pending' })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Model.countDocuments({ approvalStatus: 'pending' }),
    ]);

    res.json({ success: true, data: items, page: Number(page), total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// List approved registrations
exports.listApproved = async (req, res) => {
  try {
    const { type } = req.params; // 'colleges' | 'companies'
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const Model = type === 'colleges' ? College : Company;

    const [items, total] = await Promise.all([
      Model.find({ approvalStatus: 'approved' })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Model.countDocuments({ approvalStatus: 'approved' }),
    ]);

    res.json({ success: true, data: items, page: Number(page), total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Approve or reject by id
exports.setApproval = async (req, res) => {
  try {
    const { type, id } = req.params; // type: 'colleges' | 'companies'
    const { action } = req.body; // 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const Model = type === 'colleges' ? College : Company;
    const doc = await Model.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    doc.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    await doc.save();

    // Send approval/rejection email
    if (action === 'approve') {
      if (type === 'colleges') {
        await emailService.sendCollegeApprovalEmail(doc.email, doc.collegeName);
      } else {
        await emailService.sendCompanyApprovalEmail(doc.email, doc.companyName);
      }
    }

    res.json({ success: true, message: `Successfully ${action}d`, data: { id: doc._id, approvalStatus: doc.approvalStatus } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
