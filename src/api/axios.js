import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
}

export const projectsAPI = {
  getAll: () => api.get('/projects'),
  create: (data) => api.post('/projects', data),
  join: (code) => api.post('/projects/join', { project_code: code }),
  getAvailableUsers: (projectId) => api.get(`/projects/${projectId}/available-users`),
  getMembers: (projectId) => api.get(`/projects/${projectId}/members`),
  addMember: (projectId, userId, role = 'member') => api.post(`/projects/${projectId}/add-member`, { user_id: userId, role }),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/remove-member`, { data: { user_id: userId } }),
  delete: (id) => api.delete(`/projects/${id}`),
}

export const tasksAPI = {
  getAll: (params) => {
    if (params?.project_id) {
      return api.get(`/tasks/project/${params.project_id}`)
    }
    return api.get('/tasks', { params })
  },
  create: (data) => api.post('/tasks', data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  delete: (id) => api.delete(`/tasks/${id}`),
}

export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
}

export default api
