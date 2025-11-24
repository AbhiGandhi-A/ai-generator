import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "User not found or inactive" })
    }

    // Check and reset credits if needed
    if (user.checkAndResetCredits()) {
      await user.save()
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: "Invalid token" })
  }
}

export const adminMiddleware = async (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" })
  }
  next()
}
