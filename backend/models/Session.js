const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionId: { type: String },
  question: { type: String },
  questionText: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String },
  userAnswer: { type: String },
  isCorrect: { type: Boolean },
  explanation: { type: String },
  feedback: { type: String },
  score: { type: Number, default: 0 }
});

const SessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  count: {
    type: Number,
    default: 5
  },
  durationMinutes: {
    type: Number
  },
  type: {
    type: String,
    enum: ['interview', 'practice'],
    default: 'interview'
  },
  overallScore: {
    type: Number,
    default: 0
  },
  questions: [QuestionSchema],
  completedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
