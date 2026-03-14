const express = require("express")
const bcrypt = require("bcryptjs")
const User = require("../models/user")

const router = express.Router()

router.post("/register", async (req, res) => {

  try {

    const { name, email, password } = req.body

    // check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      })
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // create new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    })

    await user.save()

    res.json({
      message: "User registered successfully"
    })

  } catch (error) {

    res.status(500).json({
      message: "Server error",
      error: error.message
    })

  }

})

module.exports = router