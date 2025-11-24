"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useState, useEffect } from "react"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import History from "./pages/History"
import GenerationDetail from "./pages/GenerationDetail"
import AdminPanel from "./pages/AdminPanel"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  const [authToken, setAuthToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // ⬅️ ADDED

  useEffect(() => {
    // Load user from localStorage BEFORE rendering routes
    const token = localStorage.getItem("authToken")
    const storedUser = localStorage.getItem("user")

    if (token && storedUser) {
      setAuthToken(token)
      setUser(JSON.parse(storedUser))
    }

    setLoading(false) // ⬅️ mark that we're ready
  }, [])

  const handleLogin = (token, userData) => {
    setAuthToken(token)
    setUser(userData)
    localStorage.setItem("authToken", token)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setAuthToken(null)
    setUser(null)
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
  }

  // ⛔ Prevent Router from rendering until user is loaded
  if (loading) return <div>Loading...</div>

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute authToken={authToken} user={user} onLogout={handleLogout}>
              <Dashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute authToken={authToken} user={user} onLogout={handleLogout}>
              <History user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/generation/:id"
          element={
            <ProtectedRoute authToken={authToken} user={user} onLogout={handleLogout}>
              <GenerationDetail user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute authToken={authToken} user={user} requireAdmin onLogout={handleLogout}>
              <AdminPanel user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
