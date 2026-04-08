const mongoose = require('mongoose');

const DifficultySchema = new mongoose.Schema(
  {
    value: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const InterviewConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
      trim: true,
    },
    difficulties: {
      type: [DifficultySchema],
      default: [],
    },
    questionCounts: {
      type: [Number],
      default: [],
    },
    defaultDifficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    defaultQuestionCount: {
      type: Number,
      default: 25,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InterviewConfig', InterviewConfigSchema);
