import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, portalFor } from '../../context/AuthContext.jsx'

export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={portalFor(user?.role)} replace />
  }

  return children
}
