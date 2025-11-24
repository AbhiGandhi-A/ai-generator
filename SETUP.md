# AI Website Generator - Setup Instructions

This is a **pure MERN stack** application with a **separate backend and frontend**.

## Project Structure

\`\`\`
ai-website-generator/
├── server.js                    # Backend entry point
├── models/                      # MongoDB models
├── routes/                      # Express routes
├── services/                    # Business logic
├── middleware/                  # Express middleware
├── package.json                 # Backend dependencies
├── .env.example                 # Environment template
├── client/                      # React frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── styles/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
\`\`\`

## System Requirements

- **Node.js**: 16.0.0 or higher
- **MongoDB**: Local or remote instance
- **Ollama**: For local AI models (DeepSeek-Coder, Llama, Mistral)
- **Storage**: 50GB+ for AI models
- **RAM**: 4GB+ minimum

## Installation & Setup

### Step 1: Install Backend Dependencies

\`\`\`bash
# Install root (backend) dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
\`\`\`

### Step 2: Setup Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

\`\`\`bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-generator

# Server
PORT=5000
CLIENT_URL=http://localhost:3000

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# AI Model
AI_MODEL_API_URL=http://localhost:11434
AI_MODEL_TYPE=deepseek-coder:6.7b

# Credits
DEFAULT_WEEKLY_CREDITS=10
CREDITS_PER_GENERATION=1
\`\`\`

### Step 3: Start MongoDB

\`\`\`bash
# If using local MongoDB
mongod --dbpath /path/to/data

# OR use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your Atlas connection string
\`\`\`

### Step 4: Setup Ollama & AI Models

\`\`\`bash
# Install Ollama from https://ollama.ai
# Then pull a model:

ollama pull deepseek-coder:6.7b
# OR
ollama pull llama2:latest
# OR
ollama pull mistral:latest

# Start Ollama server in a separate terminal
ollama serve
\`\`\`

### Step 5: Run Development Environment

**Terminal 1 - Backend (http://localhost:5000)**
\`\`\`bash
npm run dev
\`\`\`

**Terminal 2 - Frontend (http://localhost:3000)**
\`\`\`bash
npm run client
\`\`\`

Visit **http://localhost:3000** in your browser.

## Production Deployment

### Build Frontend

\`\`\`bash
npm run client-build
\`\`\`

This creates an optimized build in `client/dist/`.

### Run Production

\`\`\`bash
NODE_ENV=production npm start
\`\`\`

The server will:
- Serve the React frontend from `client/dist/`
- Run the Express API on the configured PORT
- Use production environment variables

## Troubleshooting

### "Cannot find module 'express'"
\`\`\`bash
npm install
\`\`\`

### "MongoDB connection error"
- Ensure MongoDB is running: `mongod --version`
- Check `MONGODB_URI` in `.env`
- Test connection: `mongodb+srv://user:pass@cluster.mongodb.net/`

### "AI Model not found"
\`\`\`bash
ollama list
ollama pull deepseek-coder:6.7b
ollama serve
\`\`\`

### Port 5000 already in use
\`\`\`bash
# Change PORT in .env or:
lsof -i :5000
kill -9 <PID>
\`\`\`

### Port 3000 already in use
\`\`\`bash
# Kill the process or change in client/vite.config.js
\`\`\`

## Architecture Overview

\`\`\`
┌─────────────────────────────────────────────┐
│         React Frontend (Port 3000)          │
│  Landing | Login | Dashboard | History     │
│  Code Editor | Live Preview                │
└──────────────────┬──────────────────────────┘
                   │ (API calls via axios)
                   ▼
┌─────────────────────────────────────────────┐
│      Express Backend (Port 5000)            │
│  /api/auth     - Authentication            │
│  /api/ai       - AI Generation              │
│  /api/download - Project Download           │
│  /api/admin    - Admin Management           │
└──────────────────┬──────────────────────────┘
                   │ (Database operations)
                   ▼
┌─────────────────────────────────────────────┐
│      MongoDB Database                       │
│  Users | Generations | AuditLogs            │
└─────────────────────────────────────────────┘

Local AI Model Integration:
┌─────────────────────────────────────────────┐
│      Ollama Server (Port 11434)             │
│  Running: DeepSeek-Coder, Llama, Mistral   │
└─────────────────────────────────────────────┘
\`\`\`

## API Documentation

See `README.md` for complete API endpoint documentation.

## Development Features

- **Hot Reload**: Backend restarts on file changes (`node --watch`)
- **Vite**: Frontend has instant HMR
- **Environment-based Config**: Separate dev/prod settings
- **Audit Logging**: All actions tracked
- **JWT Authentication**: Stateless auth tokens
- **MongoDB Schemas**: Validated data models

## Database Setup (First Time)

MongoDB collections are automatically created on first write. Initial admin user:
- Email: `admin@example.com`
- Password: `admin123`

## Performance Optimization

1. **Frontend**: Vite bundling with tree-shaking
2. **Backend**: Middleware optimization, connection pooling
3. **Database**: MongoDB indexes on frequently queried fields
4. **Caching**: Consider Redis for production
5. **AI Model**: Run on GPU machine for faster inference

## Next Steps

1. Create first user account (register at /register)
2. Generate first website via dashboard
3. Download and preview the generated project
4. Check admin panel to view stats

---

**For detailed API documentation, see README.md**
