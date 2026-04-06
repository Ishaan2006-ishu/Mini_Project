const mongoose = require('mongoose');

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
  attempts: {
    type: Number,
    default: 0,         // track wrong attempts (max 5)
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600,       // ← TTL: MongoDB auto-deletes this doc after 10 minutes
  },
});

module.exports = mongoose.model('Otp', OtpSchema);