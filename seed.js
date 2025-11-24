import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "./models/User.js"  // adjust path if needed

dotenv.config()

// ---------------------------------------------
// CONNECT TO MONGODB
// ---------------------------------------------
async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI

    if (!uri) {
      console.error("❌ ERROR: MONGODB_URI is missing in .env")
      process.exit(1)
    }

    await mongoose.connect(uri)
    console.log("✅ MongoDB Connected Successfully")
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:\n", error)
    process.exit(1)
  }
}

// ---------------------------------------------
// SEED ADMIN USER
// ---------------------------------------------
async function seedAdmin() {
  await connectDB()

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    console.error("❌ ERROR: ADMIN_EMAIL or ADMIN_PASSWORD missing in .env")
    process.exit(1)
  }

  try {
    // Check if admin exists by email OR role
    let admin = await User.findOne({ email: adminEmail })

    if (admin) {
      console.log("⚠️ Admin already exists:", adminEmail)
      console.log("ℹ️ No changes made.")
      process.exit(0)
    }

    // Create admin user
    admin = new User({
      username: "admin",                // Always set default username for admin
      email: adminEmail,
      password: adminPassword,          // Will be hashed in pre-save hook
      role: "admin",
      credits: 99999,
      isActive: true,
      lastCreditReset: new Date(),
    })

    await admin.save()

    console.log("\n🎉 Admin User Created Successfully!")
    console.log("----------------------------------")
    console.log(`📧 Email:    ${adminEmail}`)
    console.log(`🔑 Password: ${adminPassword}  (auto-hashed in DB)`)
    console.log(`🛡️ Role:     admin`)
    console.log("----------------------------------\n")

    process.exit(0)
  } catch (error) {
    console.error("❌ Failed to create admin:\n", error)
    process.exit(1)
  }
}

seedAdmin()
