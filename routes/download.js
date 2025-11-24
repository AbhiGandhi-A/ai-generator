import express from "express"
import path from "path"
import os from "os"
import { authMiddleware } from "../middleware/auth.js"
import Generation from "../models/Generation.js"
import { createProjectZip } from "../services/codePackageService.js"
import { createAuditLog } from "../services/auditService.js"

const router = express.Router()

const DOWNLOADS_DIR = path.join(os.tmpdir(), "ai-generator-downloads")

/**
 * GET /api/download/:id
 * Download generated project as ZIP
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const generation = await Generation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!generation) {
      return res.status(404).json({ error: "Generation not found" })
    }

    if (generation.status !== "completed") {
      return res.status(400).json({ error: "Generation not completed" })
    }

    // Create ZIP file
    const packageInfo = await createProjectZip(generation, DOWNLOADS_DIR)

    await createAuditLog(req.user._id, "PROJECT_DOWNLOADED", "Download", { generationId: req.params.id })

    // Send file
    res.download(packageInfo.path, packageInfo.filename, (err) => {
      if (err) {
        console.error("Download error:", err)
      }
    })
  } catch (error) {
    console.error("Download error:", error)
    res.status(500).json({ error: "Failed to create download" })
  }
})

export default router
