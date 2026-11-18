import { apiClient } from '../config/api'
import userService from './userService'

class WishlistService {
  /**
   * Mengambil ID user aktif saat ini
   */
  getUserId(passedUserId) {
    if (passedUserId) return String(passedUserId)
    const current = userService.getCurrentUser()
    return current?.id ? String(current.id) : null
  }

  /**
   * Key localStorage terisolasi per-user agar wishlist tidak tertukar
   */
  getStorageKey(userId) {
    const uid = this.getUserId(userId)
    return uid ? `aquascapehub_wishlist_${uid}` : 'aquascapehub_wishlist_guest'
  }

  getLocal(userId) {
    try {
      const key = this.getStorageKey(userId)
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  saveLocal(items, userId) {
    try {
      const key = this.getStorageKey(userId)
      localStorage.setItem(key, JSON.stringify(items))
    } catch (e) {
      console.error('[wishlistService] Gagal simpan ke localStorage:', e)
    }
  }

  /**
   * Mengambil data wishlist dari backend API (Supabase) khusus untuk user yang sedang login
   */
  async getWishlist(userId) {
    const uid = this.getUserId(userId)
    try {
      const url = uid ? `/api/wishlists?userId=${encodeURIComponent(uid)}` : '/api/wishlists'
      const data = await apiClient.get(url)
      if (Array.isArray(data)) {
        this.saveLocal(data, uid)
        return data
      }
    } catch (err) {
      console.warn('[wishlistService] Gagal fetch dari API, memuat cache lokal:', err.message)
    }
    return this.getLocal(uid)
  }

  /**
   * Menambahkan item ke wishlist di database Supabase dan localStorage khusus untuk user ini
   */
  async addItem(item, userId) {
    const uid = this.getUserId(userId || item.user_id)
    const current = this.getLocal(uid)
    const strItemId = String(item.item_id)
    const exists = current.some(
      (w) => String(w.item_id) === strItemId && w.item_type === item.item_type,
    )
    if (exists) return { success: false, message: 'Item sudah ada di Wishlist' }

    const tempId = `temp-${Date.now()}`
    const newItem = {
      id: tempId,
      user_id: uid,
      item_id: strItemId,
      item_type: item.item_type,
      item_name: item.item_name,
      item_image: item.item_image,
      notes: item.notes || '',
      created_at: new Date().toISOString(),
      item_data: item.item_data || null,
    }

    // Simpan ke cache lokal user
    this.saveLocal([newItem, ...current], uid)

    // Kirim ke API Supabase
    try {
      const payload = {
        user_id: uid,
        item_id: strItemId,
        item_type: item.item_type,
        item_name: item.item_name,
        item_image: item.item_image,
        notes: item.notes || '',
      }
      const saved = await apiClient.post('/api/wishlists', payload)
      if (saved && saved.id) {
        const updated = this.getLocal(uid).map((w) =>
          w.id === tempId ? { ...w, id: saved.id, ...saved } : w,
        )
        this.saveLocal(updated, uid)
        return { success: true, data: saved }
      }
    } catch (err) {
      console.warn('[wishlistService] Gagal simpan ke API Supabase, tersimpan di lokal:', err.message)
    }

    return { success: true, data: newItem }
  }

  /**
   * Menghapus item dari database Supabase dan localStorage khusus untuk user ini
   */
  async removeItem(id, itemId, userId) {
    const uid = this.getUserId(userId)
    const target = id || itemId
    const current = this.getLocal(uid)
    const updated = current.filter(
      (w) => w.id !== target && String(w.item_id) !== String(target),
    )
    this.saveLocal(updated, uid)

    try {
      const url = uid
        ? `/api/wishlists/${target}?userId=${encodeURIComponent(uid)}`
        : `/api/wishlists/${target}`
      await apiClient.delete(url)
    } catch (err) {
      console.warn('[wishlistService] Gagal hapus dari API Supabase, dihapus di lokal:', err.message)
    }

    return { success: true }
  }

  isInWishlist(item_id, item_type, userId) {
    const uid = this.getUserId(userId)
    const current = this.getLocal(uid)
    return current.some(
      (w) => String(w.item_id) === String(item_id) && w.item_type === item_type,
    )
  }

  getCount(userId) {
    return this.getLocal(userId).length
  }
}

export default new WishlistService()
