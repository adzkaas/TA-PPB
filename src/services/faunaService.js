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

  // Fallback kalkulasi lokal jika offline atau menggunakan data lokal
  compareFaunaLocal(fauna1, fauna2) {
    const parseRange = (str) => {
      if (!str) return null
      const nums = String(str).match(/\d+(?:\.\d+)?/g)
      if (!nums || nums.length === 0) return null
      const first = parseFloat(nums[0])
      const second = nums.length > 1 ? parseFloat(nums[1]) : first
      return { min: Math.min(first, second), max: Math.max(first, second) }
    }

    const checkOverlap = (r1, r2, unit = '') => {
      if (!r1 || !r2) return { match: false, formatted: null, parsed: false }
      const min = Math.max(r1.min, r2.min)
      const max = Math.min(r1.max, r2.max)
      const match = min <= max
      const formatted = match ? (min === max ? `${min}${unit}` : `${min}–${max}${unit}`) : null
      return { match, formatted, parsed: true }
    }

    const tempResult = checkOverlap(parseRange(fauna1.water_temp), parseRange(fauna2.water_temp), '°C')
    const phResult = checkOverlap(parseRange(fauna1.ph_range), parseRange(fauna2.ph_range), '')
    const compatible = tempResult.match && phResult.match

    let message = ''
    if (compatible) {
      message = `${fauna1.name} dan ${fauna2.name} bisa disatukan dalam 1 tank! Suhu air dan pH keduanya saling sesuai.`
    } else if (!tempResult.parsed || !phResult.parsed) {
      message = 'Data suhu air atau pH salah satu biota belum lengkap untuk dibandingkan.'
    } else if (!tempResult.match && !phResult.match) {
      message = `${fauna1.name} dan ${fauna2.name} tidak disarankan disatukan dalam 1 tank karena rentang suhu air dan pH tidak sesuai.`
    } else if (!tempResult.match) {
      message = `${fauna1.name} dan ${fauna2.name} tidak disarankan disatukan dalam 1 tank karena rentang suhu air tidak sesuai.`
    } else {
      message = `${fauna1.name} dan ${fauna2.name} tidak disarankan disatukan dalam 1 tank karena rentang pH air tidak sesuai.`
    }

    return {
      compatible,
      tempMatch: tempResult.match,
      phMatch: phResult.match,
      recommendedTemp: tempResult.formatted,
      recommendedPh: phResult.formatted,
      message,
      fauna1,
      fauna2,
    }
  }

  async compareFauna(fauna1, fauna2) {
    try {
      const res = await apiClient.post('/api/fauna/compare', {
        id1: fauna1.id,
        id2: fauna2.id,
      })
      return res
    } catch (err) {
      console.warn('[faunaService] Fallback ke kalkulasi compare lokal:', err.message)
      return this.compareFaunaLocal(fauna1, fauna2)
    }
  }
}

export default new FaunaService()
