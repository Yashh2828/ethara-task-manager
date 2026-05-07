import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

// Protected route component - redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Also check localStorage directly as fallback
  const hasToken = localStorage.getItem('token')
  const isAuth = isAuthenticated || !!hasToken

  // Show loader while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Render children if authenticated
  return children
}

export default ProtectedRoute
