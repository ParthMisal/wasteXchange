import api from './client.js'

export async function signup(data) {
  const res = await api.post('/api/auth/signup', data)
  return res.data
}

export async function login(data) {
  const res = await api.post('/api/auth/login', data)
  return res.data
}

export default api