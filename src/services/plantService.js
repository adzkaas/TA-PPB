import { apiClient } from '../config/api'

// ---------------------------------------------------------------------------
// PlantService — Layanan data katalog Tanaman Air (RESTful Web Service Modul 1)
// Berkomunikasi dengan Express API backend buatan sendiri di /api/plants
// ---------------------------------------------------------------------------
class PlantService {
  async getPlants() {
    const data = await apiClient.get('/api/plants')
    return Array.isArray(data) ? data : []
  }

  async getPlantById(id) {
    const data = await apiClient.get(`/api/plants/${id}`)
    return data
  }

  async createPlant(data) {
    const res = await apiClient.post('/api/plants', data)
    return res
  }

  async updatePlant(id, data) {
    const res = await apiClient.put(`/api/plants/${id}`, data)
    return res
  }

  async deletePlant(id) {
    const res = await apiClient.delete(`/api/plants/${id}`)
    return res
  }
}

export default new PlantService()
