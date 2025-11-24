import express from "express"
import Generation from "../models/Generation.js"
import { decrementCredits } from "../services/creditService.js"
import { createAuditLog } from "../services/auditService.js"

const router = express.Router()

// Get user's generations
router.get("/", async (req, res) => {
  try {
    const generations = await Generation.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50)

    res.json(generations)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch generations" })
  }
})

// Get single generation
router.get("/:id", async (req, res) => {
  try {
    const generation = await Generation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!generation) {
      return res.status(404).json({ error: "Generation not found" })
    }

    res.json(generation)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch generation" })
  }
})

// Create new generation
router.post("/", async (req, res) => {
  try {
    const { prompt, type } = req.body

    // Check credits
    if (req.user.credits < 1) {
      return res.status(402).json({ error: "Insufficient credits" })
    }

    // Decrement credits
    await decrementCredits(req.user._id, 1)

    const generation = new Generation({
      userId: req.user._id,
      prompt,
      type: type || "website",
      status: "pending",
    })

    await generation.save()
    await createAuditLog(req.user._id, "GENERATION_CREATED", "Generation", { type, prompt })

    res.status(201).json(generation)
  } catch (error) {
    res.status(500).json({ error: "Failed to create generation" })
  }
})

// Delete generation
router.delete("/:id", async (req, res) => {
  try {
    const generation = await Generation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!generation) {
      return res.status(404).json({ error: "Generation not found" })
    }

    res.json({ message: "Generation deleted" })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete generation" })
  }
})

export default router
