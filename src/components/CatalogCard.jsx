import { Icon } from './Icon'
import wishlistService from '../services/wishlistService'

// CatalogCard — kartu katalog untuk tanaman & biota
// Mengikuti desain dari Desain Katalog AquascapeHub
export default function CatalogCard({
  item,
  itemType,
  onSelect,
  wishlist,
  onWishlistToggle,
  isAdmin = false,
  onEdit,
  onDelete,
}) {
  const isSaved = wishlist
    ? wishlist.some(
        (w) => w.item_id === String(item.id) && w.item_type === itemType,
      )
    : wishlistService.isInWishlist(String(item.id), itemType)

  const difficultyColor = {
    'Mudah': 'text-emerald-600 bg-emerald-50',
    'Sedang': 'text-amber-600 bg-amber-50',
    'Sulit': 'text-red-600 bg-red-50',
  }[item.difficulty] || 'text-gray-600 bg-gray-50'

  return (
    <article
      className="catalog-card group overflow-hidden rounded-[24px] border border-[#dfe6dc] bg-white cursor-pointer transition-all hover:shadow-lg"
      onClick={() => onSelect(item)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#dce8dc]">
        <img
          src={item.image_url || `https://images.unsplash.com/photo-1630094129983-2c90e1fa129d?auto=format&fit=crop&w=900&q=80`}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1630094129983-2c90e1fa129d?auto=format&fit=crop&w=900&q=80'
          }}
        />
        {/* Category badge */}
        <span className="absolute left-4 top-4 rounded-full bg-[#0d3028]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
          {item.type || itemType}
        </span>

        {/* Action buttons (Admin Edit/Delete di samping tombol Wishlist dengan nuansa hijau web) */}
        <div className="absolute right-4 top-4 flex items-center gap-1.5">
          {isAdmin && (
            <>
              {/* Tombol Edit Admin (Nuansa Hijau Web) */}
              <button
                type="button"
                title={`Edit data ${item.name}`}
                aria-label={`Edit ${item.name}`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (onEdit) onEdit(item, itemType)
                }}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#0c2f27] shadow-md backdrop-blur-md transition-all hover:scale-110 hover:bg-[#c9f05b] active:scale-95"
              >
                <Icon name="edit" size={17} strokeWidth={2} />
              </button>

              {/* Tombol Hapus Admin (Nuansa Hijau Web) */}
              <button
                type="button"
                title={`Hapus ${item.name}`}
                aria-label={`Hapus ${item.name}`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (onDelete) onDelete(item, itemType)
                }}
                className="grid h-10 w-10 place-items-center rounded-full bg-[#0c2f27]/90 text-[#c9f05b] shadow-md backdrop-blur-md transition-all hover:scale-110 hover:bg-[#15463b] active:scale-95"
              >
                <Icon name="trash" size={17} strokeWidth={2} />
              </button>
            </>
          )}

          {/* Tombol Wishlist */}
          <button
            type="button"
            aria-label={isSaved ? `Hapus ${item.name} dari Wishlist` : `Simpan ${item.name} ke Wishlist`}
            onClick={(e) => {
              e.stopPropagation()
              onWishlistToggle(item, itemType)
            }}
            className={`grid h-10 w-10 place-items-center rounded-full backdrop-blur-md shadow-md transition-transform hover:scale-105 active:scale-95 ${
              isSaved ? 'bg-[#c9f05b] text-[#17352b]' : 'bg-white/85 text-[#49665a] hover:bg-white'
            }`}
          >
            <span className={isSaved ? 'fill-heart' : ''}>
              <Icon name="heart" size={18} />
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-[11px] font-medium italic text-[#809087]">
          {item.scientific_name}
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
          {item.name}
        </h3>

        {/* Stats grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#e7ece4] pt-4">
          <div>
            <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-[#94a198]">
              Perawatan
            </span>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${difficultyColor}`}>
              {item.difficulty || '—'}
            </span>
          </div>
          <div>
            <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-[#94a198]">
              {itemType === 'Tanaman' ? 'Cahaya' : 'Suhu Air'}
            </span>
            <span className="mt-1 block text-xs font-semibold">
              {itemType === 'Tanaman' ? (item.light || '—') : (item.water_temp || '—')}
            </span>
          </div>
        </div>

        {/* Detail button */}
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(item) }}
          className="mt-5 flex w-full items-center justify-between rounded-xl bg-[#f0f5e9] px-4 py-3 text-xs font-bold text-[#315d4b] transition-colors hover:bg-[#e6f0d8]"
        >
          Lihat detail
          <Icon name="chevron" size={16} />
        </button>
      </div>
    </article>
  )
}
