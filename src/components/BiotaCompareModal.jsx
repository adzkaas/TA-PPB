import { Icon } from './Icon'

// Modal Perbandingan 2 Biota — membandingkan suhu air & pH untuk kecocokan 1 tank
export default function BiotaCompareModal({
  isOpen,
  onClose,
  allFauna = [],
  selectedPair = [],
  onChangePair,
  compareResult,
  loading,
}) {
  if (!isOpen) return null

  const fauna1 = compareResult?.fauna1 || selectedPair[0] || null
  const fauna2 = compareResult?.fauna2 || selectedPair[1] || null

  const handleSelectChange = (slotIndex, newId) => {
    const picked = allFauna.find((f) => String(f.id) === String(newId))
    if (!picked) return
    const next = [...selectedPair]
    next[slotIndex] = picked
    onChangePair(next)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[#dfe6dc] bg-[#f8faf6] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#dfe6dc] bg-[#0c2f27] px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#c9f05b] text-[#0c2f27]">
              <Icon name="compare" size={18} strokeWidth={2.2} />
            </span>
            <div>
              <h2 className="text-base font-bold tracking-tight">Bandingkan 2 Biota</h2>
              <p className="text-[11px] text-white/70">Cek kecocokan suhu air & pH dalam 1 tank</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Tutup modal perbandingan"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="p-6">
          {/* Dropdown pemilih biota agar user juga bisa ganti langsung di modal */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#4b8268]">
                Biota Pertama
              </label>
              <select
                value={fauna1?.id || ''}
                onChange={(e) => handleSelectChange(0, e.target.value)}
                className="w-full rounded-xl border border-[#d9e2d6] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#17352b] outline-none focus:border-[#2f6f53]"
              >
                <option value="" disabled>Pilih biota 1...</option>
                {allFauna.map((f) => (
                  <option key={f.id} value={f.id} disabled={String(f.id) === String(fauna2?.id)}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#4b8268]">
                Biota Kedua
              </label>
              <select
                value={fauna2?.id || ''}
                onChange={(e) => handleSelectChange(1, e.target.value)}
                className="w-full rounded-xl border border-[#d9e2d6] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#17352b] outline-none focus:border-[#2f6f53]"
              >
                <option value="" disabled>Pilih biota 2...</option>
                {allFauna.map((f) => (
                  <option key={f.id} value={f.id} disabled={String(f.id) === String(fauna1?.id)}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 text-[#70827a]">
              <div className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-[#2f6f53] border-t-transparent" />
              <p className="text-xs font-semibold">Menganalisis kecocokan parameter air...</p>
            </div>
          )}

          {/* Hasil Perbandingan */}
          {!loading && compareResult && fauna1 && fauna2 && (
            <>
              {/* Banner Status Kecocokan */}
              <div
                className={`mb-6 rounded-2xl border p-4 shadow-sm ${
                  compareResult.compatible
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-rose-200 bg-rose-50 text-rose-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                      compareResult.compatible
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    <Icon name={compareResult.compatible ? 'check' : 'alertCircle'} size={17} />
                  </span>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold">
                      {compareResult.compatible
                        ? 'Cocok Disatukan dalam 1 Tank!'
                        : 'Tidak Disarankan dalam 1 Tank'}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed opacity-90">
                      {compareResult.message}
                    </p>

                    {/* Rekomendasi parameter ideal jika cocok */}
                    {compareResult.compatible && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {compareResult.recommendedTemp && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-emerald-800 shadow-xs">
                            <Icon name="thermometer" size={13} />
                            Suhu Ideal Bersama: {compareResult.recommendedTemp}
                          </span>
                        )}
                        {compareResult.recommendedPh && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-emerald-800 shadow-xs">
                            <Icon name="droplet" size={13} />
                            pH Ideal Bersama: {compareResult.recommendedPh}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Kartu Perbandingan Side-by-Side */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[fauna1, fauna2].map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-[#dfe6dc] bg-white shadow-xs"
                  >
                    <div className="relative aspect-[16/10] bg-[#dce8dc]">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1630094129983-2c90e1fa129d?auto=format&fit=crop&w=900&q=80'}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-[#0d3028]/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                        {item.type || 'Biota'}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] italic text-[#7c8e84]">{item.scientific_name}</p>
                      <h4 className="text-base font-bold text-[#17352b]">{item.name}</h4>

                      <div className="mt-3 space-y-2 border-t border-[#e7ece4] pt-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[#70827a]">
                            <Icon name="thermometer" size={14} />
                            Suhu Air
                          </span>
                          <span className="font-bold text-[#17352b]">{item.water_temp || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[#70827a]">
                            <Icon name="droplet" size={14} />
                            Rentang pH
                          </span>
                          <span className="font-bold text-[#17352b]">{item.ph_range || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#70827a]">Ukuran Tank</span>
                          <span className="font-semibold text-[#17352b]">{item.tank_size || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detail kecocokan per parameter */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div
                  className={`rounded-xl border p-3 text-xs ${
                    compareResult.tempMatch
                      ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
                      : 'border-rose-200 bg-rose-50/70 text-rose-800'
                  }`}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wider opacity-75">
                    Status Suhu Air
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 font-bold">
                    <Icon name={compareResult.tempMatch ? 'check' : 'x'} size={14} />
                    {compareResult.tempMatch
                      ? `Sesuai (${compareResult.recommendedTemp})`
                      : 'Tidak Sesuai'}
                  </span>
                </div>

                <div
                  className={`rounded-xl border p-3 text-xs ${
                    compareResult.phMatch
                      ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
                      : 'border-rose-200 bg-rose-50/70 text-rose-800'
                  }`}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wider opacity-75">
                    Status Rentang pH
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 font-bold">
                    <Icon name={compareResult.phMatch ? 'check' : 'x'} size={14} />
                    {compareResult.phMatch
                      ? `Sesuai (${compareResult.recommendedPh})`
                      : 'Tidak Sesuai'}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Tombol tutup */}
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-full bg-[#0c2f27] py-3 text-xs font-bold text-[#c9f05b] transition hover:bg-[#15463b]"
          >
            Tutup Perbandingan
          </button>
        </div>
      </div>
    </div>
  )
}
