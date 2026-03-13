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

app.get("/api/question", (req, res) => {

    const role = req.query.role

    const questions = {
        frontend: [
            "What is the Virtual DOM?",
            "Difference between var, let and const?",
            "Explain Flexbox in CSS"
        ],
        backend: [
            "What is REST API?",
            "Explain middleware in Node.js",
            "What is JWT authentication?"
        ],
        ai: [
            "What is machine learning?",
            "Difference between supervised and unsupervised learning",
            "What is overfitting?"
        ]
    }

    const roleQuestions = questions[role] || questions.backend

    const randomQuestion =
        roleQuestions[Math.floor(Math.random() * roleQuestions.length)]

    res.json({
        role: role,
        question: randomQuestion
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

seedQuestions()