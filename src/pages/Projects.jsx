import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsAPI } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'
import ProjectCard from '../components/ProjectCard'
import { Plus, Search, FolderKanban, RefreshCw, Users, Shield } from 'lucide-react'

// Projects list page
const Projects = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    // Filter projects based on search query
    const filtered = projects.filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredProjects(filtered)
  }, [searchQuery, projects])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await projectsAPI.getAll()
      console.log('Projects response:', response.data)
      // Backend wraps response in 'data' field
      const projectsData = response.data?.data || response.data?.projects || response.data || []
      setProjects(projectsData)
      setFilteredProjects(projectsData)
    } catch (err) {
      console.error('Projects error:', err)
      setError('Failed to load projects. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinProject = async (e) => {
    e.preventDefault()
    if (!joinCode.trim()) return

    try {
      setIsJoining(true)
      await projectsAPI.join(joinCode.trim())
      setJoinCode('')
      setShowJoinModal(false)
      fetchProjects() // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join project')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="text-slate-400 mt-1">
            {isAdmin ? 'Create and manage projects for your team' : 'Join projects and collaborate with your team'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isAdmin && (
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-secondary"
            >
              <Users className="w-4 h-4" />
              Join Project
            </button>
          )}
          {isAdmin && (
            <Link to="/projects/create" className="btn-primary">
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="input-field pl-10 w-full"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchProjects}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <ProjectCard key={project._id} project={project} onDelete={fetchProjects} />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              {searchQuery ? (
                <>
                  <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No projects found matching "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-primary-400 hover:text-primary-300 text-sm mt-2"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-2">No projects yet</p>
                  <p className="text-slate-500 text-sm mb-4">Create a project to get started</p>
                  <Link to="/projects/create" className="btn-primary inline-flex">
                    <Plus className="w-4 h-4" />
                    Create Project
                  </Link>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Join Project Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md animate-slide-in">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Join Project</h3>
              <p className="text-slate-400 text-sm mb-4">
                Enter the project code to join an existing project.
              </p>
              
              <form onSubmit={handleJoinProject} className="space-y-4">
                <div>
                  <label className="form-label">Project Code</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter project code"
                    className="input-field"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isJoining || !joinCode.trim()}
                    className="btn-primary flex-1"
                  >
                    {isJoining ? <Loader size="sm" /> : 'Join'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects
