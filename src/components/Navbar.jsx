import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getInitials, getAvatarColor } from '../utils/helpers'
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react'

// Top navigation bar component
const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="bg-dark-800 border-b border-slate-700/50 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Logo & Mobile menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white hidden sm:block">
                TaskFlow
              </span>
            </Link>
          </div>

          {/* Right section - Notifications & Profile */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white ${getAvatarColor(user?.name)}`}>
                  {getInitials(user?.name)}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-slate-200 leading-tight">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <span className={`text-[10px] font-medium px-1.5 py-0 rounded ${
                    user?.role === 'admin' ? 'bg-primary-600/30 text-primary-400' : 'bg-slate-600/30 text-slate-400'
                  }`}>
                    {user?.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-slate-700 rounded-xl shadow-xl animate-fade-in">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-slate-700">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-slate-400 mb-1">{user?.email}</p>
                      
                      {user?.employee_id && (
                        <p className="text-[11px] text-slate-500 font-mono mb-1">ID: {user.employee_id}</p>
                      )}
                      
                      {user?.designation && (
                        <p className="text-xs text-slate-400 mb-1">{user.designation}</p>
                      )}
                      
                      {/* Role Badge */}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium mt-1 ${
                        user?.role === 'admin' 
                          ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30' 
                          : 'bg-slate-600/20 text-slate-400 border border-slate-600/30'
                      }`}>
                        {user?.role === 'admin' ? 'Admin' : 'Member'}
                      </span>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
