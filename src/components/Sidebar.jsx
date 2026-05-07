import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  PlusCircle,
  X
} from 'lucide-react'

// Sidebar navigation component
const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  ]

  // Admin-only quick actions
  const quickActions = [
    ...(isAdmin ? [{ to: '/projects/create', icon: PlusCircle, label: 'New Project' }] : []),
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-dark-800 border-r border-slate-700/50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/50 lg:hidden">
            <span className="text-lg font-semibold text-white">Menu</span>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Main
              </p>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose?.()}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30' 
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 space-y-1">
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Quick Actions
              </p>
              {quickActions.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose?.()}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' 
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-xs text-slate-400">
                Need help? Check out our documentation or contact support.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
