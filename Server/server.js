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
    res.json({
        question:"What is REST API?"
    })
})

app.listen(5000, () => {
    console.log("Server running on port 5000")
})