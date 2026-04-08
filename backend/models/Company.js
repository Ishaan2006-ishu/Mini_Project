const mongoose = require('mongoose');

const CompanyRoleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Role title is required'],
      trim: true,
    },
    level: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior'],
      required: [true, 'Role level is required'],
    },
    questions: {
      type: Number,
      required: [true, 'Question count is required'],
      min: 1,
      max: 50,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: [true, 'Company slug is required'],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers and hyphens'],
    },
    logo: {
      type: String,
      required: [true, 'Company logo is required'],
      trim: true,
    },
    color: {
      type: String,
      required: [true, 'Company card color is required'],
      trim: true,
    },
    border: {
      type: String,
      required: [true, 'Company border class is required'],
      trim: true,
    },
    roles: {
      type: [CompanyRoleSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', CompanySchema);
