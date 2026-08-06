import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
})

export async function signup(data) {
  const res = await api.post('/api/auth/signup', data)
  return res.data
}

export async function login(data) {
  const res = await api.post('/api/auth/login', data)
  return res.data
}

export default api