import express from "express"
import { authMiddleware } from "../middleware/auth.js"
import { aiService } from "../services/aiService.js"
import Generation from "../models/Generation.js"
import { decrementCredits } from "../services/creditService.js"
import { createAuditLog } from "../services/auditService.js"

const router = express.Router()

/**
 * POST /api/ai/generate
 * Generate website or MERN app from prompt
 */
router.post("/generate", authMiddleware, async (req, res) => {
  let generation = null // Declare generation outside try block for wider scope
  try {
    const { prompt, type = "website" } = req.body

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Prompt is required" })
    }

    // IMPORTANT: The original code supported 'mern-app' but the system prompt only uses 'MERN'. 
    // I've kept the original logic but recommend aligning 'mern-app' to 'mern' if possible, or updating the switch in _buildSystemPrompt.
    const allowedTypes = ["website", "mern-app", "tsx-react"]
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid type" })
    }

    // Check credits
    if (req.user.credits < 1) {
      return res.status(402).json({ error: "Insufficient credits" })
    }

    // Create pending generation record
    generation = new Generation({
      userId: req.user._id,
      prompt,
      type,
      status: "generating",
      title: prompt.substring(0, 50) + (prompt.length > 50 ? "..." : ""),
    })

    await generation.save()

    // Call AI service
    const aiResult = await aiService.generateCode(prompt, type, req.user._id)

    if (aiResult.success) {
      generation.status = "completed"
      generation.generatedCode = aiResult.data
      generation.creditsUsed = 1

      // Decrement credits
      await decrementCredits(req.user._id, 1)

      await generation.save()
      await createAuditLog(req.user._id, "CODE_GENERATION_SUCCESS", "Generation", { type, prompt })

      res.json({
        success: true,
        generation,
        message: "Code generated successfully",
      })
    } else {
      // AI generation failed (e.g., failed to parse generated code)
      generation.status = "failed"
      generation.error = aiResult.error || "Generation failed with an unknown error."
      await generation.save()
      await createAuditLog(req.user._id, "CODE_GENERATION_FAILED", "Generation", { type, error: aiResult.error })

      // Respond with 500 but include the error message and fallback
      res.status(500).json({
        error: aiResult.error || "Generation failed",
        fallback: aiResult.fallback,
      })
    }
  } catch (error) {
    console.error("AI generation outer error:", error)
    
    // Check if a generation record was created and update its status
    if (generation && generation.status === "generating") {
      generation.status = "failed"
      generation.error = `Server error during generation: ${error.message}`
      await generation.save().catch(saveError => console.error("Failed to save failed generation status:", saveError))
      await createAuditLog(req.user._id, "CODE_GENERATION_FAILED_OUTER", "Generation", { type: req.body.type || 'unknown', error: error.message })
    }
    
    res.status(500).json({ error: "Failed to generate code due to a server error." })
  }
})

/**
 * GET /api/ai/status/:id
 * Check generation status
 */
router.get("/status/:id", authMiddleware, async (req, res) => {
  try {
    const generation = await Generation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!generation) {
      return res.status(404).json({ error: "Generation not found" })
    }

    res.json({
      id: generation._id,
      status: generation.status,
      error: generation.error,
      progress: generation.status === "generating" ? 50 : generation.status === "completed" ? 100 : 0,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch status" })
  }
})

export default router