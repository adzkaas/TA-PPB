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
import LoginPage from './pages/LoginPage'
import { useWishlist } from './hooks/useWishlist'
import userService from './services/userService'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [currentUser, setCurrentUser] = useState(() => userService.getCurrentUser())
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
    // Jika tab 'wishlist' dibuka, bersihkan notifikasi unread
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
      if (activeTab !== 'wishlist') {
        setUnreadCount((prev) => prev + 1)
      }
    }
  }

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    userService.logout()
    setCurrentUser(null)
    setActiveTab('beranda')
  }

  const handleUpdateUser = (updated) => {
    setCurrentUser(updated)
  }

  // 1. Splash Screen ditampilkan pertama kali
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  // 2. Halaman Login ditampilkan setelah splash screen jika belum login
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  // 3. Aplikasi Utama
  return (
    <div className="min-h-screen bg-[#f3f6ef]">
      {/* Header (sticky top) */}
      <Header
        activeTab={activeTab}
        onTab={handleTabChange}
        unreadCount={unreadCount}
        user={currentUser}
      />

      {/* Main Content */}
      <main>
        {activeTab === 'beranda' && (
          <BerandaPage
            onNavigate={handleTabChange}
            wishlistCount={wishlist.length}
            user={currentUser}
          />
        )}
        {activeTab === 'tanaman' && (
          <TanamanPage
            wishlist={wishlist}
            onWishlistToggle={handleWishlistToggle}
            user={currentUser}
          />
        )}
        {activeTab === 'biota' && (
          <BiotaPage
            wishlist={wishlist}
            onWishlistToggle={handleWishlistToggle}
            user={currentUser}
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
          <ProfilPage
            wishlistCount={wishlist.length}
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        unreadCount={unreadCount}
      />

      {/* PWA install prompt banner */}
      <PWABadge />
    </div>
  )
}

export default App
