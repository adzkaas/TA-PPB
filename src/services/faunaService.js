import { apiClient } from '../config/api'

class FaunaService {
  async getFauna() {
    return await apiClient.get('/api/fauna')
  }

  async getFaunaById(id) {
    return await apiClient.get(`/api/fauna/${id}`)
  }

  async createFauna(data) {
    return await apiClient.post('/api/fauna', data)
  }

  async updateFauna(id, data) {
    return await apiClient.put(`/api/fauna/${id}`, data)
  }

  async deleteFauna(id) {
    return await apiClient.delete(`/api/fauna/${id}`)
  }
}

export default new FaunaService()
