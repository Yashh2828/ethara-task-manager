import { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { tasksAPI, projectsAPI } from '../api/axios'
import TaskCard from '../components/TaskCard'
import { Plus, Search, Filter } from 'lucide-react'
import { isOverdue } from '../utils/helpers'

const Tasks = () => {
  const { projectId } = useParams()
  const location = useLocation()
  
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Sync statusFilter with URL params when location changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const initialStatus = queryParams.get('status') || 'all'
    const isOverdueFilter = queryParams.get('overdue') === 'true'
    setStatusFilter(isOverdueFilter ? 'overdue' : initialStatus)
  }, [location.search])

  useEffect(() => {
    fetchData()
  }, [projectId])

  useEffect(() => {
    let filtered = tasks
    if (searchQuery) {
      filtered = filtered.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    if (statusFilter === 'overdue') {
      filtered = filtered.filter(t => t.status !== 'done' && isOverdue(t.due_date))
    } else if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter)
    }
    setFilteredTasks(filtered)
  }, [searchQuery, statusFilter, tasks])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const projectsRes = await projectsAPI.getAll()
      // Handle nested data structure
      const projectsData = projectsRes.data?.data || projectsRes.data?.projects || projectsRes.data || []
      setProjects(projectsData)

      if (projectId) {
        const res = await tasksAPI.getAll({ project_id: projectId })
        const tasksData = res.data?.data || res.data?.tasks || res.data || []
        setTasks(tasksData)
      } else {
        const res = await tasksAPI.getAll()
        const tasksData = res.data?.data || res.data?.tasks || res.data || []
        setTasks(tasksData)
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t))
    try {
      await tasksAPI.updateStatus(taskId, newStatus)
    } catch (err) {
      fetchData()
    }
  }

  if (isLoading) return <div className="p-6 text-center text-slate-400">Loading...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-slate-400 mt-1">Manage your tasks</p>
        </div>
        <Link to="/tasks/create" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />New Task
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search tasks..." />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-4 text-white">
          <option value="all">All Status</option>
          <option value="assigned">Assigned</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(task => (
            <TaskCard key={task._id} task={task} onStatusChange={handleStatusChange} showProject={!projectId} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
          <Filter className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">{searchQuery ? 'No matching tasks' : 'No tasks yet'}</p>
        </div>
      )}
    </div>
  )
}

export default Tasks
