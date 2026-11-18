import { useState, useEffect, useCallback } from 'react'
import wishlistService from '../services/wishlistService'

export function useWishlist() {
  const [wishlist, setWishlist] = useState(() => wishlistService.getLocal())
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await wishlistService.getWishlist()
      setWishlist(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addItem = useCallback(
    async (item) => {
      const result = await wishlistService.addItem(item)
      setWishlist(wishlistService.getLocal())
      return result
    },
    [],
  )

  const removeItem = useCallback(
    async (id, itemId) => {
      await wishlistService.removeItem(id, itemId)
      setWishlist(wishlistService.getLocal())
    },
    [],
  )

  const isInWishlist = useCallback((item_id, item_type) => {
    return wishlistService.isInWishlist(item_id, item_type)
  }, [])

  return { wishlist, loading, addItem, removeItem, isInWishlist, refresh }
}
