import { Icon } from './Icon'

// Modal konfirmasi hapus data dengan gaya tema AquascapeHub (Forest Green & Lime)
export default function ConfirmDeleteModal({
  isOpen,
  item,
  itemType,
  onClose,
  onConfirm,
  loading = false,
}) {
  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-white/15 bg-[#0c2f27] p-6 text-white shadow-2xl">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#c9f05b]/15 blur-3xl" />

        {/* Icon & Close */}
        <div className="mb-4 flex items-center justify-between">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#c9f05b] text-[#0c2f27] shadow-lg shadow-[#c9f05b]/20">
            <Icon name="trash" size={22} strokeWidth={2.2} />
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Tutup"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Content */}
        <span className="inline-block rounded-full bg-[#c9f05b]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#c9f05b]">
          Konfirmasi Hapus {itemType}
        </span>
        <h3 className="mt-2 text-xl font-bold tracking-tight text-white">
          Hapus &ldquo;{item.name}&rdquo;?
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-white/70">
          Data {itemType.toLowerCase()} ini akan dihapus secara permanen dari katalog AquascapeHub dan database Supabase.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-full border border-white/20 py-2.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 active:scale-95 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#c9f05b] py-2.5 text-xs font-bold text-[#0c2f27] shadow-md transition hover:bg-[#d6f773] active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Icon name="loader" size={14} className="animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <span>Ya, Hapus</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
