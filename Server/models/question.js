const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema({
  role: String,
  question: String
})

module.exports = mongoose.model("Question", questionSchema)