import { useState, useEffect } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import SplashScreen from './components/common/SplashScreen'
import PWABadge from './components/PWABadge'
import BerandaPage from './pages/BerandaPage'
import TanamanPage from './pages/TanamanPage'
import BiotaPage from './pages/BiotaPage'
import WishlistPage from './pages/WishlistPage'
import ProfilPage from './pages/ProfilPage'
import { useWishlist } from './hooks/useWishlist'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [activeTab, setActiveTab] = useState('beranda')
  const [unreadCount, setUnreadCount] = useState(0)
  const { wishlist, addItem, removeItem, refresh } = useWishlist()

  // Listener untuk menangkap event sebelum instalasi PWA di level global
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      window.deferredPrompt = e
      window.dispatchEvent(new Event('pwa-prompt-ready'))
    }

    const handleAppInstalled = () => {
      window.deferredPrompt = null
      window.dispatchEvent(new Event('pwa-installed'))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Navigasi tab — dipakai dari BottomNav, Header, dan halaman internal
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    // Jika tab 'wishlist' (Tank Saya) dibuka, bersihkan notifikasi unread!
    if (tab === 'wishlist') {
      setUnreadCount(0)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Toggle wishlist — tersambung ke API database Supabase tabel 'wishlist'
  const handleWishlistToggle = async (item, itemType) => {
    const itemId = String(item.id)
    const inWishlist = wishlist.some(
      (w) => String(w.item_id) === itemId && w.item_type === itemType,
    )

    if (inWishlist) {
      const existing = wishlist.find(
        (w) => String(w.item_id) === itemId && w.item_type === itemType,
      )
      await removeItem(existing?.id, itemId)
    } else {
      await addItem({
        item_id: itemId,
        item_type: itemType,
        item_name: item.name,
        item_image: item.image_url || '',
        item_data: item,
      })
      // Tambahkan notifikasi jika pengguna saat ini TIDAK sedang berada di tab Tank Saya
      if (activeTab !== 'wishlist') {
        setUnreadCount((prev) => prev + 1)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f6ef]">
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* Header (sticky top) dengan tombol Install di sebelah kiri Tank Saya */}
      <Header
        activeTab={activeTab}
        onTab={handleTabChange}
        unreadCount={unreadCount}
      />

      {/* Main Content */}
      <main>
        {activeTab === 'beranda' && (
          <BerandaPage
            onNavigate={handleTabChange}
            wishlistCount={wishlist.length}
          />
        )}
        {activeTab === 'tanaman' && (
          <TanamanPage
            wishlist={wishlist}
            onWishlistToggle={handleWishlistToggle}
          />
        )}
        {activeTab === 'biota' && (
          <BiotaPage
            wishlist={wishlist}
            onWishlistToggle={handleWishlistToggle}
          />
        )}
        {activeTab === 'wishlist' && (
          <WishlistPage
            wishlist={wishlist}
            onWishlistToggle={handleWishlistToggle}
            onNavigateTanaman={() => handleTabChange('tanaman')}
            onNavigateBiota={() => handleTabChange('biota')}
          />
        )}
        {activeTab === 'profil' && (
          <ProfilPage wishlistCount={wishlist.length} />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        unreadCount={unreadCount}
      />

      {/* PWA install prompt banner (seperti di PWA2) */}
      <PWABadge />
    </div>
  )
}

export default App
