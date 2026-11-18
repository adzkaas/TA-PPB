import { Icon } from './Icon'

// Detail view untuk tanaman atau biota — ditampilkan saat item diklik
export default function DetailView({
  item,
  itemType,
  onBack,
  onWishlistToggle,
  isSaved,
  isAdmin = false,
  onEdit,
  onDelete,
}) {
  if (!item) return null

  const stats =
    itemType === 'Tanaman'
      ? [
          { label: 'Tingkat Kesulitan', value: item.difficulty, icon: 'info' },
          { label: 'Kebutuhan Cahaya', value: item.light, icon: 'sun' },
          { label: 'CO₂', value: item.co2, icon: 'droplet' },
          { label: 'Kecepatan Tumbuh', value: item.growth_rate, icon: 'leaf' },
        ]
      : [
          { label: 'Tingkat Kesulitan', value: item.difficulty, icon: 'info' },
          { label: 'Suhu Air', value: item.water_temp, icon: 'thermometer' },
          { label: 'Rentang pH', value: item.ph_range, icon: 'droplet' },
          { label: 'Ukuran Tank', value: item.tank_size, icon: 'shoppingBag' },
        ]

  return (
    <div className="min-h-screen bg-[#f3f6ef]">
      {/* Back button + Image hero */}
      <div className="relative">
        <div className="aspect-[16/9] max-h-[380px] w-full overflow-hidden bg-[#dce8dc]">
          <img
            src={item.image_url || 'https://images.unsplash.com/photo-1630094129983-2c90e1fa129d?auto=format&fit=crop&w=1200&q=85'}
            alt={item.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1630094129983-2c90e1fa129d?auto=format&fit=crop&w=1200&q=85'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071e18]/60 via-transparent to-transparent" />
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-[#17352b] backdrop-blur shadow-md"
        >
          <Icon name="arrowLeft" size={16} />
          Kembali
        </button>

        {/* Category badge on image */}
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
          <span className="inline-block rounded-full bg-[#c9f05b] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#14352b]">
            {itemType} · {item.type}
          </span>
          {isAdmin && (
            <span className="rounded-full bg-[#c9f05b] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0c2f27] shadow-sm">
              🛡️ Admin Mode
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-5 py-8 pb-28">
        <p className="text-sm italic text-[#7c8e84]">{item.scientific_name}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{item.name}</h1>

        {/* Description */}
        {item.description && (
          <p className="mt-5 text-sm leading-7 text-[#587066]">{item.description}</p>
        )}

        {/* Stats grid */}
        <div className="mt-7 grid grid-cols-2 gap-4">
          {stats.map((stat) =>
            stat.value ? (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#dfe6dc] bg-white p-4"
              >
                <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94a198]">
                  {stat.label}
                </span>
                <span className="mt-2 block text-sm font-semibold text-[#17352b]">
                  {stat.value}
                </span>
              </div>
            ) : null,
          )}
        </div>

        {/* Care tips */}
        {item.care_tips && (
          <div className="mt-6 rounded-2xl border border-[#dfe6dc] bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-[#315d4b]">💡 Tips Perawatan</h3>
            <p className="text-sm leading-6 text-[#587066]">{item.care_tips}</p>
          </div>
        )}

        {/* Compatibility (fauna only) */}
        {itemType === 'Biota' && item.compatibility && (
          <div className="mt-4 rounded-2xl border border-[#dfe6dc] bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-[#315d4b]">🐟 Kompatibilitas</h3>
            <p className="text-sm leading-6 text-[#587066]">{item.compatibility}</p>
          </div>
        )}

        {/* Admin Quick Action Bar (Nuansa Hijau Web) */}
        {isAdmin && (
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => onEdit && onEdit(item, itemType)}
              className="flex flex-1 h-12 items-center justify-center gap-2 rounded-2xl border border-[#b8ceb4] bg-[#e8f1e5] px-4 text-xs font-bold text-[#0c2f27] transition hover:bg-[#c9f05b] active:scale-95"
            >
              <Icon name="edit" size={16} strokeWidth={2} />
              Edit Data
            </button>
            <button
              onClick={() => onDelete && onDelete(item, itemType)}
              className="flex flex-1 h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0c2f27] px-4 text-xs font-bold text-[#c9f05b] shadow-md transition hover:bg-[#15463b] active:scale-95"
            >
              <Icon name="trash" size={16} strokeWidth={2} />
              Hapus Item
            </button>
          </div>
        )}

        {/* Wishlist CTA */}
        <button
          onClick={() => onWishlistToggle(item, itemType)}
          className={`mt-4 flex h-14 w-full items-center justify-center gap-3 rounded-full text-sm font-bold transition-all ${
            isSaved
              ? 'border-2 border-[#173f34] bg-transparent text-[#173f34]'
              : 'bg-[#173f34] text-white hover:bg-[#1f5040]'
          }`}
        >
          <span className={isSaved ? 'fill-heart text-[#173f34]' : ''}>
            <Icon name="heart" size={18} />
          </span>
          {isSaved ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
        </button>
      </div>
    </div>
  )
}
