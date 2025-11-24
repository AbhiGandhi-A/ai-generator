# AI Website Generator - MERN Stack

A production-ready, fully offline AI-powered website and application generator built with MERN (MongoDB, Express, React, Node.js). Generate complete websites and full-stack applications using local AI models without any external APIs or cloud services.

## Features

- **100% Offline**: No external API calls, no cloud dependencies
- **Local AI Models**: Integrates with Ollama and local model deployments (DeepSeek-Coder, Llama, Mistral)
- **User Authentication**: Secure JWT-based auth with bcrypt password hashing
- **Weekly Credits**: 10 free credits per week, automatic resets via cron jobs
- **Three Project Types**:
  - Static Websites (HTML/CSS/JavaScript)
  - Full MERN Applications (MongoDB, Express, React, Node)
  - TypeScript/TSX React Projects
- **Code Editor**: Full code viewing with syntax highlighting
- **Live Preview**: Real-time preview of generated websites
- **Project Download**: Download generated projects as ZIP files
- **Generation History**: Track all your generated projects
- **Admin Panel**: Manage users, credits, and system statistics
- **Secure**: Protection against XSS, CSRF, SQL injection, brute-force attacks
- **Responsive Design**: Works on desktop, tablet, and mobile

## System Requirements

- Node.js 16+
- MongoDB (local or remote)
- Ollama (for local AI models) - OR configured AI API endpoint
- 50GB+ storage for AI models
- 4GB+ RAM recommended

## Installation

### 1. Clone and Install Dependencies

\`\`\`bash
git clone <repository>
cd ai-website-generator
npm install
cd client && npm install && cd ..
\`\`\`

### 2. Setup Environment Variables

Create a `.env` file in the project root:

\`\`\`bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-generator

# Server
PORT=5000
CLIENT_URL=http://localhost:3000

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Session
SESSION_SECRET=your_super_secret_session_key

# AI Model (Ollama or compatible API)
AI_MODEL_PATH=/models/deepseek-coder
AI_MODEL_API_URL=http://localhost:11434
AI_MODEL_TYPE=deepseek-coder:6.7b

# Credits
DEFAULT_WEEKLY_CREDITS=10
CREDITS_PER_GENERATION=1

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
\`\`\`

### 3. Setup MongoDB

\`\`\`bash
# If using local MongoDB
mongod --dbpath /path/to/data

# Or use MongoDB Atlas for remote database
\`\`\`

### 4. Setup Ollama and AI Models

\`\`\`bash
# Install Ollama from https://ollama.ai
ollama pull deepseek-coder:6.7b
# or
ollama pull llama2
# or
ollama pull mistral

# Run Ollama server
ollama serve
\`\`\`

### 5. Build and Run

\`\`\`bash
# Development mode
npm run dev

# Production build
npm run build

# Production run
npm start
\`\`\`

Visit `http://localhost:3000` in your browser.

## Project Structure

\`\`\`
├── server.js                    # Main server entry point
├── models/                      # Database models
│   ├── User.js
│   ├── Generation.js
│   └── AuditLog.js
├── routes/                      # API routes
│   ├── auth.js
│   ├── users.js
│   ├── generations.js
│   ├── admin.js
│   ├── ai.js
│   └── download.js
├── services/                    # Business logic
│   ├── aiService.js
│   ├── creditService.js
│   ├── auditService.js
│   └── codePackageService.js
├── middleware/                  # Express middleware
│   ├── auth.js
│   └── validation.js
├── client/                      # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   ├── GenerationDetail.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── components/
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── LivePreview.jsx
│   │   │   ├── CreditCounter.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── styles/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── package.json
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Generations
- `GET /api/generations` - Get user's generations
- `GET /api/generations/:id` - Get single generation
- `POST /api/ai/generate` - Generate new project
- `GET /api/ai/status/:id` - Check generation status

### Downloads
- `GET /api/download/:id` - Download project as ZIP

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `POST /api/admin/users/:id/credits` - Add credits
- `POST /api/admin/users/:id/deactivate` - Deactivate user
- `GET /api/admin/audit-logs` - View audit logs
- `GET /api/admin/stats` - System statistics

## Security Features

✅ **Authentication**: JWT-based with secure token management  
✅ **Password Security**: Bcryptjs with salt rounds (10)  
✅ **CORS Protection**: Configured and validated origins  
✅ **XSS Prevention**: Helmet.js and input validation  
✅ **Rate Limiting**: Built-in rate limiting for API endpoints  
✅ **CSRF Protection**: CORS-based CSRF prevention  
✅ **NoSQL Injection**: Mongoose schema validation  
✅ **Brute Force**: Login attempt tracking (can be enhanced)  
✅ **Audit Logging**: Complete action logging for admin review  
✅ **Role-Based Access**: User and Admin roles with middleware protection  

## Credit System

- **Initial Credits**: 10 free credits on registration
- **Weekly Reset**: Automatic reset every 7 days
- **Per Generation**: 1 credit per project generation
- **Admin Override**: Admins can manually add credits
- **Timestamp-Based**: Reset calculated on login or scheduled cron

## AI Model Integration

The platform supports any Ollama-compatible model:

- **DeepSeek-Coder**: Best for code generation
- **Llama 2**: Versatile general-purpose model
- **Mistral**: Fast and efficient
- **Neural Chat**: Conversational and code

To add a different model:

1. Pull the model in Ollama: `ollama pull model-name:tag`
2. Update `.env`: `AI_MODEL_TYPE=model-name:tag`
3. Restart the server

## Customization

### Change Default Credits
Edit `DEFAULT_WEEKLY_CREDITS` in `.env`

### Change Credit Cost
Edit `CREDITS_PER_GENERATION` in `.env`

### Customize AI Prompts
Edit `_buildSystemPrompt()` in `services/aiService.js`

### Modify Generation Types
Add new types in `Generation.js` schema and `_buildPrompt()` methods

## Troubleshooting

### "AI Model not responding"
- Ensure Ollama is running: `ollama serve`
- Check `AI_MODEL_API_URL` is correct
- Verify model is pulled: `ollama list`

### "Insufficient credits"
- Credits reset weekly automatically
- Admin can manually add credits via admin panel
- Check credit reset timestamp in database

### "Download fails"
- Ensure `/tmp` directory has write permissions
- Check disk space for ZIP creation
- Verify generated project has files

### "MongoDB connection error"
- Ensure MongoDB is running
- Check `MONGODB_URI` connection string
- Verify network connectivity to MongoDB

## Performance Tips

1. Use SSD for MongoDB data directory
2. Allocate 4GB+ RAM for AI models
3. Run Ollama on same machine or LAN for lowest latency
4. Use a reverse proxy (nginx) for production
5. Enable compression in Express config
6. Cache frequently generated code patterns

## Production Deployment

1. **Environment**: Set `NODE_ENV=production`
2. **Secrets**: Use strong JWT and session secrets
3. **Database**: Use MongoDB Atlas or managed service
4. **AI Models**: Deploy on dedicated GPU machine
5. **Reverse Proxy**: Use nginx/Apache
6. **SSL/TLS**: Enable HTTPS
7. **Monitoring**: Setup error logging and monitoring
8. **Backups**: Regular database backups
9. **Rate Limiting**: Enable Redis-based rate limiting
10. **Load Balancing**: Use load balancer for scalability

## License

MIT

## Support

For issues, questions, or contributions, please open an issue or pull request.

---

**Built with ❤️ for developers who value privacy and control over their code generation.**
