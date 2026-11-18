import { useState, useEffect } from 'react'
import { Icon } from './Icon'

// Header aplikasi — sticky top bar dengan branding AquascapeHub
export default function Header({ activeTab, onTab, unreadCount = 0, user = null }) {
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    if (checkStandalone) {
      setInstalled(true)
    }

    const handleInstalled = () => setInstalled(true)
    window.addEventListener('appinstalled', handleInstalled)
    return () => window.removeEventListener('appinstalled', handleInstalled)
  }, [])

  const handleInstallClick = async () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt()
      const { outcome } = await window.deferredPrompt.userChoice
      if (outcome === 'accepted') {
        window.deferredPrompt = null
        setInstalled(true)
      }
    } else {
      // Jika browser desktop belum menembakkan event prompt otomatis
      const badgeBtn = document.getElementById('pwa-install-btn')
      if (badgeBtn) {
        badgeBtn.click()
      }
    }
  }

  const navItems = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'tanaman', label: 'Tanaman' },
    { id: 'biota', label: 'Biota' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c2f27]/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Logo & Brand */}
        <button
          className="group flex items-center gap-3"
          onClick={() => onTab('beranda')}
        >
          <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#c9f05b] text-[#14352b] transition-transform group-hover:-rotate-6">
            <Icon name="leaf" size={22} strokeWidth={2.2} />
          </span>
          <span className="text-left">
            <span className="block text-[19px] font-bold leading-none tracking-[-0.03em]">
              Aquascape<span className="text-[#c9f05b]">Hub</span>
            </span>
            <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">
              living underwater
            </span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTab(item.id)}
              className={`text-sm font-semibold transition-colors ${
                activeTab === item.id ? 'text-[#c9f05b]' : 'text-white/65 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Buttons: Tombol Install (DI KIRI) -> Wishlist -> Profil */}
        <div className="hidden items-center gap-3 md:flex">
          {/* 1. Tombol Install App (SELALU MUNCUL DI KIRI WISHLIST) */}
          {!installed && (
            <button
              onClick={handleInstallClick}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#c9f05b] px-4 text-xs font-bold text-[#14352b] shadow-sm transition-transform hover:scale-105 active:scale-95"
              title="Install AquascapeHub sebagai aplikasi desktop"
            >
              <Icon name="download" size={15} strokeWidth={2.4} />
              <span>Install App</span>
            </button>
          )}

          {/* 2. Tombol Wishlist (DI SEBELAH KANAN TOMBOL INSTALL) */}
          <button
            onClick={() => onTab('wishlist')}
            className={`relative flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'wishlist'
                ? 'border-[#c9f05b] bg-[#c9f05b]/10 text-[#c9f05b]'
                : 'border-white/15 text-white/80 hover:bg-white/10 hover:text-white'
            }`}
            title="Buka Wishlist"
          >
            <Icon name="shoppingBag" size={17} />
            <span>Wishlist</span>
            {unreadCount > 0 && (
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[#c9f05b] px-1 text-[9px] font-bold text-[#17352b]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* 3. Tombol Profil */}
          <button
            onClick={() => onTab('profil')}
            className={`relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border transition-colors ${
              activeTab === 'profil'
                ? 'border-[#c9f05b] bg-[#c9f05b]/10 text-[#c9f05b]'
                : 'border-white/15 text-white/80 hover:bg-white/10 hover:text-white'
            }`}
            title={`Buka Profil (${user?.username || 'Pengguna'})`}
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            ) : (
              <Icon name="user" size={19} />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
