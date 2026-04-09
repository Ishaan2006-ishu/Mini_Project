const mongoose = require('mongoose');
const { AUTH_CONSTANTS } = require('../utils/constants');

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,       // stores the already-hashed password temporarily
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['registration', 'reset_password'],
    default: 'registration',
    index: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: AUTH_CONSTANTS.OTP_EXPIRY_SECONDS,
  },
});

module.exports = mongoose.model('Otp', OtpSchema);