import { useState, useEffect, useCallback } from 'react'
import plantService from '../services/plantService'
import PLANTS_LOCAL from '../data/plants'

export function usePlants() {
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPlants = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await plantService.getPlants()
      setPlants(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Gagal memuat data tanaman.')
      // Fallback ke data lokal
      setPlants(PLANTS_LOCAL)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlants()
  }, [fetchPlants])

  return { plants, loading, error, refetch: fetchPlants }
}

export function usePlantById(id) {
  const [plant, setPlant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPlant = useCallback(async () => {
    if (!id) { setLoading(false); return }
    try {
      setLoading(true)
      setError(null)
      const data = await plantService.getPlantById(id)
      setPlant(data)
    } catch (err) {
      setError(err.message || 'Gagal memuat detail tanaman.')
      setPlant(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchPlant() }, [fetchPlant])

  return { plant, loading, error, refetch: fetchPlant }
}
