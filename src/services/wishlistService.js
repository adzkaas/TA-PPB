import { apiClient, IS_SUPABASE } from '../config/api'
import userService from './userService'

// ---------------------------------------------------------------------------
// WishlistService — Layanan data Wishlist per-user (RESTful Web Service)
// Mengikuti standar Modul 5 (seperti FavoriteService di PWA2_PrakPPB)
// ---------------------------------------------------------------------------
class WishlistService {
  getUserId(passedUserId) {
    if (passedUserId) return String(passedUserId)
    const current = userService.getCurrentUser()
    return current?.id ? String(current.id) : null
  }

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

  async getWishlist(userId) {
    const uid = this.getUserId(userId)
    if (IS_SUPABASE) {
      try {
        const url = uid
          ? `/rest/v1/wishlist?user_id=eq.${encodeURIComponent(uid)}&select=*&order=created_at.desc`
          : '/rest/v1/wishlist?select=*&order=created_at.desc'
        const data = await apiClient.get(url)
        if (Array.isArray(data)) {
          this.saveLocal(data, uid)
          return data
        }
      } catch (err) {
        console.warn('[wishlistService] Supabase fetch error, fallback ke cache lokal:', err.message)
      }
    }
    return this.getLocal(uid)
  }

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

    this.saveLocal([newItem, ...current], uid)

    if (IS_SUPABASE) {
      try {
        const payload = {
          user_id: uid,
          item_id: strItemId,
          item_type: item.item_type,
          item_name: item.item_name,
          item_image: item.item_image,
          notes: item.notes || '',
        }
        const res = await apiClient.post('/rest/v1/wishlist', payload, {
          headers: { Prefer: 'return=representation' },
        })
        const saved = Array.isArray(res) ? res[0] : res
        if (saved && saved.id) {
          const updated = this.getLocal(uid).map((w) =>
            w.id === tempId ? { ...w, id: saved.id, ...saved } : w,
          )
          this.saveLocal(updated, uid)
          return { success: true, data: saved }
        }
      } catch (err) {
        console.warn('[wishlistService] Gagal simpan ke Supabase, tersimpan lokal:', err.message)
      }
    }

    return { success: true, data: newItem }
  }

  async removeItem(id, itemId, userId) {
    const uid = this.getUserId(userId)
    const target = id || itemId
    const current = this.getLocal(uid)
    const updated = current.filter(
      (w) => w.id !== target && String(w.item_id) !== String(target),
    )
    this.saveLocal(updated, uid)

    if (IS_SUPABASE) {
      try {
        let url = `/rest/v1/wishlist?id=eq.${target}`
        if (uid) url += `&user_id=eq.${encodeURIComponent(uid)}`
        await apiClient.delete(url)
      } catch (err) {
        try {
          let fallbackUrl = `/rest/v1/wishlist?item_id=eq.${target}`
          if (uid) fallbackUrl += `&user_id=eq.${encodeURIComponent(uid)}`
          await apiClient.delete(fallbackUrl)
        } catch (e) {
          console.warn('[wishlistService] Gagal delete dari Supabase:', e.message)
        }
      }
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
