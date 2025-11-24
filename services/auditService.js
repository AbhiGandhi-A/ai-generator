import AuditLog from "../models/AuditLog.js"

export const createAuditLog = async (userId, action, resource, details, status = "success") => {
  try {
    const log = new AuditLog({
      userId,
      action,
      resource,
      details,
      status,
      timestamp: new Date(),
    })

    await log.save()
  } catch (error) {
    console.error("Audit log error:", error)
  }
}
