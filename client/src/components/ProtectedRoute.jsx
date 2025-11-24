import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ authToken, user, children, onLogout, requireAdmin = false }) {
  if (!authToken) {
    return <Navigate to="/login" />
  }

  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/dashboard" />
  }

  return children
}
