import api from './client.js'

export async function getSellerDashboard() {
  const res = await api.get('/api/dashboard/seller')
  return res.data
}

export async function getBuyerDashboard() {
  const res = await api.get('/api/dashboard/buyer')
  return res.data
}

export default api
