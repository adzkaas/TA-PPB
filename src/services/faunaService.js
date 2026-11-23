import { apiClient } from '../config/api'

// ---------------------------------------------------------------------------
// FaunaService — Layanan data katalog Biota Akuarium (RESTful Web Service Modul 1)
// Berkomunikasi dengan Express API backend buatan sendiri di /api/fauna
// ---------------------------------------------------------------------------
class FaunaService {
  async getFauna() {
    const data = await apiClient.get('/api/fauna')
    return Array.isArray(data) ? data : []
  }

  async getFaunaById(id) {
    const data = await apiClient.get(`/api/fauna/${id}`)
    return data
  }

  async createFauna(data) {
    const res = await apiClient.post('/api/fauna', data)
    return res
  }

  async updateFauna(id, data) {
    const res = await apiClient.put(`/api/fauna/${id}`, data)
    return res
  }

  async deleteFauna(id) {
    const res = await apiClient.delete(`/api/fauna/${id}`)
    return res
  }
}

export default new FaunaService()
