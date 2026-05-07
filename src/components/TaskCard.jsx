import { useState } from 'react'
import { Calendar, Clock, User, Edit2, Trash2, MoreVertical } from 'lucide-react'
import { formatDate, isOverdue, getStatusColor, getStatusLabel, getPriorityColor, getInitials, getAvatarColor, truncateText } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'

// Task card component with status update and actions
const TaskCard = ({ task, onStatusChange, onEdit, onDelete, showProject = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  
  const { 
    _id, 
    title, 
    description, 
    status, 
    priority, 
    due_date, 
    assignee,
    project,
    created_at 
  } = task

  const overdue = isOverdue(due_date)

  const handleStatusChange = (newStatus) => {
    onStatusChange?.(_id, newStatus)
    setIsMenuOpen(false)
  }

  return (
    <div className={`card p-4 hover:border-primary-500/50 transition-all duration-200 ${
      overdue ? 'border-red-500/30' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate">{title}</h4>
          {showProject && project && (
            <p className="text-xs text-primary-400 mt-0.5">{project.name}</p>
          )}
        </div>
        
        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-dark-800 border border-slate-700 rounded-lg shadow-xl z-10 animate-fade-in">
              <button
                onClick={() => { onEdit?.(task); setIsMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors rounded-t-lg"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => { onDelete?.(_id); setIsMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors rounded-b-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 mb-3 line-clamp-2">
        {truncateText(description, 120) || 'No description'}
      </p>

      {/* Status & Priority */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {/* Status Dropdown */}
        {isAdmin ? (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </span>
        ) : (
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(status)}`}
          >
            <option value="assigned" className="bg-dark-800 text-white">Assigned</option>
            <option value="todo" className="bg-dark-800 text-white">To Do</option>
            <option value="in_progress" className="bg-dark-800 text-white">In Progress</option>
            <option value="review" className="bg-dark-800 text-white">In Review</option>
            <option value="done" className="bg-dark-800 text-white">Done</option>
          </select>
        )}

        {/* Priority Badge */}
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getPriorityColor(priority)}`}>
          {priority || 'medium'}
        </span>

        {/* Overdue Warning */}
        {overdue && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-600/30">
            Overdue
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        {/* Due Date */}
        <div className={`flex items-center gap-1.5 text-xs ${overdue ? 'text-red-400' : 'text-slate-500'}`}>
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(due_date)}</span>
        </div>

        {/* Assignee */}
        <div className="flex items-center gap-2">
          {assignee ? (
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${getAvatarColor(assignee.name)}`}>
                {getInitials(assignee.name)}
              </div>
              <span className="text-xs text-slate-400 hidden sm:block">{assignee.name?.split(' ')[0]}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-500">
              <User className="w-4 h-4" />
              <span className="text-xs">Unassigned</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskCard
