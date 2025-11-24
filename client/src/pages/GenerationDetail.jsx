"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import CodeEditor from "../components/CodeEditor"
import LivePreview from "../components/LivePreview"
import "../styles/generation-detail.css"

export default function GenerationDetail({ user, onLogout }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [generation, setGeneration] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [copiedFile, setCopiedFile] = useState(null)

  useEffect(() => {
    fetchGeneration()
  }, [id])

  useEffect(() => {
    if (generation?.generatedCode?.files && generation.generatedCode.files.length > 0) {
      setSelectedFile(generation.generatedCode.files[0])
    }
  }, [generation])

  const fetchGeneration = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await axios.get(`/api/generations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setGeneration(response.data)
      setLoading(false)
    } catch (error) {
      setError("Failed to load generation")
      setLoading(false)
    }
  }

  const handleCopyFile = (file) => {
    navigator.clipboard.writeText(file.content)
    setCopiedFile(file.name)
    setTimeout(() => setCopiedFile(null), 2000)
  }

  const handleDownload = async () => {
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
      setError("Failed to download project")
    }
  }

  if (loading) {
    return (
      <div className="generation-loading">
        <div className="spinner"></div>
        <p>Loading generation...</p>
      </div>
    )
  }

  if (!generation) {
    return (
      <div className="generation-error">
        <h2>Generation not found</h2>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>
    )
  }

  const files = generation.generatedCode?.files || []
  const previewFiles = files.filter((f) => ["html", "jsx", "tsx"].includes(f.language))

  return (
    <div className="generation-detail">
      <header className="generation-header">
        <div className="header-left">
          <button onClick={() => navigate("/dashboard")} className="back-btn">
            ← Back
          </button>
          <h1>{generation.title}</h1>
          <span className="generation-type">{generation.type}</span>
        </div>
        <div className="header-right">
          <button onClick={handleDownload} className="download-btn">
            ⬇️ Download ZIP
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="preview-btn">
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="generation-container">
        <aside className="files-panel">
          <h3>Files ({files.length})</h3>
          <div className="files-list">
            {files.map((file, idx) => (
              <div
                key={idx}
                className={`file-item ${selectedFile?.name === file.name ? "active" : ""}`}
                onClick={() => setSelectedFile(file)}
              >
                <span className="file-icon">📄</span>
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-lang">{file.language}</div>
                </div>
                {copiedFile === file.name && <span className="copy-indicator">✓ Copied</span>}
              </div>
            ))}
          </div>
        </aside>

        <main className="editor-container">
          <div className="editor-toolbar">
            <div className="toolbar-left">
              {selectedFile && (
                <>
                  <span className="file-path">{selectedFile.path || selectedFile.name}</span>
                  <span className="file-language">{selectedFile.language}</span>
                </>
              )}
            </div>
            <div className="toolbar-right">
              {selectedFile && (
                <button onClick={() => handleCopyFile(selectedFile)} className="copy-btn" title="Copy to clipboard">
                  📋 Copy
                </button>
              )}
            </div>
          </div>

          {selectedFile ? (
            <CodeEditor file={selectedFile} readOnly />
          ) : (
            <div className="no-file-selected">Select a file to view</div>
          )}
        </main>

        {showPreview && previewFiles.length > 0 && (
          <div className="preview-container">
            <h3>Preview</h3>
            <LivePreview files={files} />
          </div>
        )}
      </div>

      <div className="generation-info">
        <p>
          <strong>Original Prompt:</strong> {generation.prompt}
        </p>
        <p>
          <strong>Created:</strong> {new Date(generation.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Credits Used:</strong> {generation.creditsUsed}
        </p>
      </div>
    </div>
  )
}
