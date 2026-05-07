import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, Info } from 'lucide-react'

// Login page component
const Login = () => {
  const navigate = useNavigate()
  const { login, error, clearError } = useAuth()
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear errors when user types
    if (error) clearError()
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Validate form
  const validate = () => {
    const errors = {}
    
    if (!formData.identifier.trim()) {
      errors.identifier = 'Email or Employee ID is required'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setIsLoading(true)
    const result = await login(formData.identifier, formData.password)
    
    if (result.success) {
      navigate('/dashboard')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/20">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-slate-400">Sign in to manage your tasks</p>
        </div>

        {/* Login Form */}
        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Identifier Field */}
            <div>
              <label className="form-label" htmlFor="identifier">Email or Employee ID</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  className={`input-field pl-10 ${validationErrors.identifier ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="you@example.com or EMP001"
                  autoComplete="username"
                />
              </div>
              {validationErrors.identifier && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.identifier}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="form-label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-10 ${validationErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-dark-800 text-primary-600 focus:ring-primary-500" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-primary-400 hover:text-primary-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Role Info Message */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex gap-2">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-300">
                Your dashboard and features will adjust based on your role (Admin or Member) set during signup.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <Loader size="sm" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: CheckCircle, text: 'Free to use' },
            { icon: CheckCircle, text: 'No credit card' },
            { icon: CheckCircle, text: 'Cancel anytime' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <item.icon className="w-4 h-4 text-primary-500" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Login
