import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { tasksAPI, projectsAPI } from '../api/axios'
import Loader from '../components/Loader'
import { ArrowLeft, CheckSquare, Plus, Check, Calendar, FolderKanban, Flag, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Create task page
const CreateTask = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialProjectId = queryParams.get('project')

  const [projects, setProjects] = useState([])
  const [projectMembers, setProjectMembers] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    assigned_to: '',
    status: 'assigned',
    priority: 'medium',
    due_date: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingProjects, setIsFetchingProjects] = useState(true)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [createdTask, setCreatedTask] = useState(null)

  const isProjectAdmin = projectMembers.find(m => m.user_id === user?._id || m._id === user?._id)?.role === 'admin'
  const isAdmin = isProjectAdmin || user?.role === 'admin'

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (formData.project_id) {
      fetchProjectMembers(formData.project_id)
    } else {
      setProjectMembers([])
      setFormData(prev => ({ ...prev, assigned_to: '' }))
    }
  }, [formData.project_id])

  const fetchProjectMembers = async (projectId) => {
    try {
      const response = await projectsAPI.getMembers(projectId)
      const members = response.data?.data || response.data || []
      setProjectMembers(members)
    } catch (err) {
      console.error('Fetch project members error:', err)
      setProjectMembers([])
    }
  }

  const fetchProjects = async () => {
    try {
      setIsFetchingProjects(true)
      const response = await projectsAPI.getAll()
      // Handle nested data structure from backend
      const projectsList = response.data?.data || response.data?.projects || response.data || []
      setProjects(projectsList)
      
      // Auto-select project from URL or first available project
      if (initialProjectId && projectsList.some(p => p._id === initialProjectId)) {
        setFormData(prev => ({ ...prev, project_id: initialProjectId }))
      } else if (projectsList.length > 0) {
        setFormData(prev => ({ ...prev, project_id: projectsList[0]._id }))
      }
    } catch (err) {
      console.error('Fetch projects error:', err)
    } finally {
      setIsFetchingProjects(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (error) setError(null)
  }

  const validate = () => {
    const errors = {}
    
    if (!formData.title.trim()) {
      errors.title = 'Task title is required'
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters'
    } else if (formData.title.length > 200) {
      errors.title = 'Title must be less than 200 characters'
    }
    
    if (!formData.project_id) {
      errors.project_id = 'Please select a project'
    }
    
    if (formData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters'
    }
    
    if (formData.due_date) {
      const selected = new Date(formData.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selected < today) {
        errors.due_date = 'Due date cannot be in the past'
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await tasksAPI.create(formData)
      setCreatedTask(response.data?.data?.task || response.data?.task)
      
      // Navigate after short delay
      setTimeout(() => {
        navigate('/tasks')
      }, 1500)
    } catch (err) {
      console.error('Create task error:', err)
      setError(err.response?.data?.message || 'Failed to create task')
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (createdTask) {
    return (
      <div className="page-container">
        <div className="max-w-md mx-auto card p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Task Created!</h2>
          <p className="text-slate-400 mb-4">
            "{createdTask.title}" has been added successfully.
          </p>
          <p className="text-sm text-slate-500">
            Redirecting to tasks...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link 
            to="/tasks" 
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="page-title">Create Task</h1>
            <p className="text-slate-400 mt-1">Add a new task to your project</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <div className="card p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {projects.length === 0 && !isFetchingProjects ? (
            <div className="text-center py-8">
              <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-2">No projects available</p>
              <p className="text-slate-500 text-sm mb-4">Create a project first to add tasks</p>
              <Link to="/projects/create" className="btn-primary inline-flex">
                <Plus className="w-4 h-4" />
                Create Project
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Task Title */}
              <div>
                <label className="form-label" htmlFor="title">
                  Task Title <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <CheckSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`input-field pl-10 ${validationErrors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                    placeholder="Enter task title"
                    maxLength={200}
                    autoFocus
                  />
                </div>
                {validationErrors.title && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.title}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  {formData.title.length}/200 characters
                </p>
              </div>

              {/* Project Selection */}
              <div>
                <label className="form-label" htmlFor="project_id">
                  Project <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <select
                    id="project_id"
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleChange}
                    disabled={isFetchingProjects}
                    className={`input-field pl-10 ${validationErrors.project_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  >
                    <option value="">{isFetchingProjects ? 'Loading...' : 'Select a project'}</option>
                    {projects.map(project => (
                      <option key={project._id} value={project._id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                {validationErrors.project_id && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.project_id}</p>
                )}
              </div>

              {/* Assignee Selection */}
              <div>
                <label className="form-label" htmlFor="assigned_to">
                  Assign To
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <select
                    id="assigned_to"
                    name="assigned_to"
                    value={formData.assigned_to}
                    onChange={handleChange}
                    className="input-field pl-10"
                    disabled={!formData.project_id || projectMembers.length === 0}
                  >
                    <option value="">Unassigned</option>
                    {projectMembers
                      .filter(member => member.role !== 'admin')
                      .map(member => {
                        const displayName = member.name || member.email || 'Unknown User'
                        const designationStr = member.designation ? ` - ${member.designation}` : ''
                        return (
                          <option key={member.user_id || member._id} value={member.user_id || member._id}>
                            {displayName}{designationStr}
                          </option>
                        )
                      })}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="form-label" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`input-field resize-none ${validationErrors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="Add task details..."
                  maxLength={1000}
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.description}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  {formData.description.length}/1000 characters
                </p>
              </div>

              {/* Status & Priority Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status */}
                {!isAdmin && (
                  <div>
                    <label className="form-label" htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="assigned">Assigned</option>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">In Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                )}

                {/* Priority */}
                <div>
                  <label className="form-label" htmlFor="priority">Priority</label>
                  <div className="relative">
                    <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="input-field pl-10"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="form-label" htmlFor="due_date">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="date"
                    id="due_date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className={`input-field pl-10 ${validationErrors.due_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  />
                </div>
                {validationErrors.due_date && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.due_date}</p>
                )}
              </div>

              {/* Tips */}
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Tips:</h4>
                <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                  <li>Be specific with task titles</li>
                  <li>Set realistic due dates</li>
                  <li>Choose appropriate priority levels</li>
                  <li>Add detailed descriptions for complex tasks</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                <Link to="/tasks" className="btn-secondary flex-1 sm:flex-none">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading || projects.length === 0}
                  className="btn-primary flex-1 sm:flex-none"
                >
                  {isLoading ? (
                    <Loader size="sm" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Task
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateTask
