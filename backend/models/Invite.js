const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosts', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  message: String,
  invitedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Invite', inviteSchema); 