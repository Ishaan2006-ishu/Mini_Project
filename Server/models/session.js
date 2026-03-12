const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema({
  role: String,
  question: String,
  answer: String,
  score: Number,
  feedback: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Session", sessionSchema)