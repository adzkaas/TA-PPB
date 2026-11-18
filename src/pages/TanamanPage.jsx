import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import CatalogCard from '../components/CatalogCard'
import DetailView from '../components/DetailView'
import ItemEditModal from '../components/ItemEditModal'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import { usePlants } from '../hooks/usePlants'
import plantService from '../services/plantService'

// Halaman Tanaman — Halaman utama katalog tanaman air
export default function TanamanPage({ wishlist, onWishlistToggle, user }) {
  const { plants, loading, error, refetch } = usePlants()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Semua')
  const [selectedItem, setSelectedItem] = useState(null)

  // State untuk modal edit item
  const [editingItem, setEditingItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // State untuk modal konfirmasi hapus data
  const [itemToDelete, setItemToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [notification, setNotification] = useState('')

  const isAdmin = user?.role === 'admin'

  const types = useMemo(() => {
    const unique = [...new Set(plants.map((p) => p.type).filter(Boolean))]
    return ['Semua', ...unique]
  }, [plants])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return plants.filter((p) => {
      const matchSearch =
        !q || p.name?.toLowerCase().includes(q) || p.scientific_name?.toLowerCase().includes(q)
      const matchFilter = filter === 'Semua' || p.type === filter
      return matchSearch && matchFilter
    })
  }, [plants, search, filter])

  const handleEdit = (item) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDeleteRequest = (item) => {
    setItemToDelete(item)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setDeleteLoading(true)

    try {
      await plantService.deletePlant(itemToDelete.id)
      setNotification(`Tanaman "${itemToDelete.name}" berhasil dihapus.`)
      setTimeout(() => setNotification(''), 3000)
      if (selectedItem?.id === itemToDelete.id) {
        setSelectedItem(null)
      }
      setItemToDelete(null)
      refetch()
    } catch (err) {
      alert(`Gagal menghapus tanaman: ${err.message}`)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSaveSuccess = (updatedItem) => {
    setNotification(`Data tanaman "${updatedItem.name}" berhasil diperbarui.`)
    setTimeout(() => setNotification(''), 3000)
    if (selectedItem?.id === updatedItem.id) {
      setSelectedItem(updatedItem)
    }
    refetch()
  }

  // Halaman detail
  if (selectedItem) {
    const isSaved = wishlist.some(
      (w) => w.item_id === String(selectedItem.id) && w.item_type === 'Tanaman',
    )
    return (
      <>
        <DetailView
          item={selectedItem}
          itemType="Tanaman"
          onBack={() => setSelectedItem(null)}
          onWishlistToggle={onWishlistToggle}
          isSaved={isSaved}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
        <ItemEditModal
          isOpen={isModalOpen}
          item={editingItem}
          itemType="Tanaman"
          onClose={() => {
            setIsModalOpen(false)
            setEditingItem(null)
          }}
          onSaveSuccess={handleSaveSuccess}
        />
        <ConfirmDeleteModal
          isOpen={!!itemToDelete}
          item={itemToDelete}
          itemType="Tanaman"
          onClose={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
        />
      </>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 pb-28 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4b8268]">
            Koleksi tanaman
          </p>
        </div>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          Tanaman Air
        </h1>
        <p className="mt-2 text-sm text-[#70827a]">
          Temukan tanaman aquascape yang tepat berdasarkan kebutuhan cahaya, CO₂, dan tingkat kesulitan.
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-800 shadow-sm animate-fade-in">
          <Icon name="check" size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Search bar */}
      <label className="mb-5 flex h-12 w-full items-center gap-3 rounded-full border border-[#d9e2d6] bg-white px-5 text-[#6d8077] shadow-sm focus-within:shadow-[0_0_0_4px_rgba(81,130,103,0.1)] transition-shadow">
        <Icon name="search" size={19} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari tanaman..."
          className="min-w-0 flex-1 bg-transparent text-sm text-[#17352b] outline-none placeholder:text-[#95a39c]"
        />
        {search && (
          <button aria-label="Hapus pencarian" onClick={() => setSearch('')} className="text-[#82938a]">
            <Icon name="x" size={16} />
          </button>
        )}
      </label>

      {/* Filter chips */}
      <div className="mb-7 flex gap-2 overflow-x-auto pb-2">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-bold transition-colors ${
              filter === type
                ? 'bg-[#173f34] text-white'
                : 'border border-[#d7e0d4] bg-transparent text-[#62766d] hover:bg-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-[#70827a]">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#c9f05b] border-t-transparent" />
          <p className="text-sm">Memuat data tanaman...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="mt-8 rounded-[24px] border border-dashed border-[#cdd9c9] bg-white/60 px-6 py-16 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#e8f1df] text-[#53806a]">
            <Icon name="search" />
          </span>
          <h3 className="mt-4 font-semibold">Tanaman tidak ditemukan</h3>
          <p className="mt-1 text-sm text-[#73857b]">Coba kata kunci atau filter lainnya.</p>
        </div>
      )}

      {/* Grid katalog */}
      {!loading && filtered.length > 0 && (
        <>
          <p className="mb-4 text-xs text-[#70827a]">{filtered.length} tanaman ditemukan</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((plant) => (
              <CatalogCard
                key={plant.id}
                item={plant}
                itemType="Tanaman"
                onSelect={setSelectedItem}
                wishlist={wishlist}
                onWishlistToggle={onWishlistToggle}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal Edit Item (Admin) */}
      <ItemEditModal
        isOpen={isModalOpen}
        item={editingItem}
        itemType="Tanaman"
        onClose={() => {
          setIsModalOpen(false)
          setEditingItem(null)
        }}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* Modal Konfirmasi Hapus Data (Gaya Hijau AquascapeHub) */}
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        item={itemToDelete}
        itemType="Tanaman"
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
