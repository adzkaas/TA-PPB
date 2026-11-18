import { useState, useEffect, useCallback } from 'react'
import wishlistService from '../services/wishlistService'

export function useWishlist(currentUser) {
  const userId = currentUser?.id ? String(currentUser.id) : null
  const [wishlist, setWishlist] = useState(() => wishlistService.getLocal(userId))
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await wishlistService.getWishlist(userId)
      setWishlist(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Setiap kali akun user berubah (login / logout / ganti akun), load ulang wishlist spesifik user tersebut
  useEffect(() => {
    setWishlist(wishlistService.getLocal(userId))
    refresh()
  }, [userId, refresh])

  // Listener otomatis: saat koneksi internet kembali online, sinkronkan data lokal ke Supabase
  useEffect(() => {
    const handleOnline = () => {
      console.log('[useWishlist] Internet online kembali, menyinkronkan wishlist lokal ke Supabase...')
      refresh()
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [refresh])

  const addItem = useCallback(
    async (item) => {
      const result = await wishlistService.addItem({ ...item, user_id: userId }, userId)
      setWishlist(wishlistService.getLocal(userId))
      return result
    },
    [userId],
  )

  const removeItem = useCallback(
    async (id, itemId) => {
      await wishlistService.removeItem(id, itemId, userId)
      setWishlist(wishlistService.getLocal(userId))
    },
    [userId],
  )

  const isInWishlist = useCallback(
    (item_id, item_type) => {
      return wishlistService.isInWishlist(item_id, item_type, userId)
    },
    [userId],
  )

  return { wishlist, loading, addItem, removeItem, isInWishlist, refresh }
}
