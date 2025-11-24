import express from "express"
import User from "../models/User.js"
import Generation from "../models/Generation.js"
import AuditLog from "../models/AuditLog.js"
import { authMiddleware, adminMiddleware } from "../middleware/auth.js"
import { addCredits } from "../services/creditService.js"

const router = express.Router()

router.use(authMiddleware, adminMiddleware)

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// Get user details
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    const generations = await Generation.find({ userId: req.params.id })

    res.json({
      user,
      generations,
      stats: {
        totalGenerations: generations.length,
        creditsUsed: user.totalCreditsUsed,
      },
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

// Add credits to user
router.post("/users/:id/credits", async (req, res) => {
  try {
    const { amount } = req.body
    const user = await addCredits(req.params.id, amount)
    res.json({ message: "Credits added", user })
  } catch (error) {
    res.status(500).json({ error: "Failed to add credits" })
  }
})

// Deactivate user
router.post("/users/:id/deactivate", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select("-password")

    res.json({ message: "User deactivated", user })
  } catch (error) {
    res.status(500).json({ error: "Failed to deactivate user" })
  }
})

// Get audit logs
router.get("/audit-logs", async (req, res) => {
  try {
    const logs = await AuditLog.find({}).populate("userId", "username email").sort({ timestamp: -1 }).limit(500)

    res.json(logs)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch audit logs" })
  }
})

// Get system stats
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalGenerations = await Generation.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })

    res.json({
      totalUsers,
      activeUsers,
      totalGenerations,
      timestamp: new Date(),
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" })
  }
})

export default router
