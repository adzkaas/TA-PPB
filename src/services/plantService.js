import { apiClient, IS_SUPABASE } from '../config/api'

// ---------------------------------------------------------------------------
// PlantService — Layanan data katalog Tanaman Air (RESTful Web Service)
// Mengikuti standar Modul 5: Mendukung Supabase PostgREST (/rest/v1/plants)
// ---------------------------------------------------------------------------
class PlantService {
  async getPlants() {
    if (IS_SUPABASE) {
      const data = await apiClient.get('/rest/v1/plants?select=*&order=created_at.desc')
      return Array.isArray(data) ? data : []
    }
    return apiClient.get('/api/plants')
  }

  async getPlantById(id) {
    if (IS_SUPABASE) {
      const data = await apiClient.get(`/rest/v1/plants?id=eq.${id}&select=*`)
      if (Array.isArray(data) && data.length > 0) {
        return data[0]
      }
      throw new Error('Data tanaman tidak ditemukan.')
    }
    return apiClient.get(`/api/plants/${id}`)
  }

  async createPlant(data) {
    if (IS_SUPABASE) {
      const res = await apiClient.post('/rest/v1/plants', data, {
        headers: { Prefer: 'return=representation' },
      })
      return Array.isArray(res) ? res[0] : res
    }
    return apiClient.post('/api/plants', data)
  }

  async updatePlant(id, data) {
    if (IS_SUPABASE) {
      const allowed = [
        'name',
        'scientific_name',
        'type',
        'difficulty',
        'light',
        'co2',
        'growth_rate',
        'description',
        'care_tips',
        'image_url',
      ]
      const clean = {}
      for (const k of allowed) {
        if (data[k] !== undefined) clean[k] = data[k]
      }
      const res = await apiClient.patch(`/rest/v1/plants?id=eq.${id}`, clean, {
        headers: { Prefer: 'return=representation' },
      })
      return Array.isArray(res) ? res[0] : res
    }
    return apiClient.put(`/api/plants/${id}`, data)
  }

  async deletePlant(id) {
    if (IS_SUPABASE) {
      await apiClient.delete(`/rest/v1/plants?id=eq.${id}`)
      return { success: true }
    }
    return apiClient.delete(`/api/plants/${id}`)
  }
}

export default new PlantService()
