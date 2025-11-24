import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { validateRegister, validateLogin } from "../middleware/validation.js"
import { createAuditLog } from "../services/auditService.js"

const router = express.Router()

// Register
router.post("/register", validateRegister, async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Create new user with default credits
    const user = new User({
      username,
      email,
      password,
      credits: Number.parseInt(process.env.DEFAULT_WEEKLY_CREDITS) || 10,
      lastCreditReset: new Date(),
    })

    await user.save()
    await createAuditLog(user._id, "USER_REGISTERED", "User", { username, email })

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    })

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ error: "Registration failed" })
  }
})

// Login
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      await createAuditLog(null, "LOGIN_FAILED", "Auth", { email, reason: "User not found" }, "failure")
      return res.status(401).json({ error: "Invalid credentials" })
    }

    if (!user.isActive) {
      await createAuditLog(user._id, "LOGIN_FAILED", "Auth", { reason: "Account inactive" }, "failure")
      return res.status(401).json({ error: "Account is inactive" })
    }

    // Check and reset credits if needed
    if (user.checkAndResetCredits()) {
      await user.save()
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      await createAuditLog(user._id, "LOGIN_FAILED", "Auth", { reason: "Invalid password" }, "failure")
      return res.status(401).json({ error: "Invalid credentials" })
    }

    await createAuditLog(user._id, "LOGIN_SUCCESS", "Auth", { email })

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        credits: user.credits,
        lastCreditReset: user.lastCreditReset,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Login failed" })
  }
})

export default router
