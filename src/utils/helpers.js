// Date formatting
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Check if overdue
export const isOverdue = (dueDate) => {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dueDate) < today
}

// Status colors
export const getStatusColor = (status) => {
  const colors = {
    assigned: 'bg-indigo-600 text-white',
    todo: 'bg-slate-600 text-slate-100',
    in_progress: 'bg-blue-600 text-white',
    review: 'bg-amber-500 text-white',
    done: 'bg-emerald-500 text-white',
  }
  return colors[status] || colors.todo
}

// Status labels
export const getStatusLabel = (status) => {
  const labels = {
    assigned: 'Assigned',
    todo: 'To Do',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done',
  }
  return labels[status] || status
}

// Priority colors
export const getPriorityColor = (priority) => {
  const colors = {
    low: 'bg-slate-600 text-slate-100',
    medium: 'bg-blue-600 text-white',
    high: 'bg-orange-500 text-white',
    urgent: 'bg-red-600 text-white',
  }
  return colors[priority] || colors.medium
}

// Avatar initials
export const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// Random avatar color
export const getAvatarColor = (name) => {
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500']
  if (!name) return colors[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

// Truncate text
export const truncateText = (text, max = 100) => {
  if (!text || text.length <= max) return text
  return text.substring(0, max).trim() + '...'
}

// Storage helpers for localStorage
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  },
}
