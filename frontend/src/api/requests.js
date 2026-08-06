import api from './client.js'

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