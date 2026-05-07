import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Users, ArrowRight, Trash2, UserPlus, X, Check, Plus } from 'lucide-react'
import { formatDate } from '../utils/helpers'
import { projectsAPI } from '../api/axios'
import Loader from './Loader'

import { useAuth } from '../context/AuthContext'

// Project card component for displaying project information
const ProjectCard = ({ project, onDelete }) => {
  const { user } = useAuth()
  const { _id, name, description, created_at, task_count } = project
  const member_count = project.member_count || project.members?.length || 0
  const role = project.role || project.members?.find(m => m.user_id === user?._id)?.role || 'member'
  
  const [isDeleting, setIsDeleting] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [availableUsers, setAvailableUsers] = useState([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  
  const [showExistingMembersModal, setShowExistingMembersModal] = useState(false)
  const [existingMembers, setExistingMembers] = useState([])
  const [isLoadingExistingMembers, setIsLoadingExistingMembers] = useState(false)

  const handleShowMembers = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMembersModal(true)
    setIsLoadingUsers(true)
    try {
      const response = await projectsAPI.getAvailableUsers(_id)
      setAvailableUsers(response.data?.data || [])
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleShowExistingMembers = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowExistingMembersModal(true)
    setIsLoadingExistingMembers(true)
    try {
      const response = await projectsAPI.getMembers(_id)
      setExistingMembers(response.data?.data || response.data || [])
    } catch (err) {
      console.error('Failed to load existing members:', err)
    } finally {
      setIsLoadingExistingMembers(false)
    }
  }

  const handleAddMember = async (userId) => {
    try {
      await projectsAPI.addMember(_id, userId)
      setAvailableUsers(prev => prev.filter(u => u._id !== userId))
    } catch (err) {
      console.error('Failed to add member:', err)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member and delete all their assigned tasks in this project?')) return
    
    try {
      await projectsAPI.removeMember(_id, userId)
      setExistingMembers(prev => prev.filter(u => u._id !== userId))
      if (onDelete) onDelete(_id) // Refresh parent component if needed to update member counts
    } catch (err) {
      console.error('Failed to remove member:', err)
      alert(err.response?.data?.message || 'Failed to remove member')
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    if (!window.confirm('Are you sure you want to delete this project?')) return
    
    try {
      setIsDeleting(true)
      await projectsAPI.delete(_id)
      if (onDelete) onDelete(_id)
    } catch (err) {
      console.error('Delete project error:', err)
      alert(err.response?.data?.message || 'Failed to delete project')
      setIsDeleting(false)
    }
  }

  return (
    <div className="card p-5 hover:border-primary-500/50 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
            {name}
          </h3>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
            role === 'admin' 
              ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30' 
              : 'bg-slate-600/20 text-slate-400 border border-slate-600/30'
          }`}>
            {role === 'admin' ? 'Admin' : 'Member'}
          </span>
        </div>
        {role === 'admin' && (
          <div className="flex gap-2">
            <button 
              onClick={handleShowMembers}
              className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-primary-400/10 rounded-md transition-colors"
              title="Add Members"
            >
              <UserPlus className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
              title="Delete Project"
            >
              {isDeleting ? <Loader size="sm" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
        {description || 'No description provided'}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
        <button 
          onClick={handleShowExistingMembers}
          className="flex items-center gap-1 hover:text-primary-400 transition-colors group/btn cursor-pointer"
        >
          <Users className="w-4 h-4 group-hover/btn:text-primary-400" />
          <span className="group-hover/btn:underline">{member_count || 0} members</span>
        </button>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(created_at)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <span className="text-sm text-slate-400">
          {task_count || 0} tasks
        </span>
        <div className="flex items-center gap-3">
          <Link
            to={`/tasks/create?project=${_id}`}
            className="flex items-center gap-1 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </Link>
          <Link
            to={`/projects/${_id}/tasks`}
            className="flex items-center gap-1 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
          >
            View Tasks
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Add Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
          <div className="card w-full max-w-md animate-slide-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Add Members to "{name}"</h3>
                <button 
                  onClick={() => setShowMembersModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {isLoadingUsers ? (
                <div className="flex justify-center py-8"><Loader size="md" /></div>
              ) : availableUsers.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {availableUsers.map(u => (
                    <div key={u._id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                      <div>
                        <div className="text-white font-medium flex items-center gap-2">
                          {u.name}
                          {u.designation && (
                            <span className="text-xs font-normal px-2 py-0.5 rounded bg-slate-700/50 text-slate-400">
                              {u.designation}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400">{u.email}</div>
                      </div>
                      <button 
                        onClick={() => handleAddMember(u._id)}
                        className="btn-primary text-sm px-3 py-1.5"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Check className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
                  <p className="text-slate-400">No more users available to add.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Existing Members Modal */}
      {showExistingMembersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
          <div className="card w-full max-w-md animate-slide-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Members of "{name}"</h3>
                <button 
                  onClick={() => setShowExistingMembersModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {isLoadingExistingMembers ? (
                <div className="flex justify-center py-8"><Loader size="md" /></div>
              ) : existingMembers.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {existingMembers.map(u => (
                    <div key={u._id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center text-sm font-semibold">
                          {u.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="text-white font-medium flex items-center gap-2">
                            {u.name}
                            <span className={`text-xs font-normal px-2 py-0.5 rounded ${
                              u.role === 'admin' 
                                ? 'bg-primary-600/20 text-primary-400' 
                                : 'bg-slate-700/50 text-slate-400'
                            }`}>
                              {u.role === 'admin' ? 'Admin' : 'Member'}
                            </span>
                            {u.designation && (
                              <span className="text-xs font-normal px-2 py-0.5 rounded bg-slate-700/50 text-slate-400">
                                {u.designation}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-400">{u.email}</div>
                        </div>
                      </div>
                      
                      {role === 'admin' && u._id !== user?._id && (
                        <button
                          onClick={() => handleRemoveMember(u._id)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors ml-2"
                          title="Remove member and their tasks"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">No members found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectCard
