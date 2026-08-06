import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecosync_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto logout on 401 Unauthorized
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('ecosync_token')
      localStorage.removeItem('ecosync_role')
      localStorage.removeItem('ecosync_active_role')
      localStorage.removeItem('ecosync_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
