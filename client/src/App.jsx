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
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("authToken"))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (authToken) {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
  }, [authToken])

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
            <ProtectedRoute authToken={authToken} user={user} onLogout={handleLogout} requireAdmin>
              <AdminPanel user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
