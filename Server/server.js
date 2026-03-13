const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()
const Session = require("./models/session")
const Question = require("./models/question")

const app = express()

app.use(cors())
app.use(express.json())


mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected")
})
.catch(err => {
    console.log("Database Error:", err)
})

app.get("/", (req, res) => {
    res.send("MockMate Pro Server Running")
})

app.get("/api/question", async (req, res) => {

 const role = req.query.role

 const questions = await Question.find({ role })

 const randomQuestion =
   questions[Math.floor(Math.random() * questions.length)]

 res.json({
   role: role,
   question: randomQuestion.question
 })

})


app.post("/api/answer", async (req,res)=>{

 const { role, question, answer } = req.body

 const score = 7
 const feedback = "Good explanation but add examples"

 const session = new Session({
   role,
   question,
   answer,
   score,
   feedback
 })

 await session.save()

 res.json({
   score,
   feedback
 })

})

app.listen(5000, () => {
    console.log("Server running on port 5000")
})

const seedQuestions = async () => {

 await Question.insertMany([
   { role: "backend", question: "What is REST API?" },
   { role: "backend", question: "Explain middleware in Node.js" },
   { role: "frontend", question: "What is Virtual DOM?" }
 ])

 console.log("Questions inserted")

}

// seedQuestions()