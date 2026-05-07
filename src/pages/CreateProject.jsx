import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { projectsAPI } from '../api/axios'
import Loader from '../components/Loader'
import { ArrowLeft, FolderKanban, Plus, Check, Users, UserPlus } from 'lucide-react'

// Create project page
const CreateProject = () => {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [createdProject, setCreatedProject] = useState(null)
  const [showMembersList, setShowMembersList] = useState(false)
  const [availableUsers, setAvailableUsers] = useState([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (error) setError(null)
  }

  const handleShowMembers = async () => {
    setShowMembersList(true)
    setIsLoadingUsers(true)
    try {
      const response = await projectsAPI.getAvailableUsers(createdProject._id)
      setAvailableUsers(response.data?.data || [])
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleAddMember = async (userId) => {
    try {
      await projectsAPI.addMember(createdProject._id, userId)
      setAvailableUsers(prev => prev.filter(u => u._id !== userId))
    } catch (err) {
      console.error('Failed to add member:', err)
    }
  }

  const validate = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Project name is required'
    } else if (formData.name.length < 3) {
      errors.name = 'Project name must be at least 3 characters'
    } else if (formData.name.length > 100) {
      errors.name = 'Project name must be less than 100 characters'
    }
    
    if (formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters'
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
      
      const response = await projectsAPI.create(formData)
      setCreatedProject(response.data?.data?.project || response.data?.project || { _id: response.data?.data?.project_id, name: formData.name })
    } catch (err) {
      console.error('Create project error:', err)
      setError(err.response?.data?.message || 'Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (createdProject) {
    return (
      <div className="page-container">
        <div className="max-w-2xl mx-auto card p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Project Created!</h2>
          <p className="text-slate-400 mb-6">
            "{createdProject.name}" has been created successfully.
          </p>
          
          {!showMembersList ? (
            <div className="flex gap-4 justify-center">
              <Link to="/projects" className="btn-secondary">
                Go to Projects
              </Link>
              <button onClick={handleShowMembers} className="btn-primary">
                <Users className="w-4 h-4" />
                Add Members
              </button>
            </div>
          ) : (
            <div className="mt-6 text-left border-t border-slate-700 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Available Users</h3>
                <Link to="/projects" className="btn-secondary text-sm px-3 py-1.5">
                  Done
                </Link>
              </div>
              
              {isLoadingUsers ? (
                <div className="flex justify-center py-4"><Loader size="sm" /></div>
              ) : availableUsers.length > 0 ? (
                <div className="space-y-3">
                  {availableUsers.map(user => (
                    <div key={user._id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                      <div>
                        <div className="text-white font-medium flex items-center gap-2">
                          {user.name}
                          {user.designation && (
                            <span className="text-xs font-normal px-2 py-0.5 rounded bg-slate-700/50 text-slate-400">
                              {user.designation}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400">{user.email}</div>
                      </div>
                      <button 
                        onClick={() => handleAddMember(user._id)}
                        className="btn-primary text-sm px-3 py-1.5"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-4">No more users available to add.</p>
              )}
            </div>
          )}
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
            to="/projects" 
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="page-title">Create Project</h1>
            <p className="text-slate-400 mt-1">Set up a new project for your team</p>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="form-label" htmlFor="name">
                Project Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field pl-10 ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="Enter project name"
                  maxLength={100}
                  autoFocus
                />
              </div>
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.name}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                {formData.name.length}/100 characters
              </p>
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
                placeholder="Describe the project purpose and goals..."
                maxLength={500}
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.description}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Tips */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Tips:</h4>
              <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                <li>Choose a clear, descriptive name</li>
                <li>Add a description to help team members understand the project</li>
                <li>You'll be able to invite members after creating the project</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
              <Link to="/projects" className="btn-secondary flex-1 sm:flex-none">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1 sm:flex-none"
              >
                {isLoading ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateProject
