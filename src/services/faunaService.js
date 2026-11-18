import { apiClient, IS_SUPABASE } from '../config/api'

// ---------------------------------------------------------------------------
// FaunaService — Layanan data katalog Biota Akuarium (RESTful Web Service)
// Mengikuti standar Modul 5: Mendukung Supabase PostgREST (/rest/v1/fauna)
// ---------------------------------------------------------------------------
class FaunaService {
  async getFauna() {
    if (IS_SUPABASE) {
      const data = await apiClient.get('/rest/v1/fauna?select=*&order=created_at.desc')
      return Array.isArray(data) ? data : []
    }
    return apiClient.get('/api/fauna')
  }

  async getFaunaById(id) {
    if (IS_SUPABASE) {
      const data = await apiClient.get(`/rest/v1/fauna?id=eq.${id}&select=*`)
      if (Array.isArray(data) && data.length > 0) {
        return data[0]
      }
      throw new Error('Data biota tidak ditemukan.')
    }
    return apiClient.get(`/api/fauna/${id}`)
  }

  async createFauna(data) {
    if (IS_SUPABASE) {
      const res = await apiClient.post('/rest/v1/fauna', data, {
        headers: { Prefer: 'return=representation' },
      })
      return Array.isArray(res) ? res[0] : res
    }
    return apiClient.post('/api/fauna', data)
  }

  async updateFauna(id, data) {
    if (IS_SUPABASE) {
      const allowed = [
        'name',
        'scientific_name',
        'type',
        'difficulty',
        'water_temp',
        'ph_range',
        'tank_size',
        'compatibility',
        'description',
        'care_tips',
        'image_url',
      ]
      const clean = {}
      for (const k of allowed) {
        if (data[k] !== undefined) clean[k] = data[k]
      }
      const res = await apiClient.patch(`/rest/v1/fauna?id=eq.${id}`, clean, {
        headers: { Prefer: 'return=representation' },
      })
      return Array.isArray(res) ? res[0] : res
    }
    return apiClient.put(`/api/fauna/${id}`, data)
  }

  async deleteFauna(id) {
    if (IS_SUPABASE) {
      await apiClient.delete(`/rest/v1/fauna?id=eq.${id}`)
      return { success: true }
    }
    return apiClient.delete(`/api/fauna/${id}`)
  }
}

export default new FaunaService()
