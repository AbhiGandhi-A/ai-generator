"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "../styles/history.css"

export default function History({ user, onLogout }) {
  const [generations, setGenerations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const navigate = useNavigate()

  useEffect(() => {
    fetchGenerations()
  }, [])

  const fetchGenerations = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await axios.get("/api/generations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setGenerations(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch generations:", error)
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this generation?")) return

    try {
      const token = localStorage.getItem("authToken")
      await axios.delete(`/api/generations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setGenerations((prev) => prev.filter((g) => g._id !== id))
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  const handleDownload = async (id) => {
    try {
      const response = await axios.get(`/api/download/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `project-${id}.zip`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const filteredGenerations = filter === "all" ? generations : generations.filter((g) => g.type === filter)

  if (loading) {
    return <div className="loading">Loading history...</div>
  }

  return (
    <div className="history-page">
      <header className="history-header">
        <div className="header-content">
          <h1>Generation History</h1>
          <p>{generations.length} projects</p>
        </div>
        <button onClick={() => navigate("/dashboard")} className="back-btn">
          ← Back to Dashboard
        </button>
      </header>

      <div className="history-filters">
        <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          All
        </button>
        <button className={`filter-btn ${filter === "website" ? "active" : ""}`} onClick={() => setFilter("website")}>
          Websites
        </button>
        <button className={`filter-btn ${filter === "mern-app" ? "active" : ""}`} onClick={() => setFilter("mern-app")}>
          MERN Apps
        </button>
        <button
          className={`filter-btn ${filter === "tsx-react" ? "active" : ""}`}
          onClick={() => setFilter("tsx-react")}
        >
          TSX Projects
        </button>
      </div>

      <div className="history-grid">
        {filteredGenerations.length === 0 ? (
          <div className="empty-state">
            <p>No generations found</p>
          </div>
        ) : (
          filteredGenerations.map((gen) => (
            <div key={gen._id} className="history-card">
              <div className="card-header">
                <h3>{gen.title}</h3>
                <span className="type-badge">{gen.type}</span>
              </div>
              <p className="prompt">{gen.prompt.substring(0, 100)}...</p>
              <div className="card-meta">
                <span>{new Date(gen.createdAt).toLocaleDateString()}</span>
                <span>{gen.status === "completed" ? "✓" : gen.status === "failed" ? "✗" : "⟳"}</span>
              </div>
              <div className="card-actions">
                <button onClick={() => navigate(`/generation/${gen._id}`)} className="action-btn view" title="View">
                  View
                </button>
                {gen.status === "completed" && (
                  <button onClick={() => handleDownload(gen._id)} className="action-btn download" title="Download">
                    Download
                  </button>
                )}
                <button onClick={() => handleDelete(gen._id)} className="action-btn delete" title="Delete">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
