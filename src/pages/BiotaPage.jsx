import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import CatalogCard from '../components/CatalogCard'
import DetailView from '../components/DetailView'
import ItemEditModal from '../components/ItemEditModal'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import BiotaCompareModal from '../components/BiotaCompareModal'
import { useFauna } from '../hooks/useFauna'
import faunaService from '../services/faunaService'

// Halaman Biota — Halaman utama katalog biota/fauna akuarium
export default function BiotaPage({ wishlist, onWishlistToggle, user }) {
  const { fauna, loading, error, refetch } = useFauna()
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

  // State untuk fitur perbandingan 2 biota
  const [isCompareMode, setIsCompareMode] = useState(false)
  const [compareList, setCompareList] = useState([])
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)
  const [compareResult, setCompareResult] = useState(null)
  const [compareLoading, setCompareLoading] = useState(false)

  const isAdmin = user?.role === 'admin'

  const types = useMemo(() => {
    const unique = [...new Set(fauna.map((f) => f.type).filter(Boolean))]
    return ['Semua', ...unique]
  }, [fauna])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return fauna.filter((f) => {
      const matchSearch =
        !q || f.name?.toLowerCase().includes(q) || f.scientific_name?.toLowerCase().includes(q)
      const matchFilter = filter === 'Semua' || f.type === filter
      return matchSearch && matchFilter
    })
  }, [fauna, search, filter])

  const handleAddNew = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

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
      await faunaService.deleteFauna(itemToDelete.id)
      setNotification(`Biota "${itemToDelete.name}" berhasil dihapus.`)
      setTimeout(() => setNotification(''), 3000)
      if (selectedItem?.id === itemToDelete.id) {
        setSelectedItem(null)
      }
      setItemToDelete(null)
      refetch()
    } catch (err) {
      alert(`Gagal menghapus biota: ${err.message}`)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSaveSuccess = (savedItem) => {
    const isNew = !editingItem?.id
    setNotification(`Data biota "${savedItem.name}" berhasil ${isNew ? 'ditambahkan' : 'diperbarui'}.`)
    setTimeout(() => setNotification(''), 3000)
    if (selectedItem?.id === savedItem.id) {
      setSelectedItem(savedItem)
    }
    refetch()
  }

  const handleToggleCompareMode = () => {
    if (isCompareMode) {
      setIsCompareMode(false)
      setCompareList([])
    } else {
      setIsCompareMode(true)
      setCompareList([])
    }
  }

  const handleToggleCompareItem = (item) => {
    setCompareList((prev) => {
      const exists = prev.some((b) => String(b.id) === String(item.id))
      if (exists) {
        return prev.filter((b) => String(b.id) !== String(item.id))
      }
      if (prev.length >= 2) {
        return [prev[1], item]
      }
      return [...prev, item]
    })
  }

  const runCompare = async (pair) => {
    if (!pair || pair.length < 2) return
    setIsCompareModalOpen(true)
    setCompareLoading(true)
    try {
      const result = await faunaService.compareFauna(pair[0], pair[1])
      setCompareResult(result)
    } finally {
      setCompareLoading(false)
    }
  }

  // Halaman detail
  if (selectedItem) {
    const isSaved = wishlist.some(
      (w) => w.item_id === String(selectedItem.id) && w.item_type === 'Biota',
    )
    return (
      <>
        <DetailView
          item={selectedItem}
          itemType="Biota"
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
          itemType="Biota"
          onClose={() => {
            setIsModalOpen(false)
            setEditingItem(null)
          }}
          onSaveSuccess={handleSaveSuccess}
        />
        <ConfirmDeleteModal
          isOpen={!!itemToDelete}
          item={itemToDelete}
          itemType="Biota"
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4b8268]">
            Koleksi biota
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {fauna.length >= 2 && (
              <button
                onClick={handleToggleCompareMode}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-sm transition-all hover:scale-105 ${
                  isCompareMode
                    ? 'bg-[#c9f05b] text-[#0c2f27]'
                    : 'border border-[#0c2f27]/20 bg-white text-[#0c2f27] hover:bg-[#e8f4d8]'
                }`}
              >
                <Icon name="compare" size={15} />
                <span>{isCompareMode ? 'Batal Bandingkan' : 'Bandingkan 2 Biota'}</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={handleAddNew}
                className="flex items-center gap-1.5 rounded-full bg-[#0c2f27] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#15463b] transition-all hover:scale-105"
              >
                <Icon name="plus" size={15} />
                <span>Tambah Biota</span>
              </button>
            )}
          </div>
        </div>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          Biota Akuarium
        </h1>
        <p className="mt-2 text-sm text-[#70827a]">
          Pilih ikan, udang, dan siput yang cocok untuk ekosistem aquascape kamu.
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
          placeholder="Cari biota..."
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
            className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-bold transition-colors ${filter === type
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
          <p className="text-sm">Memuat data biota...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="mt-8 rounded-[24px] border border-dashed border-[#cdd9c9] bg-white/60 px-6 py-16 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#e8f1df] text-[#53806a]">
            <Icon name="fish" />
          </span>
          <h3 className="mt-4 font-semibold">Biota tidak ditemukan</h3>
          <p className="mt-1 text-sm text-[#73857b]">Coba kata kunci atau filter lainnya.</p>
        </div>
      )}

      {/* Grid katalog */}
      {!loading && filtered.length > 0 && (
        <>
          <p className="mb-4 text-xs text-[#70827a]">{filtered.length} biota ditemukan</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <CatalogCard
                key={item.id}
                item={item}
                itemType="Biota"
                onSelect={setSelectedItem}
                wishlist={wishlist}
                onWishlistToggle={onWishlistToggle}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                isCompareMode={isCompareMode}
                isSelectedForCompare={compareList.some((b) => String(b.id) === String(item.id))}
                onToggleCompare={handleToggleCompareItem}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal Edit Item (Admin) */}
      <ItemEditModal
        isOpen={isModalOpen}
        item={editingItem}
        itemType="Biota"
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
        itemType="Biota"
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />

      {/* Floating Bar Mode Bandingkan 2 Biota */}
      {isCompareMode && (
        <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-xl rounded-2xl border border-[#0c2f27]/15 bg-[#0c2f27] p-4 text-white shadow-2xl md:bottom-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#c9f05b]">
                Mode Bandingkan ({compareList.length}/2 dipilih)
              </p>
              <p className="mt-0.5 text-[11px] text-white/75">
                {compareList.length === 0 && 'Klik 2 kartu biota untuk cek kecocokan suhu air & pH.'}
                {compareList.length === 1 && `Dipilih: ${compareList[0].name}. Pilih 1 biota lagi.`}
                {compareList.length === 2 && `${compareList[0].name} vs ${compareList[1].name}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleCompareMode}
                className="rounded-full border border-white/20 px-3.5 py-2 text-xs font-bold text-white/80 hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={compareList.length < 2}
                onClick={() => runCompare(compareList)}
                className="rounded-full bg-[#c9f05b] px-4 py-2 text-xs font-bold text-[#0c2f27] transition hover:bg-[#d8f878] disabled:opacity-40"
              >
                Bandingkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Perbandingan 2 Biota */}
      <BiotaCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        allFauna={fauna}
        selectedPair={compareList}
        onChangePair={(nextPair) => {
          setCompareList(nextPair)
          if (nextPair.length === 2 && nextPair[0] && nextPair[1]) {
            runCompare(nextPair)
          }
        }}
        compareResult={compareResult}
        loading={compareLoading}
      />
    </div>
  )
}
