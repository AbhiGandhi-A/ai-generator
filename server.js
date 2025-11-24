import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Routes
import authRoutes from "./routes/auth.js"
import generationRoutes from "./routes/generations.js"
import userRoutes from "./routes/users.js"
import adminRoutes from "./routes/admin.js"
import aiRoutes from "./routes/ai.js"
import downloadRoutes from "./routes/download.js"

// Services & Middleware
import { creditResetScheduler } from "./services/creditService.js"
import { authMiddleware } from "./middleware/auth.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// --- Configuration Logging for Debugging ---
console.log(`[Config] Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`)
console.log(`[Config] MongoDB URI: ${process.env.MONGODB_URI ? 'Set' : 'Not Set'} (using default if empty)`)
console.log(`[Config] AI Model URL: ${process.env.AI_MODEL_API_URL || "http://localhost:11434"} (Check if Ollama is running here)`)
// -------------------------------------------

// Security headers
app.use(helmet())

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
)

// Body parsing
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// Serve built frontend
app.use(express.static(path.join(__dirname, "client", "dist")))

// --- MongoDB Connection and Server Start ---

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ai-generator"

/**
 * Connects to MongoDB and starts the Express server upon success.
 */
async function connectDBAndStartServer() {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log("MongoDB connected successfully")

        // Weekly credit reset
        creditResetScheduler()

        // API routes
        app.use("/api/auth", authRoutes)
        app.use("/api/generations", authMiddleware, generationRoutes)
        app.use("/api/users", authMiddleware, userRoutes)
        app.use("/api/admin", authMiddleware, adminRoutes)
        app.use("/api/ai", aiRoutes)
        app.use("/api/download", authMiddleware, downloadRoutes)

        // Health endpoint
        app.get("/api/health", (req, res) => {
            res.json({ status: "OK", timestamp: new Date().toISOString() })
        })

        // Catch-all to serve index.html for client-side routing
        app.use((req, res) => {
            res.sendFile(path.join(__dirname, "client", "dist", "index.html"))
        })

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })

    } catch (err) {
        console.error("🔥 MongoDB connection error:", err.message)
        // Exit process if DB connection fails
        process.exit(1)
    }
}

connectDBAndStartServer()