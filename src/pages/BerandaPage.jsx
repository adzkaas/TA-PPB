import { useState, useEffect } from 'react'
import { Icon } from '../components/Icon'
import { usePlants } from '../hooks/usePlants'
import { useFauna } from '../hooks/useFauna'
import PLANTS_LOCAL from '../data/plants'
import FAUNA_LOCAL from '../data/fauna'

// Halaman Beranda — landing page utama AquascapeHub
const heroImage =
  'https://images.unsplash.com/photo-1786966872159-c8ba0f798f73?auto=format&fit=crop&w=1600&q=85'

const quickCategories = [
  { label: 'Tanaman Air', subtitle: 'Koleksi lengkap', icon: 'leaf', nav: 'tanaman' },
  { label: 'Biota Hias', subtitle: 'Ikan, udang & siput', icon: 'fish', nav: 'biota' },
  { label: 'Wishlist', subtitle: 'Koleksi tersimpan', icon: 'shoppingBag', nav: 'wishlist' },
]

export default function BerandaPage({ onNavigate, wishlistCount }) {
  const { plants } = usePlants()
  const { fauna } = useFauna()

  // Ambil data aktif dari Supabase (dengan fallback ke lokal jika API belum selesai fetch)
  const plantList = plants && plants.length > 0 ? plants : PLANTS_LOCAL
  const faunaList = fauna && fauna.length > 0 ? fauna : FAUNA_LOCAL

  const [plantIndex, setPlantIndex] = useState(0)
  const [faunaIndex, setFaunaIndex] = useState(0)

  // Efek rotasi otomatis setiap 2 detik (2000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setPlantIndex((prev) => (prev + 1) % plantList.length)
      setFaunaIndex((prev) => (prev + 1) % faunaList.length)
    }, 2000)

    return () => clearInterval(timer)
  }, [plantList.length, faunaList.length])

  const currentPlant = plantList[plantIndex] || plantList[0]
  const currentFauna = faunaList[faunaIndex] || faunaList[0]

  return (
    <div className="pb-28">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0c2f27] text-white">
        <div className="water-lines" />
        <div className="mx-auto grid max-w-7xl items-center gap-9 px-5 pb-14 pt-7 md:min-h-[520px] md:grid-cols-[0.9fr_1.1fr] md:px-8 md:py-16">
          <div className="relative z-10 order-2 max-w-xl md:order-1">
            <h1 className="max-w-[620px] text-[42px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[68px]">
              Hidupkan dunia
              <span className="serif-accent mt-1 block font-normal italic text-[#c9f05b]">
                di dalam air.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-white/65 sm:text-base">
              Temukan tanaman air dan biota yang tepat untuk menciptakan ekosistem akuarium yang sehat, indah, dan penuh cerita.
            </p>
          </div>

          {/* Hero image */}
          <div className="relative order-1 md:order-2">
            <div className="hero-frame relative ml-auto aspect-[4/3] max-h-[420px] w-full overflow-hidden rounded-[32px] md:aspect-[5/4] md:w-[92%]">
              <img
                src={heroImage}
                alt="Aquascape hijau dengan tanaman air yang rimbun"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071e18]/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d9f88c]">
                    Inspirasi minggu ini
                  </p>
                  <p className="mt-1 text-xl font-semibold">Nature style tank</p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur-md">
                  <Icon name="leaf" size={18} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Category Cards */}
      <section className="relative z-10 mx-auto -mt-1 max-w-7xl px-5 md:-mt-7 md:px-8">
        <div className="grid overflow-hidden rounded-[24px] border border-[#dfe7da] bg-white shadow-[0_20px_60px_rgba(25,58,45,0.09)] md:grid-cols-3">
          {quickCategories.map((cat, index) => (
            <button
              key={cat.nav}
              onClick={() => onNavigate(cat.nav)}
              className={`group flex items-center gap-4 p-5 text-left transition-colors hover:bg-[#f4f8ed] ${
                index !== quickCategories.length - 1
                  ? 'border-b border-[#e3e9df] md:border-b-0 md:border-r'
                  : ''
              }`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e8f4d8] text-[#2e6a50] transition-transform group-hover:-rotate-3">
                <Icon name={cat.icon} size={23} />
              </span>
              <span className="flex-1">
                <strong className="block text-[15px]">{cat.label}</strong>
                <span className="mt-0.5 block text-xs text-[#71847b]">
                  {cat.nav === 'wishlist' ? `${wishlistCount} tersimpan` : cat.subtitle}
                </span>
              </span>
              <span className="text-[#9bac9e] transition-transform group-hover:translate-x-1">
                <Icon name="chevron" size={18} />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Highlight picks — Menampilkan 1 Card Tanaman dan 1 Card Biota yang berubah otomatis setiap 2 detik */}
      <section className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 md:px-8 md:py-20">
        <div className="mb-7">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4b8268]">
            Katalog Berjalan
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Pilihan Terbaik
          </h2>
          <p className="mt-2 text-sm text-[#70827a]">
            Jelajahi keanekaragaman flora dan fauna air yang diperbarui secara dinamis setiap 2 detik.
          </p>
        </div>

        {/* 2 Card: 1 Tanaman dan 1 Biota */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Card Tanaman */}
          <article
            className="catalog-card group cursor-pointer overflow-hidden rounded-[24px] border border-[#dfe6dc] bg-white transition-all duration-300"
            onClick={() => onNavigate('tanaman')}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#dce8dc]">
              <img
                key={currentPlant.id || currentPlant.name}
                src={currentPlant.image_url || currentPlant.image || 'https://images.unsplash.com/photo-1654621883904-e84d8c2bc2b4?auto=format&fit=crop&w=900&q=85'}
                alt={currentPlant.name}
                className="h-full w-full object-cover transition-opacity duration-500 animate-fadeIn"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'https://images.unsplash.com/photo-1654621883904-e84d8c2bc2b4?auto=format&fit=crop&w=900&q=85'
                }}
              />
              <span className="absolute left-4 top-4 rounded-full bg-[#0d3028]/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
                Tanaman · {currentPlant.type || 'Aquascape'}
              </span>
              <span className="absolute right-4 top-4 rounded-full bg-[#c9f05b] px-2.5 py-1 text-[9px] font-bold text-[#14352b] shadow-sm">
                Berputar 2s
              </span>
            </div>
            <div className="p-5">
              <p className="text-[11px] font-medium italic text-[#809087]">
                {currentPlant.scientific_name || currentPlant.scientific}
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
                {currentPlant.name}
              </h3>
              <button
                className="mt-5 flex w-full items-center justify-between rounded-xl bg-[#f0f5e9] px-4 py-3 text-xs font-bold text-[#315d4b] transition-colors hover:bg-[#e6f0d8]"
              >
                Jelajahi Tanaman
                <Icon name="chevron" size={16} />
              </button>
            </div>
          </article>

          {/* Card Biota */}
          <article
            className="catalog-card group cursor-pointer overflow-hidden rounded-[24px] border border-[#dfe6dc] bg-white transition-all duration-300"
            onClick={() => onNavigate('biota')}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#dce8dc]">
              <img
                key={currentFauna.id || currentFauna.name}
                src={currentFauna.image_url || currentFauna.image || 'https://images.unsplash.com/photo-1782811559994-6c28e26c6307?auto=format&fit=crop&w=900&q=85'}
                alt={currentFauna.name}
                className="h-full w-full object-cover transition-opacity duration-500 animate-fadeIn"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'https://images.unsplash.com/photo-1782811559994-6c28e26c6307?auto=format&fit=crop&w=900&q=85'
                }}
              />
              <span className="absolute left-4 top-4 rounded-full bg-[#0d3028]/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
                Biota · {currentFauna.type || 'Aquarium'}
              </span>
              <span className="absolute right-4 top-4 rounded-full bg-[#c9f05b] px-2.5 py-1 text-[9px] font-bold text-[#14352b] shadow-sm">
                Berputar 2s
              </span>
            </div>
            <div className="p-5">
              <p className="text-[11px] font-medium italic text-[#809087]">
                {currentFauna.scientific_name || currentFauna.scientific}
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
                {currentFauna.name}
              </h3>
              <button
                className="mt-5 flex w-full items-center justify-between rounded-xl bg-[#f0f5e9] px-4 py-3 text-xs font-bold text-[#315d4b] transition-colors hover:bg-[#e6f0d8]"
              >
                Jelajahi Biota
                <Icon name="chevron" size={16} />
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-auto max-w-7xl px-5 pb-8 md:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-[#173f34] px-6 py-10 text-white md:px-12 md:py-12">
          <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full border-[45px] border-[#c9f05b]/10" />
          <div className="relative max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c9f05b]">
              Mulai dari dasar
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
              Tank yang indah dimulai dari ekosistem yang tepat.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
              Pelajari kebutuhan cahaya, CO₂, nutrisi, dan kecocokan biota sebelum membangun aquascape pertamamu.
            </p>
            <button
              onClick={() => onNavigate('tanaman')}
              className="mt-6 rounded-full border border-white/25 px-5 py-2.5 text-xs font-bold transition-colors hover:bg-white hover:text-[#173f34]"
            >
              Mulai Eksplorasi
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
