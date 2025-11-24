import { Link } from "react-router-dom"
import "../styles/landing.css"

export default function Landing() {
  return (
    <div className="landing">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-logo">AI Generator</div>
          <div className="navbar-links">
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-button">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Build Websites With AI, Offline</h1>
          <p className="hero-subtitle">
            Generate stunning websites and full-stack applications with a single prompt. Powered by local AI, no APIs,
            no limits.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Start Free
            </Link>
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Generate complete projects in seconds with advanced local AI models</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>100% Private</h3>
            <p>All processing happens offline. Your code never leaves your machine</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Beautiful Output</h3>
            <p>Modern designs with animations, responsive layouts, and best practices</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Production Ready</h3>
            <p>Download complete projects with all dependencies and configurations</p>
          </div>
        </div>
      </section>
    </div>
  )
}
