const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema(
  {
    planId: {
      type: String,
      required: [true, 'Plan id is required'],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Plan id must contain only lowercase letters, numbers and hyphens'],
    },
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    price: {
      type: String,
      required: [true, 'Plan price is required'],
      trim: true,
    },
    period: {
      type: String,
      required: [true, 'Plan period is required'],
      trim: true,
    },
    badge: {
      type: String,
      default: null,
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    cta: {
      type: String,
      required: [true, 'CTA text is required'],
      trim: true,
    },
    highlight: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model('Plan', PlanSchema);
