const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[\w.-]+@[\w.-]+\.\w{2,}$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// ❌ REMOVED pre-save hook — password is hashed manually in controller
// ✅ No double hashing

module.exports = mongoose.model('User', UserSchema);