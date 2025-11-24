import axios from "axios"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import { fileURLToPath } from "url"

const execAsync = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * AI Service - Handles integration with local AI models
 * Supports: DeepSeek-Coder, Llama, Mistral, and other Ollama-compatible models
 */
export class AIService {
  constructor() {
    this.modelUrl = process.env.AI_MODEL_API_URL || "https://f6965870b619.ngrok-free.app"
    this.model = process.env.AI_MODEL_TYPE || "deepseek-coder:6.7b"
    this.timeout = 300000
    this.maxRetries = 3
    this.retryDelay = 2000
  }

  /**
   * Generate website or app code based on user prompt
   */
  async generateCode(prompt, type = "website", userId = null) {
    try {
      console.log(`[AI Service] Generating ${type} for user: ${userId}`)
      console.log(`[AI Service] Initial Prompt: ${prompt}`)

      const finalPrompt = this._expandPrompt(prompt, type)
      console.log(`[AI Service] Final Expanded Prompt: ${finalPrompt.substring(0, 150)}...`)

      const systemPrompt = this._buildSystemPrompt(type)
      const userPrompt = this._buildUserPrompt(finalPrompt, type)

      const response = await this._callOllamaAPI(systemPrompt, userPrompt)

      if (!response) {
        throw new Error("Empty response from AI model")
      }

      const parsedCode = this._parseGeneratedCode(response, type)

      if (!parsedCode || !parsedCode.files || parsedCode.files.length === 0) {
        console.error(`[AI Service] Raw AI Response (First 500 chars):\n${response.substring(0, 500)}...`)
        throw new Error("Failed to parse generated code. Check the response format.")
      }

      return {
        success: true,
        data: parsedCode,
        model: this.model,
        generatedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error("[AI Service] Generation error:", error.message)
      return {
        success: false,
        error: error.message,
        fallback: this._generateFallbackCode(type),
      }
    }
  }

  async _checkModelStatus() {
    try {
      const statusEndpoint = `${this.modelUrl}/api/show`
      console.log(`[AI Service] Checking model status at: ${statusEndpoint}`)

      await axios.post(statusEndpoint, { name: this.model }, { timeout: 5000 })
      console.log(`[AI Service] Model '${this.model}' is available via HTTP API.`)
      return true
    } catch (error) {
      const status = error.response ? error.response.status : "Network/Timeout"
      console.warn(`[AI Service] Model status check failed for '${this.model}' (Status: ${status}).`)
      return false
    }
  }

  /**
   * Call Ollama API with retry mechanism
   */
  async _callOllamaAPI(systemPrompt, userPrompt) {
    const fullPrompt = `${systemPrompt}\n\nUser Request: ${userPrompt}`
    const apiEndpoint = `${this.modelUrl}/api/generate`

    for (let i = 0; i < this.maxRetries; i++) {
      try {
        console.log(`[AI Service] Attempting HTTP API call (Attempt ${i + 1}/${this.maxRetries})`)

        if (i === 0) {
          this._checkModelStatus()
        }

        const response = await axios.post(
          apiEndpoint,
          {
            model: this.model,
            prompt: fullPrompt,
            stream: false,
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            repeat_penalty: 1.1,
          },
          { timeout: this.timeout, headers: { "Content-Type": "application/json" } },
        )

        console.log(`[AI Service] HTTP API response received on attempt ${i + 1}`)
        return response.data?.response || ""
      } catch (httpError) {
        if (axios.isAxiosError(httpError)) {
          if (httpError.response?.status === 404 || httpError.response?.status === 400) {
            console.error(`[AI Service] Received HTTP ${httpError.response.status}. Stopping retries.`)
            break
          }
          console.warn(`[AI Service] HTTP API failed (${httpError.code || httpError.message}). Retrying...`)
        } else {
          console.warn(`[AI Service] HTTP API failed: ${httpError.message}. Retrying...`)
        }

        if (i === this.maxRetries - 1) {
          console.error(`[AI Service] HTTP API failed after ${this.maxRetries} attempts.`)
          break
        }

        await new Promise((resolve) => setTimeout(resolve, this.retryDelay))
      }
    }

    console.log("[AI Service] Falling back to CLI approach...")

    try {
      const escapedPrompt = fullPrompt.replace(/"/g, '\\"')
      const cliCommand = `ollama run ${this.model} "${escapedPrompt}"`
      console.log(`[AI Service] Executing CLI command: ${cliCommand.substring(0, 150)}...`)

      const { stdout } = await execAsync(cliCommand, {
        timeout: this.timeout,
        maxBuffer: 10 * 1024 * 1024,
      })

      console.log("[AI Service] CLI response received")
      return stdout
    } catch (cliError) {
      console.error("[AI Service] All endpoints failed:", cliError.message)
      throw cliError
    }
  }

  _buildSystemPrompt(type) {
    const basePrompt = `You are an expert web developer. Generate production-ready code with ONLY code output - no explanations or markdown.
Use file delimiter format: ---FILE: filename---`

    if (type === "website") {
      return `${basePrompt}
Generate complete HTML/CSS/JavaScript website.
Format:
---FILE: index.html---
[complete HTML code]
---FILE: styles.css---
[complete CSS code]
---FILE: script.js---
[complete JavaScript code]

Requirements:
- Fully responsive design
- Modern animations and transitions
- Professional UI/UX
- No external CDN dependencies
- Inline all styles
- Self-contained JavaScript`
    }

    if (type === "tsx-react" || type === "jsx-react") {
      return `${basePrompt}
Generate JavaScript/JSX React application files.
Format:
---FILE: package.json---
[package.json with dependencies]
---FILE: App.jsx---
[main App component]
---FILE: components/Header.jsx---
[component code]
---FILE: styles/App.css---
[CSS styles]

Requirements:
- Use React hooks (useState, useEffect)
- JavaScript/JSX (NOT TypeScript)
- Responsive design
- Modern component structure`
    }

    return basePrompt
  }

  _buildUserPrompt(expandedPrompt, type) {
    if (type === "website") {
      return `Create a website: ${expandedPrompt}`
    }
    if (type === "tsx-react" || type === "jsx-react") {
      return `Create a React app using JavaScript/JSX: ${expandedPrompt}`
    }
    return `Create an app: ${expandedPrompt}`
  }

  _expandPrompt(userPrompt, type) {
    const corrections = {
      "make todo app":
        "A feature-rich To-Do list application with the ability to add, delete, and mark tasks as complete. Use local storage to save tasks.",
      "create login page":
        "A professional, fully responsive login and registration form component with client-side validation.",
      "build portfolio": "A single-page developer portfolio with Hero, Projects, Skills, and Contact sections.",
      "generate ecommerce homepage":
        "A clean, modern e-commerce homepage with featured products, navigation, and footer.",
    }

    const key = userPrompt.toLowerCase().trim()
    let expandedPrompt = corrections[key] || userPrompt

    if (type === "website" && !expandedPrompt.includes("vanilla HTML")) {
      expandedPrompt += " Implement using clean, semantic vanilla HTML, CSS, and JavaScript."
    }

    if ((type === "tsx-react" || type === "jsx-react") && !expandedPrompt.includes("JavaScript/JSX")) {
      expandedPrompt += " Ensure all components use JavaScript/JSX and modern React best practices."
    }

    return expandedPrompt.trim()
  }

  _sanitizeJS(code) {
    if (!code) return ""

    return code
      .replace(/<｜.*?｜>/g, "")
      .replace(/^\s*"[^"]*"\s*$/gm, "")
      .replace(/^\s*'[^']*'\s*$/gm, "")
      .replace(/^\s*""\s*$/gm, "")
      .replace(/^\s*"+"\s*$/gm, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .trim()
  }

  /**
   * Fixed formatter to handle indentation properly
   */
  _formatCode(content, language) {
    if (!content) return ""

    const lines = content.split("\n")
    const formattedLines = []
    let indentLevel = 0
    const indent = "  "

    for (const line of lines) {
      const trimmed = line.trim()

      if (!trimmed) {
        formattedLines.push("")
        continue
      }

      // Decrease indent for closing braces/tags
      if (trimmed.startsWith("}") || trimmed.startsWith("</") || trimmed.match(/^<\/\w+>/)) {
        indentLevel = Math.max(0, indentLevel - 1)
      }

      formattedLines.push(indent.repeat(indentLevel) + trimmed)

      // Increase indent for opening braces/tags (but not if also closing on same line)
      if (
        (trimmed.includes("{") && !trimmed.includes("}")) ||
        (trimmed.match(/<\w+[^>]*>/) && !trimmed.match(/<\/\w+>/))
      ) {
        indentLevel++
      }
    }

    return formattedLines.join("\n")
  }

  _fixHTML(content) {
    if (!content) return ""

    let html = content.trim()

    if (!html.toLowerCase().includes("<!doctype html>")) {
      html = `<!DOCTYPE html>\n${html}`
    }

    if (!html.toLowerCase().includes("<html")) {
      html = html.replace(/^<!DOCTYPE html>\n?/i, "<!DOCTYPE html>\n<html>\n")
    }

    if (!html.includes("</html>")) {
      html = `${html}\n</html>`
    }

    if (!html.toLowerCase().includes("<head")) {
      html = html.replace(/<html[^>]*>/i, `<html>\n<head>\n<meta charset="UTF-8">\n<title>App</title>\n</head>`)
    }

    if (!html.toLowerCase().includes("<body")) {
      html = html.replace(/<\/head>/i, "</head>\n<body>")
    }

    if (!html.toLowerCase().includes("</body>")) {
      html = html.replace(/<\/html>/i, "</body>\n</html>")
    }

    return html
  }

  /**
   * Improved parsing to handle incomplete responses
   */
  _parseGeneratedCode(response, type) {
    const files = []
    const fileChunks = response.split(/---FILE:\s*(.+?)\s*---/g).filter(Boolean)

    // If odd number of chunks, use fallback parser
    if (fileChunks.length % 2 !== 0 && fileChunks.length > 0) {
      console.warn(`[AI Service] Incomplete response detected. Using fallback parser.`)
      return this._legacyParseGeneratedCode(response, type)
    }

    for (let i = 0; i < fileChunks.length; i += 2) {
      const fileName = fileChunks[i].trim()
      let content = (fileChunks[i + 1] || "").trim()

      if (!fileName) continue

      const language = this._detectLanguage(fileName)

      // Process content
      if (language === "html") {
        content = this._fixHTML(content)
      }

      if (["javascript", "jsx"].includes(language)) {
        content = this._sanitizeJS(content)
        if (!content.trim()) {
          content = "console.log('Ready');"
        }
        const opens = (content.match(/{/g) || []).length
        let closes = (content.match(/}/g) || []).length
        while (closes < opens) {
          content += "\n}"
          closes++
        }
      }

      content = this._formatCode(content, language)

      files.push({
        name: fileName,
        path: this._generateFilePath(fileName, type),
        content: content,
        language: language,
      })
    }

    return {
      files,
      projectStructure: this._generateProjectStructure(files, type),
      startCommand: this._generateStartCommand(type),
      type,
    }
  }

  _legacyParseGeneratedCode(response, type) {
    const files = []
    const lines = response.split("\n")
    let currentFile = null
    let currentContent = []

    for (const line of lines) {
      if (line.startsWith("---FILE:") && line.endsWith("---")) {
        if (currentFile) {
          let content = currentContent.join("\n").trim()
          const language = this._detectLanguage(currentFile.name)

          if (language === "html") {
            content = this._fixHTML(content)
          }

          if (["javascript", "jsx"].includes(language)) {
            content = this._sanitizeJS(content)
            if (!content.trim()) {
              content = "console.log('Ready');"
            }
            const opens = (content.match(/{/g) || []).length
            let closes = (content.match(/}/g) || []).length
            while (closes < opens) {
              content += "\n}"
              closes++
            }
          }

          content = this._formatCode(content, language)

          files.push({
            name: currentFile.name,
            path: currentFile.path,
            content: content,
            language: language,
          })
        }

        const match = line.match(/---FILE:\s*(.+?)\s*---/)
        if (match) {
          currentFile = {
            name: match[1].trim(),
            path: this._generateFilePath(match[1].trim(), type),
          }
          currentContent = []
        }
      } else if (currentFile) {
        currentContent.push(line)
      }
    }

    if (currentFile) {
      let content = currentContent.join("\n").trim()
      const language = this._detectLanguage(currentFile.name)

      if (language === "html") {
        content = this._fixHTML(content)
      }

      if (["javascript", "jsx"].includes(language)) {
        content = this._sanitizeJS(content)
        if (!content.trim()) {
          content = "console.log('Ready');"
        }
        const opens = (content.match(/{/g) || []).length
        let closes = (content.match(/}/g) || []).length
        while (closes < opens) {
          content += "\n}"
          closes++
        }
      }

      content = this._formatCode(content, language)

      files.push({
        name: currentFile.name,
        path: currentFile.path,
        content: content,
        language: language,
      })
    }

    return {
      files,
      projectStructure: this._generateProjectStructure(files, type),
      startCommand: this._generateStartCommand(type),
      type,
    }
  }

  _detectLanguage(fileName) {
    const ext = fileName.split(".").pop().toLowerCase()
    const map = {
      js: "javascript",
      jsx: "jsx",
      html: "html",
      css: "css",
      json: "json",
    }
    return map[ext] || "plaintext"
  }

  _generateFilePath(fileName, type) {
    if (type === "website") {
      return fileName
    }
    if (type === "tsx-react" || type === "jsx-react") {
      if (fileName.includes("package.json")) return fileName
      if (fileName.includes("src/")) return fileName
      return `src/${fileName}`
    }
    return fileName
  }

  _generateProjectStructure(files, type) {
    if (type === "website") {
      return `project/
├── index.html
├── styles.css
└── script.js`
    }
    return `project/
├── package.json
├── App.jsx
├── components/
└── styles/`
  }

  _generateStartCommand(type) {
    if (type === "website") {
      return "Open index.html in your browser"
    }
    return "npm install && npm start"
  }

  _generateFallbackCode(type) {
    if (type === "website") {
      return {
        files: [
          {
            name: "index.html",
            path: "index.html",
            content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Website</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>Welcome</h1>
  </header>
  <main>
    <h2>Your content here</h2>
  </main>
  <script src="script.js"></script>
</body>
</html>`,
            language: "html",
          },
          {
            name: "styles.css",
            path: "styles.css",
            content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
  background: #f5f5f5;
}

header {
  background: #333;
  color: white;
  padding: 20px;
}

main {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
}`,
            language: "css",
          },
          {
            name: "script.js",
            path: "script.js",
            content: `console.log('Website loaded successfully');`,
            language: "javascript",
          },
        ],
      }
    }
    return { files: [] }
  }
}

export const aiService = new AIService()
