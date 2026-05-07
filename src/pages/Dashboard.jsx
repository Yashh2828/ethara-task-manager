import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardAPI, projectsAPI, tasksAPI } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'
import ProjectCard from '../components/ProjectCard'
import TaskCard from '../components/TaskCard'
import { 
  LayoutDashboard, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FolderKanban,
  ArrowRight,
  TrendingUp,
  Shield,
  Users
} from 'lucide-react'
import { formatDate } from '../utils/helpers'

// Dashboard page - overview of user's tasks and projects
const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentProjects, setRecentProjects] = useState([])
  const [recentTasks, setRecentTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch stats, recent projects, and tasks in parallel
      const [statsRes, projectsRes, tasksRes] = await Promise.all([
        dashboardAPI.getStats().catch(() => ({ data: null })),
        projectsAPI.getAll().catch(() => ({ data: { projects: [] } })),
        tasksAPI.getAll({ limit: 5 }).catch(() => ({ data: { tasks: [] } }))
      ])

      setStats(statsRes.data?.data || statsRes.data)
      // Handle nested data structure from backend
      const projectsData = projectsRes.data?.data || projectsRes.data?.projects || projectsRes.data || []
      const tasksData = tasksRes.data?.data || tasksRes.data?.tasks || tasksRes.data || []
      setRecentProjects(projectsData.slice(0, 3))
      setRecentTasks(tasksData)
    } catch (err) {
      console.error('Dashboard error:', err)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  // Stat card component
  const StatCard = ({ title, value, icon: Icon, color, subtitle, link }) => (
    <Link to={link} className="card p-5 hover:border-primary-500/50 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </Link>
  )

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="page-title">Dashboard</h1>
            {user?.role && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                user.role === 'admin' 
                  ? 'bg-purple-500/20 text-purple-300' 
                  : 'bg-blue-500/20 text-blue-300'
              }`}>
                {user.role === 'admin' ? (
                  <>
                    <Shield className="w-3 h-3" />
                    Admin
                  </>
                ) : (
                  <>
                    <Users className="w-3 h-3" />
                    Member
                  </>
                )}
              </span>
            )}
          </div>
          <p className="text-slate-400 mt-1">
            {user?.role === 'admin' 
              ? "You have admin privileges. Create and manage projects."
              : "Welcome! Join projects and collaborate with your team."}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <TrendingUp className="w-4 h-4" />
          <span>Last updated: {formatDate(new Date())}</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Tasks"
          value={stats?.total_assigned || 0}
          icon={LayoutDashboard}
          color="bg-primary-600"
          subtitle="Across all projects"
          link="/tasks"
        />
        <StatCard
          title="Completed"
          value={stats?.by_status?.done || 0}
          icon={CheckCircle}
          color="bg-emerald-600"
          subtitle="Tasks done this month"
          link="/tasks?status=done"
        />
        <StatCard
          title="In Progress"
          value={stats?.by_status?.in_progress || 0}
          icon={Clock}
          color="bg-amber-500"
          subtitle="Active tasks"
          link="/tasks?status=in_progress"
        />
        <StatCard
          title="Overdue"
          value={stats?.overdue || 0}
          icon={AlertCircle}
          color="bg-red-600"
          subtitle="Need attention"
          link="/tasks?overdue=true"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
            <Link 
              to="/projects" 
              className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentProjects.map(project => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No projects yet</p>
              <Link to="/projects/create" className="text-primary-400 hover:text-primary-300 text-sm mt-2 inline-block">
                Create your first project
              </Link>
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Tasks</h2>
            <Link 
              to="/tasks" 
              className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentTasks.length > 0 ? (
            <div className="space-y-3">
              {recentTasks.map(task => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  showProject={true}
                  readOnly={user?.role === 'admin'}
                  onStatusChange={(id, status) => {
                    // Optimistic update
                    setRecentTasks(prev => prev.map(t => 
                      t._id === id ? { ...t, status } : t
                    ))
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center">
              <CheckCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No tasks assigned</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 card p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/projects/create" className="btn-primary">
            <FolderKanban className="w-4 h-4" />
            New Project
          </Link>
          <Link to="/tasks/create" className="btn-secondary">
            <CheckCircle className="w-4 h-4" />
            New Task
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
