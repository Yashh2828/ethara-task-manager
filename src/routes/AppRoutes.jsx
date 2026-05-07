import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'

// Layouts
import DashboardLayout from '../layouts/DashboardLayout'

// Pages
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import Dashboard from '../pages/Dashboard'
import Projects from '../pages/Projects'
import Tasks from '../pages/Tasks'
import CreateProject from '../pages/CreateProject'
import CreateTask from '../pages/CreateTask'
import Profile from '../pages/Profile'
import NotFound from '../pages/NotFound'

// Application routes configuration
const AppRoutes = () => {
  const { isAuthenticated } = useAuth()
  
  // Check localStorage token as fallback
  const hasToken = localStorage.getItem('token')
  const isAuth = isAuthenticated || !!hasToken

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isAuth ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={isAuth ? <Navigate to="/dashboard" replace /> : <Signup />} 
      />

      {/* Protected Routes - wrapped in DashboardLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Profile */}
        <Route path="profile" element={<Profile />} />
        
        {/* Projects */}
        <Route path="projects" element={<Projects />} />
        <Route path="projects/create" element={<CreateProject />} />
        
        {/* Tasks */}
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/create" element={<CreateTask />} />
        <Route path="projects/:projectId/tasks" element={<Tasks />} />
      </Route>

      {/* 404 - Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
