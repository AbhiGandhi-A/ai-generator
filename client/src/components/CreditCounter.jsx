"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import "../styles/credit-counter.css"

export default function CreditCounter({ userId, onCreditsChanged }) {
  const [credits, setCredits] = useState(0)
  const [nextReset, setNextReset] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCredits()
    const interval = setInterval(fetchCredits, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [userId])

  const fetchCredits = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await axios.get("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })

      setCredits(response.data.credits)

      // Calculate next reset time
      const lastReset = new Date(response.data.lastCreditReset)
      const nextResetTime = new Date(lastReset.getTime() + 7 * 24 * 60 * 60 * 1000)
      setNextReset(nextResetTime)

      setLoading(false)

      if (onCreditsChanged) {
        onCreditsChanged(response.data.credits)
      }
    } catch (error) {
      console.error("Failed to fetch credits:", error)
      setLoading(false)
    }
  }

  const getDaysUntilReset = () => {
    if (!nextReset) return 0
    const now = new Date()
    const daysLeft = Math.ceil((nextReset - now) / (1000 * 60 * 60 * 24))
    return Math.max(0, daysLeft)
  }

  if (loading) {
    return <div className="credit-counter loading">Loading...</div>
  }

  return (
    <div className="credit-counter">
      <div className="credits-display">
        <div className="credits-number">{credits}</div>
        <div className="credits-label">Credits</div>
      </div>
      <div className="reset-info">
        <div className="reset-label">Resets in</div>
        <div className="reset-days">{getDaysUntilReset()} days</div>
      </div>
    </div>
  )
}
