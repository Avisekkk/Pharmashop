import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

export const medicineAPI = {
  getAll: (params) => api.get('/medicines/', { params }),
  getById: (id) => api.get(`/medicines/${id}/`),
  create: (data) => api.post('/medicines/', data),
  update: (id, data) => api.put(`/medicines/${id}/`, data),
  patch: (id, data) => api.patch(`/medicines/${id}/`, data),
  delete: (id) => api.delete(`/medicines/${id}/`),
  getLowStock: () => api.get('/medicines/low_stock/'),
  getExpiring: () => api.get('/medicines/expiring_soon/'),
  approve: (id) => api.post(`/medicines/${id}/approve/`),
  reject: (id) => api.post(`/medicines/${id}/reject/`),
}

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats/'),
  getSalesChart: () => api.get('/dashboard/sales-chart/'),
  getRecentActivity: () => api.get('/dashboard/recent-activity/'),
}

export const alertAPI = {
  getAll: () => api.get('/alerts/'),
  markRead: (id) => api.patch(`/alerts/${id}/`, { is_read: true }),
  markAllRead: () => api.post('/alerts/mark-all-read/'),
}

export const categoryAPI = {
  getAll: () => api.get('/categories/'),
  create: (data) => api.post('/categories/', data),
}

export const supplierAPI = {
  getAll: () => api.get('/suppliers/'),
  create: (data) => api.post('/suppliers/', data),
}

export const salesAPI = {
  getAll: (params) => api.get('/sales/', { params }),
  create: (data) => api.post('/sales/', data),
}

export const prescriptionAPI = {
  getAll: (params) => api.get('/prescriptions/', { params }),
  getById: (id) => api.get(`/prescriptions/${id}/`),
  create: (formData) => api.post('/prescriptions/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  approve: (id, data) => api.post(`/prescriptions/${id}/approve/`, data),
  reject: (id, data) => api.post(`/prescriptions/${id}/reject/`, data),
}

export const notificationAPI = {
  getAll: () => api.get('/notifications/'),
  markAllRead: () => api.post('/notifications/mark-all-read/'),
}

export default api
