import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, CheckCircle, Briefcase, CreditCard } from 'lucide-react'

// Signup page component
const Signup = () => {
  const navigate = useNavigate()
  const { signup, error, clearError } = useAuth()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'member',  // Add role selection
    employee_id: '',
    designation: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [agreedToTerms, setAgreedToTerms] = useState(false)

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
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required'
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.employee_id.trim()) {
      errors.employee_id = 'Employee ID is required'
    }
    
    if (!agreedToTerms) {
      errors.terms = 'You must agree to the terms'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setIsLoading(true)
    
    // Prepare data (exclude confirmPassword, keep selected role)
    const { confirmPassword, ...signupData } = formData
    // Role is already set in formData from the UI selection
    
    console.log('Signup data:', signupData) // Debug log
    
    const result = await signup(signupData)
    
    console.log('Signup result:', result) // Debug log
    
    if (result.success) {
      console.log('Signup successful, navigating to dashboard...')
      navigate('/dashboard', { replace: true })
    } else {
      console.log('Signup failed:', result.message)
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
          <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
          <p className="text-slate-400">Start managing your tasks today</p>
        </div>

        {/* Signup Form */}
        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field pl-10 ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder=""
                  autoComplete="name"
                />
              </div>
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field pl-10 ${validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>
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
                  autoComplete="new-password"
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

            {/* Confirm Password Field */}
            <div>
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-10 ${validationErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="form-label">Select Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.role === 'admin'
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-slate-600 bg-dark-800 hover:border-slate-500'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-semibold text-white text-sm">Admin</p>
                    <p className="text-xs text-slate-400 mt-1">Create & manage projects</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'member' }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.role === 'member'
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-slate-600 bg-dark-800 hover:border-slate-500'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-semibold text-white text-sm">Member</p>
                    <p className="text-xs text-slate-400 mt-1">Join & collaborate</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Employee ID Field - Always visible */}
            <div>
              <label className="form-label" htmlFor="employee_id">
                Employee ID <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  id="employee_id"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  className={`input-field pl-10 ${validationErrors.employee_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="EMP001"
                />
              </div>
              {validationErrors.employee_id && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.employee_id}</p>
              )}
            </div>

            {/* Designation Field - Only for Members */}
            {formData.role === 'member' && (
              <div>
                <label className="form-label" htmlFor="designation">Designation</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className={`input-field pl-10 ${validationErrors.designation ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                {validationErrors.designation && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.designation}</p>
                )}
              </div>
            )}

            {/* Terms Checkbox */}
            <div>
              <label className={`flex items-start gap-2 text-sm ${validationErrors.terms ? 'text-red-400' : 'text-slate-400'}`}>
                <input 
                  type="checkbox" 
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-dark-800 text-primary-600 focus:ring-primary-500" 
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-400 hover:text-primary-300">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-primary-400 hover:text-primary-300">Privacy Policy</Link>
                </span>
              </label>
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
              className="btn-primary w-full mt-2"
            >
              {isLoading ? (
                <Loader size="sm" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
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

export default Signup
