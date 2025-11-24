import mongoose from "mongoose"

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  action: String,
  resource: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ["success", "failure"],
    default: "success",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("AuditLog", auditLogSchema)
