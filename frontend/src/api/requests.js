import api from './client.js'

export async function getRequestDetail(id) {
  const res = await api.get(`/api/requests/${id}`)
  return res.data
}

export async function listRequests(params = {}) {
  const res = await api.get('/api/requests', { params })
  return res.data
}

export async function createRequest(data) {
  const res = await api.post('/api/requests', data)
  return res.data
}

export async function updateRequestStatus(id, status) {
  const res = await api.patch(`/api/requests/${id}/status`, { status })
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
