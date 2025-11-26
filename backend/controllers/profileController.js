const College = require('../models/College');
const Company = require('../models/Company');

exports.createProfile = async (req, res) => {
  try {
    const model = req.user.type === 'college' ? College : Company;
    const doc = await model.findOneAndUpdate(
      { user: req.user.id },
      { ...req.body, user: req.user.id },
      { new: true, upsert: true }
    );
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const model = req.user.type === 'college' ? College : Company;
    const doc = await model.findOne({ user: req.user.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const model = req.user.type === 'college' ? College : Company;
    const doc = await model.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, upsert: true }
    );
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const model = req.user.type === 'college' ? College : Company;
    const doc = await model.findOneAndDelete({ user: req.user.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
