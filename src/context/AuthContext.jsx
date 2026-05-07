import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/axios'
import { storage } from '../utils/helpers'

// Create authentication context
const AuthContext = createContext(null)

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token')
      const savedUser = storage.get('user')
      
      if (token && savedUser) {
        setUser(savedUser)
        setIsAuthenticated(true)
      }
      
      setIsLoading(false)
    }
    
    initAuth()
  }, [])

  // Login function
  const login = useCallback(async (email, password) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await authAPI.login({ email, password })
      console.log('Login response:', response.data)
      
      // Backend wraps response in 'data' field
      const responseData = response.data.data || response.data
      
      // Handle both token and access_token from backend
      const token = responseData.token || responseData.access_token
      const userData = responseData.user
      
      if (!token || !userData) {
        console.error('Missing token or user. Response:', responseData)
        throw new Error('Invalid response: missing token or user')
      }
      
      // Store token and user data
      localStorage.setItem('token', token)
      storage.set('user', userData)
      
      setUser(userData)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (err) {
      console.error('Login error:', err)
      let message = 'Login failed. Please try again.'
      if (err.code === 'ERR_NETWORK') {
        message = 'Cannot connect to server. Check if backend is running.'
      } else if (err.response?.data?.message) {
        message = err.response.data.message
      }
      setError(message)
      return { success: false, message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Signup function
  const signup = useCallback(async (userData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Making signup API call to:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api')
      console.log('Signup data:', userData)
      const response = await authAPI.signup(userData)
      console.log('Signup API response:', response.data)
      
      // Backend wraps response in 'data' field
      const responseData = response.data.data || response.data
      
      // Handle both token and access_token from backend
      const token = responseData.token || responseData.access_token
      const newUser = responseData.user
      
      if (!token || !newUser) {
        console.error('Missing token or user in response. Got:', responseData)
        throw new Error('Invalid response from server: missing token or user')
      }
      
      // Store token and user data
      localStorage.setItem('token', token)
      storage.set('user', newUser)
      
      setUser(newUser)
      setIsAuthenticated(true)
      
      console.log('Signup successful, token stored')
      return { success: true }
    } catch (err) {
      console.error('Signup error details:', err)
      console.error('Error response:', err.response)
      console.error('Error request:', err.request)
      
      let message = 'Signup failed. Please try again.'
      if (err.code === 'ERR_NETWORK') {
        message = 'Cannot connect to server. Please check if backend is running on port 5000.'
      } else if (err.response?.data?.message) {
        message = err.response.data.message
      } else if (err.message) {
        message = err.message
      }
      
      setError(message)
      return { success: false, message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    setError(null)
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Update user data
  const updateUser = useCallback((userData) => {
    setUser(userData)
    storage.set('user', userData)
  }, [])

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
