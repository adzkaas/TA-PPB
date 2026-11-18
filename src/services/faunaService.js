import { apiClient } from '../config/api'
import {
  fetchFaunaFromSupabase,
  updateFaunaInSupabase,
  deleteFaunaFromSupabase,
  createFaunaInSupabase,
} from '../config/supabase'

class FaunaService {
  async getFauna() {
    // 1. Prioritaskan Supabase langsung agar PWA Android & Vercel langsung terkoneksi
    try {
      const data = await fetchFaunaFromSupabase()
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    } catch (e) {
      console.warn('[faunaService] Direct Supabase fetch failed, trying local API:', e.message)
    }

    // 2. Coba lewat backend local API jika aktif
    try {
      return await apiClient.get('/api/fauna')
    } catch (err) {
      throw err
    }
  }

  async getFaunaById(id) {
    try {
      const all = await this.getFauna()
      return all.find((f) => String(f.id) === String(id)) || null
    } catch {
      return await apiClient.get(`/api/fauna/${id}`)
    }
  }

  async createFauna(data) {
    try {
      return await createFaunaInSupabase(data)
    } catch {
      return await apiClient.post('/api/fauna', data)
    }
  }

  async updateFauna(id, data) {
    try {
      return await updateFaunaInSupabase(id, data)
    } catch {
      return await apiClient.put(`/api/fauna/${id}`, data)
    }
  }

  async deleteFauna(id) {
    try {
      return await deleteFaunaFromSupabase(id)
    } catch {
      return await apiClient.delete(`/api/fauna/${id}`)
    }
  }
}

export default new FaunaService()
