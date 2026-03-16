const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()
const Session = require("./models/session")
const Question = require("./models/question")
const authRoutes = require("./routes/authRoutes")
const authMiddleware = require("./middleware/authMiddleware")

const app = express()

app.use(cors())
app.use(express.json())
app.use("/api/auth", authRoutes)


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


app.post("/api/answer", authMiddleware, async (req,res)=>{

 const { role, question, answer } = req.body

 const score = 7
 const feedback = "Good explanation but add examples"

 const session = new Session({
   userId: req.user.userId,
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
app.get("/api/history", authMiddleware, async (req,res)=>{

 const userId = req.user.userId

 const sessions = await Session.find({ userId })

 res.json(sessions)

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