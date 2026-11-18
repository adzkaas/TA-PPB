import { Icon } from '../components/Icon'
import DetailView from '../components/DetailView'
import { useState } from 'react'

// Halaman Wishlist / Tank Saya — menyimpan item favorit pengguna
export default function WishlistPage({ wishlist, onWishlistToggle, onNavigateTanaman, onNavigateBiota }) {
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedType, setSelectedType] = useState(null)

  const handleSelect = (item, type) => {
    setSelectedItem(item)
    setSelectedType(type)
  }

  // Detail view
  if (selectedItem) {
    const isSaved = wishlist.some(
      (w) => w.item_id === String(selectedItem.id) && w.item_type === selectedType
    )
    return (
      <DetailView
        item={selectedItem}
        itemType={selectedType}
        onBack={() => { setSelectedItem(null); setSelectedType(null) }}
        onWishlistToggle={onWishlistToggle}
        isSaved={isSaved}
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 pb-28 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4b8268]">
          Koleksi tersimpan
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          Wishlist
        </h1>
        <p className="mt-2 text-sm text-[#70827a]">
          Tanaman dan biota yang kamu simpan untuk direncanakan.
        </p>
      </div>

      {/* Count badge */}
      {wishlist.length > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#dfe6dc] bg-white p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#c9f05b] text-[#14352b]">
            <Icon name="shoppingBag" size={20} />
          </span>
          <div>
            <p className="text-sm font-semibold">{wishlist.length} item tersimpan</p>
            <p className="text-xs text-[#70827a]">Rencana akuarium kamu</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {wishlist.length === 0 && (
        <div className="mt-8 rounded-[24px] border border-dashed border-[#cdd9c9] bg-white/60 px-6 py-20 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e8f1df] text-[#53806a]">
            <Icon name="heart" size={28} />
          </span>
          <h3 className="mt-5 text-lg font-semibold">Wishlist kamu masih kosong</h3>
          <p className="mt-2 text-sm text-[#73857b]">
            Simpan tanaman atau biota favoritmu untuk mulai merancang aquascape.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={onNavigateTanaman}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#173f34] px-6 text-sm font-bold text-white"
            >
              <Icon name="leaf" size={16} />
              Jelajahi Tanaman
            </button>
            <button
              onClick={onNavigateBiota}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#173f34] px-6 text-sm font-bold text-[#173f34]"
            >
              <Icon name="fish" size={16} />
              Jelajahi Biota
            </button>
          </div>
        </div>
      )}

      {/* Wishlist grid */}
      {wishlist.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((wItem) => (
            <div
              key={wItem.id}
              className="catalog-card group overflow-hidden rounded-[20px] border border-[#dfe6dc] bg-white"
            >
              {/* Image */}
              <div
                className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-[#dce8dc]"
                onClick={() => handleSelect({
                  id: wItem.item_id,
                  name: wItem.item_name,
                  image_url: wItem.item_image,
                  ...wItem.item_data,
                }, wItem.item_type)}
              >
                <img
                  src={wItem.item_image || 'https://images.unsplash.com/photo-1630094129983-2c90e1fa129d?auto=format&fit=crop&w=900&q=80'}
                  alt={wItem.item_name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1630094129983-2c90e1fa129d?auto=format&fit=crop&w=900&q=80'
                  }}
                />
                <span className="absolute left-3 top-3 rounded-full bg-[#0d3028]/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  {wItem.item_type}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold">{wItem.item_name}</h3>
                {wItem.notes && (
                  <p className="mt-1 text-xs text-[#70827a]">{wItem.notes}</p>
                )}
                <p className="mt-1 text-[10px] text-[#9bac9e]">
                  Ditambahkan {new Date(wItem.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                </p>

                {/* Remove button */}
                <button
                  onClick={() => onWishlistToggle({ id: wItem.item_id, name: wItem.item_name, image_url: wItem.item_image }, wItem.item_type)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Icon name="trash" size={14} />
                  Hapus dari Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
