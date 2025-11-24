"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import CreditCounter from "../components/CreditCounter"
import "../styles/dashboard.css"

export default function Dashboard({ user, onLogout }) {
    const [generations, setGenerations] = useState([])
    const [loading, setLoading] = useState(true)
    const [prompt, setPrompt] = useState("")
    // FIX: Renamed 'mern-app' to 'mern' to align with the backend's type logic
    const [generationType, setGenerationType] = useState("website") 
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [credits, setCredits] = useState(user?.credits || 0)
    const [isGenerating, setIsGenerating] = useState(false)
    
    // 💡 NEW STATE for Progress Tracking
    const [progress, setProgress] = useState(0) // 0 to 100
    const [timeRemaining, setTimeRemaining] = useState(0) // seconds
    const progressIntervalRef = useRef(null)
    const timerIntervalRef = useRef(null)

    const navigate = useNavigate()

    useEffect(() => {
        fetchGenerations()
        
        // Cleanup function for intervals
        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
        }
    }, [])

    const fetchGenerations = async () => {
        try {
            const token = localStorage.getItem("authToken")
            const response = await axios.get("/api/generations", {
                headers: { Authorization: `Bearer ${token}` },
            })
            setGenerations(response.data.slice(0, 6))
            setLoading(false)
        } catch (error) {
            setError("Failed to load generations")
            setLoading(false)
        }
    }

    // 💡 NEW FUNCTION: Simulate real-time progress updates
    const startProgressSimulation = () => {
        const totalDuration = 60 // Simulate generation taking 60 seconds
        let currentTime = 0
        
        setProgress(0)
        setTimeRemaining(totalDuration)
        
        // Simulate progress bar increase
        progressIntervalRef.current = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + (100 / totalDuration)
                return Math.min(newProgress, 99); // Stop just before 100
            })
        }, 1000)

        // Simulate countdown timer
        timerIntervalRef.current = setInterval(() => {
            currentTime += 1
            const remaining = totalDuration - currentTime
            setTimeRemaining(Math.max(0, remaining))
            
            if (remaining <= 0) {
                clearInterval(timerIntervalRef.current)
            }
        }, 1000)
    }

    const stopProgressSimulation = () => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
        progressIntervalRef.current = null
        timerIntervalRef.current = null
        setProgress(0)
        setTimeRemaining(0)
    }


    const handleCreateGeneration = async (e) => {
        e.preventDefault()
        if (!prompt.trim()) {
            setError("Please enter a prompt")
            return
        }

        if (credits < 1) {
            setError("Insufficient credits. Please wait for your weekly reset.")
            return
        }

        setIsGenerating(true)
        setError("")
        setSuccess("")

        // 💡 Start streaming simulation *before* the API call
        startProgressSimulation()

        try {
            const token = localStorage.getItem("authToken")
            const response = await axios.post(
                "/api/ai/generate",
                { prompt, type: generationType },
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    // Set a longer timeout for the actual generation process
                    timeout: 300000 // 5 minutes
                }
            )
            
            // On success
            stopProgressSimulation() // Stop simulation
            setCredits(credits - 1)
            setPrompt("")
            setSuccess("Project generated successfully!")
            setTimeout(() => setSuccess(""), 3000)

            // Final progress update to 100% before navigation
            setProgress(100) 
            setTimeout(() => {
                navigate(`/generation/${response.data.generation._id}`)
            }, 500) // Small delay to show 100%

        } catch (error) {
            stopProgressSimulation() // Stop simulation on error
            setError(error.response?.data?.error || "Failed to generate project. Check server logs.")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleLogout = () => {
        onLogout()
        navigate("/")
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    const GenerationStatus = () => {
        if (isGenerating) {
            return (
                <div className="generation-status-box">
                    <p className="status-message">
                        **Generating Project...** This may take a moment.
                    </p>
                    <div className="progress-bar-container">
                        <div 
                            className="progress-bar-fill" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="progress-details">
                        <span>Progress: **{Math.round(progress)}%**</span>
                        <span>Estimated Time Left: **{formatTime(timeRemaining)}**</span>
                    </div>
                </div>
            )
        }
        return null;
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="dashboard-logo">⚡ AI Generator</div>
                <div className="dashboard-user">
                    <span>{user?.username}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </header>

            <div className="dashboard-container">
                <aside className="sidebar">
                    <CreditCounter userId={user?.id} onCreditsChanged={setCredits} />
                    <nav className="sidebar-nav">
                        <a href="#" className="nav-item active">
                            Dashboard
                        </a>
                        <a href="#" onClick={() => navigate("/history")} className="nav-item">
                            History
                        </a>
                        <a href="#" className="nav-item">
                            Settings
                        </a>
                    </nav>
                </aside>

                <main className="dashboard-main">
                    <section className="generation-section">
                        <h1>Create New Project</h1>

                        {error && <div className="error-banner">{error}</div>}
                        {success && <div className="success-banner">{success}</div>}
                        
                        {/* 💡 Display the dynamic status */}
                        <GenerationStatus />

                        <form onSubmit={handleCreateGeneration} className="generation-form">
                            <div className="form-group">
                                <label className="form-label">Project Description</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Describe the website or app you want to create... (e.g., 'Create a modern portfolio website with animations', 'Build a full-stack e-commerce MERN app')"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    rows="5"
                                    disabled={isGenerating}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Project Type</label>
                                <select
                                    className="form-select"
                                    value={generationType}
                                    onChange={(e) => setGenerationType(e.target.value)}
                                    disabled={isGenerating}
                                >
                                    <option value="website">Static Website (HTML/CSS/JS)</option>
                                    <option value="mern">Full MERN App (MongoDB, Express, React, Node)</option>
                                    <option value="tsx-react">React App (TypeScript/TSX)</option>
                                </select>
                            </div>

                            <button type="submit" className="form-button" disabled={isGenerating || credits < 1}>
                                {isGenerating ? "⟳ Generating..." : `Generate Project (${credits} credits)`}
                            </button>
                        </form>
                    </section>

                    <section className="history-section">
                        <div className="section-header">
                            <h2>Recent Projects</h2>
                            {generations.length > 0 && (
                                <a href="#" onClick={() => navigate("/history")} className="view-all">
                                    View all
                                </a>
                            )}
                        </div>

                        {loading ? (
                            <p className="empty-message">Loading...</p>
                        ) : generations.length === 0 ? (
                            <p className="empty-message">No projects yet. Create your first one!</p>
                        ) : (
                            <div className="generations-grid">
                                {generations.map((gen) => (
                                    <div key={gen._id} className="generation-card" onClick={() => navigate(`/generation/${gen._id}`)}>
                                        <h3>{gen.title}</h3>
                                        <p className="gen-type">{gen.type}</p>
                                        <p className="gen-date">{new Date(gen.createdAt).toLocaleDateString()}</p>
                                        <button className="gen-view-btn">View →</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    )
}