import mongoose from "mongoose"

const generationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "Untitled Generation",
    },
    prompt: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["website", "mern-app", "tsx-react"],
      default: "website",
    },
    status: {
      type: String,
      enum: ["pending", "generating", "completed", "failed"],
      default: "pending",
    },
    creditsUsed: {
      type: Number,
      default: 1,
    },
    generatedCode: {
      files: [
        {
          name: String,
          path: String,
          content: String,
          language: String,
        },
      ],
      projectStructure: String,
      startCommand: String,
    },
    preview: {
      type: String,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
    tags: [String],
    isFavorite: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

export default mongoose.model("Generation", generationSchema)
