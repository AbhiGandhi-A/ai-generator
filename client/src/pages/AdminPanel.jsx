"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "../styles/admin.css"

export default function AdminPanel({ user, onLogout }) {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/dashboard")
    }
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const headers = { Authorization: `Bearer ${token}` }

      const [usersRes, statsRes] = await Promise.all([
        axios.get("/api/admin/users", { headers }),
        axios.get("/api/admin/stats", { headers }),
      ])

      setUsers(usersRes.data)
      setStats(statsRes.data)
      setLoading(false)
    } catch (error) {
      console.error("Failed to load admin data:", error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    onLogout()
    navigate("/")
  }

  if (loading) return <div className="admin-loading">Loading...</div>

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <div className="admin-logo">⚙️ Admin Panel</div>
        <div className="admin-user">
          <span>{user?.username} (Admin)</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="admin-container">
        <section className="stats-section">
          <h2>System Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats?.totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.activeUsers}</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.totalGenerations}</div>
              <div className="stat-label">Total Generations</div>
            </div>
          </div>
        </section>

        <section className="users-section">
          <h2>Users</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Credits</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.credits}</td>
                  <td>{u.isActive ? "✓" : "✗"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
