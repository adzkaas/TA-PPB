import { useState, useEffect } from 'react'
import { Icon } from './Icon'
import plantService from '../services/plantService'
import faunaService from '../services/faunaService'

export default function ItemEditModal({ item, itemType, isOpen, onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        scientific_name: item.scientific_name || '',
        type: item.type || '',
        difficulty: item.difficulty || 'Mudah',
        image_url: item.image_url || '',
        description: item.description || '',
        care_tips: item.care_tips || '',
        // Plant specific
        light: item.light || '',
        co2: item.co2 || '',
        growth_rate: item.growth_rate || '',
        // Fauna specific
        water_temp: item.water_temp || '',
        ph_range: item.ph_range || '',
        tank_size: item.tank_size || '',
        compatibility: item.compatibility || '',
      })
    }
  }, [item])

  if (!isOpen || !item) return null

  const isPlant = itemType === 'Tanaman'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let updated
      if (isPlant) {
        const plantPayload = {
          name: formData.name,
          scientific_name: formData.scientific_name,
          type: formData.type,
          difficulty: formData.difficulty,
          light: formData.light,
          co2: formData.co2,
          growth_rate: formData.growth_rate,
          description: formData.description,
          care_tips: formData.care_tips,
          image_url: formData.image_url,
        }
        updated = await plantService.updatePlant(item.id, plantPayload)
      } else {
        const faunaPayload = {
          name: formData.name,
          scientific_name: formData.scientific_name,
          type: formData.type,
          difficulty: formData.difficulty,
          water_temp: formData.water_temp,
          ph_range: formData.ph_range,
          tank_size: formData.tank_size,
          compatibility: formData.compatibility,
          description: formData.description,
          care_tips: formData.care_tips,
          image_url: formData.image_url,
        }
        updated = await faunaService.updateFauna(item.id, faunaPayload)
      }
      onSaveSuccess(updated || { ...item, ...formData })
      onClose()
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Gagal menyimpan perubahan data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#dfe6dc] bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-[#e7ece4] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#c9f05b] text-[#0c2f27]">
              <Icon name="edit" size={16} />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#0c2f27]">
                Edit {itemType}: {item.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Image Preview & URL */}
          <div>
            <label className="mb-1 block font-semibold text-gray-700">URL Gambar</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-[#0c2f27] focus:bg-white"
            />
            {formData.image_url && (
              <div className="mt-2 h-28 w-full overflow-hidden rounded-xl border bg-gray-100">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1630094129983-2c90e1fa129d?auto=format&fit=crop&w=900&q=80' }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-gray-700">Nama Populer</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-[#0c2f27] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-gray-700">Nama Ilmiah</label>
              <input
                type="text"
                name="scientific_name"
                value={formData.scientific_name}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-[#0c2f27] focus:bg-white italic"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-gray-700">Kategori / Tipe</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                placeholder={isPlant ? "Foreground / Stem / Rhizome" : "Ikan Schooling / Udang"}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-[#0c2f27] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-gray-700">Tingkat Kesulitan</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-[#0c2f27] focus:bg-white"
              >
                <option value="Mudah">Mudah</option>
                <option value="Sedang">Sedang</option>
                <option value="Sulit">Sulit</option>
              </select>
            </div>
          </div>

          {/* Plant specific fields */}
          {isPlant && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block font-semibold text-gray-700">Kebutuhan Cahaya</label>
                <input
                  type="text"
                  name="light"
                  value={formData.light}
                  onChange={handleChange}
                  placeholder="Rendah - Tinggi"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs outline-none focus:border-[#0c2f27] focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-gray-700">Kebutuhan CO2</label>
                <input
                  type="text"
                  name="co2"
                  value={formData.co2}
                  onChange={handleChange}
                  placeholder="Rendah / Ya"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs outline-none focus:border-[#0c2f27] focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-gray-700">Kecepatan Tumbuh</label>
                <input
                  type="text"
                  name="growth_rate"
                  value={formData.growth_rate}
                  onChange={handleChange}
                  placeholder="Lambat / Cepat"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs outline-none focus:border-[#0c2f27] focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Fauna specific fields */}
          {!isPlant && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block font-semibold text-gray-700">Suhu Air</label>
                <input
                  type="text"
                  name="water_temp"
                  value={formData.water_temp}
                  onChange={handleChange}
                  placeholder="22 - 28 °C"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs outline-none focus:border-[#0c2f27] focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-gray-700">Rentang pH</label>
                <input
                  type="text"
                  name="ph_range"
                  value={formData.ph_range}
                  onChange={handleChange}
                  placeholder="6.0 - 7.5"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs outline-none focus:border-[#0c2f27] focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-gray-700">Ukuran Tank Min.</label>
                <input
                  type="text"
                  name="tank_size"
                  value={formData.tank_size}
                  onChange={handleChange}
                  placeholder="40 Liter"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs outline-none focus:border-[#0c2f27] focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block font-semibold text-gray-700">Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-[#0c2f27] focus:bg-white resize-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-gray-700">Tips Perawatan</label>
            <textarea
              name="care_tips"
              value={formData.care_tips}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-[#0c2f27] focus:bg-white resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-[#0c2f27] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#15463b] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Icon name="loader" size={14} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Icon name="check" size={14} />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
