import { apiClient } from '../config/api'

const WISHLIST_KEY = 'aquascapehub_wishlist'

class WishlistService {
  /**
   * Mengambil data wishlist dari backend API (Supabase)
   * Dengan fallback cache ke localStorage jika offline.
   */
  async getWishlist() {
    try {
      const data = await apiClient.get('/api/wishlists')
      if (Array.isArray(data)) {
        this.saveLocal(data)
        return data
      }
    } catch (err) {
      console.warn('[wishlistService] Gagal fetch dari API, memuat cache lokal:', err.message)
    }
    return this.getLocal()
  }

  getLocal() {
    try {
      const data = localStorage.getItem(WISHLIST_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  saveLocal(items) {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(items))
    } catch (e) {
      console.error('[wishlistService] Gagal simpan ke localStorage:', e)
    }
  }

  /**
   * Menambahkan item ke wishlist di database Supabase dan localStorage
   */
  async addItem(item) {
    const current = this.getLocal()
    const strItemId = String(item.item_id)
    const exists = current.some(
      (w) => String(w.item_id) === strItemId && w.item_type === item.item_type,
    )
    if (exists) return { success: false, message: 'Item sudah ada di Wishlist' }

    const tempId = `temp-${Date.now()}`
    const newItem = {
      id: tempId,
      item_id: strItemId,
      item_type: item.item_type,
      item_name: item.item_name,
      item_image: item.item_image,
      notes: item.notes || '',
      created_at: new Date().toISOString(),
      item_data: item.item_data || null,
    }

    // Simpan ke cache lokal segera
    this.saveLocal([newItem, ...current])

    // Kirim ke API Supabase
    try {
      const payload = {
        item_id: strItemId,
        item_type: item.item_type,
        item_name: item.item_name,
        item_image: item.item_image,
        notes: item.notes || '',
      }
      const saved = await apiClient.post('/api/wishlists', payload)
      if (saved && saved.id) {
        // Update temp ID dengan ID database Supabase yang asli
        const updated = this.getLocal().map((w) =>
          w.id === tempId ? { ...w, id: saved.id, ...saved } : w,
        )
        this.saveLocal(updated)
        return { success: true, data: saved }
      }
    } catch (err) {
      console.warn('[wishlistService] Gagal simpan ke API Supabase, tersimpan di lokal:', err.message)
    }

    return { success: true, data: newItem }
  }

  /**
   * Menghapus item dari database Supabase dan localStorage
   */
  async removeItem(id, itemId) {
    const target = id || itemId
    const current = this.getLocal()
    const updated = current.filter(
      (w) => w.id !== target && String(w.item_id) !== String(target),
    )
    this.saveLocal(updated)

    try {
      await apiClient.delete(`/api/wishlists/${target}`)
    } catch (err) {
      console.warn('[wishlistService] Gagal hapus dari API Supabase, dihapus di lokal:', err.message)
    }

    return { success: true }
  }

  isInWishlist(item_id, item_type) {
    const current = this.getLocal()
    return current.some(
      (w) => String(w.item_id) === String(item_id) && w.item_type === item_type,
    )
  }

  getCount() {
    return this.getLocal().length
  }
}

export default new WishlistService()
