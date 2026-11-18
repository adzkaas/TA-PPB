import { useState, useEffect, useCallback } from 'react'
import faunaService from '../services/faunaService'
import FAUNA_LOCAL from '../data/fauna'

export function useFauna() {
  const [fauna, setFauna] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFauna = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await faunaService.getFauna()
      setFauna(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Gagal memuat data biota.')
      setFauna(FAUNA_LOCAL)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFauna()
  }, [fetchFauna])

  return { fauna, loading, error, refetch: fetchFauna }
}
