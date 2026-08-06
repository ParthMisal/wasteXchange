import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecosync_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function getRequestDetail(id) {
  const res = await api.get(`/api/requests/${id}`)
  return res.data
}

export async function getMessages(id) {
  const res = await api.get(`/api/requests/${id}/messages`)
  return res.data
}

export async function sendMessage(id, data) {
  const res = await api.post(`/api/requests/${id}/messages`, data)
  return res.data
}

export default api