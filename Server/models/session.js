const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  role: String,
  question: String,
  answer: String,
  score: Number,
  feedback: String

}, { timestamps: true })

module.exports = mongoose.model("Session", sessionSchema)