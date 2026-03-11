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

app.get("/api/question",(req,res)=>{

    const questions = [
        "What is REST API?",
        "Explain polymorphism in OOP.",
        "What is the difference between SQL and NoSQL?",
        "What is middleware in Node.js?",
        "Explain event loop in JavaScript."
    ]

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)]

    res.json({
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