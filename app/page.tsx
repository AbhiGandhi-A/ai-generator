export default function Page() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>AI Website Generator</h1>
      <p>This is a MERN Stack Application with Separate Backend and Frontend</p>

      <div style={{ marginTop: "2rem" }}>
        <h2>Quick Start</h2>
        <ol style={{ textAlign: "left", maxWidth: "600px", margin: "0 auto" }}>
          <li>
            Install dependencies: <code>npm install && cd client && npm install && cd ..</code>
          </li>
          <li>Setup MongoDB and Ollama (see SETUP.md)</li>
          <li>Create .env file (copy from .env.example)</li>
          <li>
            Terminal 1: <code>npm run dev</code> (Backend)
          </li>
          <li>
            Terminal 2: <code>npm run client</code> (Frontend)
          </li>
          <li>
            Visit <code>http://localhost:3000</code>
          </li>
        </ol>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2>Architecture</h2>
        <p>Backend runs on port 5000 (Express + Node.js + MongoDB)</p>
        <p>Frontend runs on port 3000 (React + Vite)</p>
        <p>AI Models run on Ollama (port 11434)</p>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <a
          href="http://localhost:3000"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#7c3aed",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
          }}
        >
          Go to Application →
        </a>
      </div>

      <p style={{ marginTop: "2rem", color: "#666" }}>See SETUP.md and README.md for complete documentation</p>
    </div>
  )
}
