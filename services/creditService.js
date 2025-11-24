import cron from "node-cron"
import User from "../models/User.js"

export const creditResetScheduler = () => {
  // Run every day at midnight
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Running daily credit reset check...")

      const users = await User.find({ isActive: true })
      let resetCount = 0

      for (const user of users) {
        if (user.checkAndResetCredits()) {
          await user.save()
          resetCount++
        }
      }

      console.log(`Credit reset completed. ${resetCount} users had credits reset.`)
    } catch (error) {
      console.error("Credit reset scheduler error:", error)
    }
  })
}

export const decrementCredits = async (userId, amount = 1) => {
  try {
    const user = await User.findById(userId)
    if (!user) throw new Error("User not found")

    if (user.credits < amount) {
      throw new Error("Insufficient credits")
    }

    user.credits -= amount
    user.totalCreditsUsed += amount
    await user.save()

    return user
  } catch (error) {
    throw error
  }
}

export const addCredits = async (userId, amount) => {
  try {
    const user = await User.findById(userId)
    if (!user) throw new Error("User not found")

    user.credits += amount
    await user.save()

    return user
  } catch (error) {
    throw error
  }
}
