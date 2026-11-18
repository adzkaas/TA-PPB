import { apiClient } from '../config/api'
import {
  fetchPlantsFromSupabase,
  updatePlantInSupabase,
  deletePlantFromSupabase,
  createPlantInSupabase,
} from '../config/supabase'

class PlantService {
  async getPlants() {
    // 1. Prioritaskan Supabase langsung agar PWA Android & Vercel langsung terkoneksi
    try {
      const data = await fetchPlantsFromSupabase()
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    } catch (e) {
      console.warn('[plantService] Direct Supabase fetch failed, trying local API:', e.message)
    }

    // 2. Coba lewat backend local API jika aktif
    try {
      return await apiClient.get('/api/plants')
    } catch (err) {
      throw err
    }
  }

  async getPlantById(id) {
    try {
      const plants = await this.getPlants()
      return plants.find((p) => String(p.id) === String(id)) || null
    } catch {
      return await apiClient.get(`/api/plants/${id}`)
    }
  }

  async createPlant(data) {
    try {
      return await createPlantInSupabase(data)
    } catch {
      return await apiClient.post('/api/plants', data)
    }
  }

  async updatePlant(id, data) {
    try {
      return await updatePlantInSupabase(id, data)
    } catch {
      return await apiClient.put(`/api/plants/${id}`, data)
    }
  }

  async deletePlant(id) {
    try {
      return await deletePlantFromSupabase(id)
    } catch {
      return await apiClient.delete(`/api/plants/${id}`)
    }
  }
}

export default new PlantService()
