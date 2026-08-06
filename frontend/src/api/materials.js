import api from './client.js'

export async function searchMaterials(params = {}) {
  const res = await api.get('/api/materials/search', { params })
  return res.data
}

export async function getMatches(params = {}) {
  const res = await api.get('/api/match', { params })
  return res.data
}

export async function getMyListings() {
  const res = await api.get('/api/materials/my-listings')
  return res.data
}

export async function getMyListingsSummary() {
  const res = await api.get('/api/materials/my-listings/summary')
  return res.data
}

export async function createMaterial(data) {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
  const res = await api.post('/api/materials', data, {
    headers: { 'Content-Type': isFormData ? false : 'application/json' },
  })
  return res.data
}

export async function deleteMaterial(id) {
  const res = await api.delete(`/api/materials/${id}`)
  return res.data
}

export default api