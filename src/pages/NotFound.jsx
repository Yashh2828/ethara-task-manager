import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

// 404 Not Found page
const NotFound = () => {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* 404 Icon */}
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-slate-500">404</span>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="btn-primary"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
