import { apiClient } from '../config/api'

class PlantService {
  async getPlants() {
    return await apiClient.get('/api/plants')
  }

  async getPlantById(id) {
    return await apiClient.get(`/api/plants/${id}`)
  }

  async createPlant(data) {
    return await apiClient.post('/api/plants', data)
  }

  async updatePlant(id, data) {
    return await apiClient.put(`/api/plants/${id}`, data)
  }

  async deletePlant(id) {
    return await apiClient.delete(`/api/plants/${id}`)
  }
}

export default new PlantService()
