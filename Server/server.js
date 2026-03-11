const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()

app.use(cors())
app.use(express.json())

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

app.post("/api/answer", (req, res) => {

    const { question, answer } = req.body

    console.log("Question:", question)
    console.log("Answer:", answer)

    res.json({
        score: 7,
        feedback: "Good explanation but try adding real world examples."
    })

})

app.listen(5000, () => {
    console.log("Server running on port 5000")
})