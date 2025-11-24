import express from "express"
import User from "../models/User.js"

const router = express.Router()

// Get current user profile
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

// Update profile
router.put("/profile", async (req, res) => {
  try {
    const { username } = req.body
    const user = await User.findByIdAndUpdate(req.user._id, { username }, { new: true }).select("-password")

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" })
  }
})

export default router
