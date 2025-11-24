import mongoose from "mongoose"
import bcryptjs from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    credits: {
      type: Number,
      default: 10,
    },
    lastCreditReset: {
      type: Date,
      default: () => new Date(),
    },
    totalCreditsUsed: {
      type: Number,
      default: 0,
    },
    generationCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

/*  
---------------------------------------------------------
 FIXED PASSWORD HASHING 
 - Removed (next) because async hooks in Mongoose v7 
   DO NOT support next()
 - Using clean async function
---------------------------------------------------------
*/
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return

  const salt = await bcryptjs.genSalt(10)
  this.password = await bcryptjs.hash(this.password, salt)
})

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password)
}

/*  
---------------------------------------------------------
 WEEKLY CREDIT RESET LOGIC
---------------------------------------------------------
*/
userSchema.methods.checkAndResetCredits = function () {
  const now = new Date()
  const days = (now - this.lastCreditReset) / (1000 * 60 * 60 * 24)

  if (days >= 7) {
    this.credits = Number(process.env.DEFAULT_WEEKLY_CREDITS) || 10
    this.lastCreditReset = now
    return true
  }
  return false
}

export default mongoose.model("User", userSchema)
