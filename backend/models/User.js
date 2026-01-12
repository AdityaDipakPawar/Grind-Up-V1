const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  type: { type: String, enum: ['college', 'company', 'admin'], required: true },
  // Email verification fields
  isEmailVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  // College specific fields
  collegeName: { type: String },
  contactNo: { type: String },
  // Company specific fields
  companyName: { type: String },
  industry: { type: String },
  companySize: { type: String },
  location: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 