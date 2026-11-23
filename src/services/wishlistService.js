import { apiClient } from '../config/api'
import userService from './userService'

// ---------------------------------------------------------------------------
// WishlistService — Layanan data Wishlist per-user (RESTful Web Service Modul 1)
// Berkomunikasi dengan Express API backend di /api/wishlist + offline fallback
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

  getPendingDeleteKey(userId) {
    const uid = this.getUserId(userId)
    return uid ? `aquascapehub_pending_del_${uid}` : 'aquascapehub_pending_del_guest'
  }

  getPendingDeletes(userId) {
    try {
      const raw = localStorage.getItem(this.getPendingDeleteKey(userId))
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  savePendingDeletes(items, userId) {
    try {
      localStorage.setItem(this.getPendingDeleteKey(userId), JSON.stringify(items))
    } catch (e) {
      console.warn('[wishlistService] Gagal simpan pending deletes:', e)
    }
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
   * Mengirimkan perubahan offline (tambah & hapus wishlist) yang tersimpan
   * sementara di localStorage ke server Express API saat internet aktif kembali.
   */
  async syncPending(userId) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return
    const uid = this.getUserId(userId)
    if (!uid) return

    // 1. Eksekusi antrean hapus yang terjadi saat offline
    const pendingDels = this.getPendingDeletes(uid)
    if (pendingDels.length > 0) {
      const remainingDels = []
      for (const delTarget of pendingDels) {
        try {
          await apiClient.delete(`/api/wishlist/${encodeURIComponent(delTarget)}?user_id=${encodeURIComponent(uid)}`)
        } catch {
          remainingDels.push(delTarget)
        }
      }
      this.savePendingDeletes(remainingDels, uid)
    }

    // 2. Eksekusi antrean tambah yang terjadi saat offline (item ber-ID temp-)
    const local = this.getLocal(uid)
    const pendingAdds = local.filter((w) => String(w.id).startsWith('temp-'))
    for (const item of pendingAdds) {
      try {
        const payload = {
          user_id: uid,
          item_id: String(item.item_id),
          item_type: item.item_type,
          item_name: item.item_name,
          item_image: item.item_image || '',
          notes: item.notes || '',
        }
        const saved = await apiClient.post('/api/wishlist', payload)
        if (saved?.id) {
          const freshLocal = this.getLocal(uid)
          const updated = freshLocal.map((w) => (w.id === item.id ? { ...w, ...saved } : w))
          this.saveLocal(updated, uid)
        }
      } catch (err) {
        console.warn('[wishlistService] Gagal sync pending item ke Express API:', err.message)
      }
    }
  }

  async getWishlist(userId) {
    const uid = this.getUserId(userId)
    try {
      await this.syncPending(uid)

      const url = uid ? `/api/wishlist?user_id=${encodeURIComponent(uid)}` : '/api/wishlist'
      const data = await apiClient.get(url)
      if (Array.isArray(data)) {
        this.saveLocal(data, uid)
        return data
      }
    } catch (err) {
      console.warn('[wishlistService] API fetch error, fallback ke cache lokal:', err.message)
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

    try {
      const payload = {
        user_id: uid,
        item_id: strItemId,
        item_type: item.item_type,
        item_name: item.item_name,
        item_image: item.item_image,
        notes: item.notes || '',
      }
      const saved = await apiClient.post('/api/wishlist', payload)
      if (saved && saved.id) {
        const updated = this.getLocal(uid).map((w) =>
          w.id === tempId ? { ...w, id: saved.id, ...saved } : w,
        )
        this.saveLocal(updated, uid)
        return { success: true, data: saved }
      }
    } catch (err) {
      console.warn('[wishlistService] Gagal simpan ke Express API, tersimpan lokal:', err.message)
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

    try {
      await apiClient.delete(`/api/wishlist/${encodeURIComponent(target)}?user_id=${encodeURIComponent(uid || '')}`)
    } catch (err) {
      console.warn('[wishlistService] Gagal hapus di Express API, ditambahkan ke antrean offline:', err.message)
      const pendingDels = this.getPendingDeletes(uid)
      if (!pendingDels.includes(target)) {
        pendingDels.push(target)
        this.savePendingDeletes(pendingDels, uid)
      }
    }
  }

  isInWishlist(itemId, itemType, userId) {
    const uid = this.getUserId(userId)
    const local = this.getLocal(uid)
    return local.some(
      (w) => String(w.item_id) === String(itemId) && w.item_type === itemType,
    )
  }
}

export default new WishlistService()
