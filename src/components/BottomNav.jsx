import { Icon } from './Icon.jsx'

// Bottom Navigation Bar — 5 tab sesuai Tugas Akhir PPB
export default function BottomNav({ activeTab, onTabChange, unreadCount = 0 }) {
  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: 'home' },
    { id: 'tanaman', label: 'Tanaman', icon: 'leaf' },
    { id: 'biota', label: 'Biota', icon: 'fish' },
    { id: 'wishlist', label: 'Wishlist', icon: 'shoppingBag' },
    { id: 'profil', label: 'Profil', icon: 'user' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#dfe6dc] bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(24,53,43,0.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[9px] font-bold transition-colors ${
                isActive ? 'text-[#2f6f53]' : 'text-[#91a198]'
              }`}
            >
              {isActive && (
                <span className="absolute -top-2 h-0.5 w-7 rounded-full bg-[#5d8f6e]" />
              )}
              <Icon
                name={item.icon}
                size={20}
                strokeWidth={isActive ? 2.3 : 1.8}
              />
              <span>{item.label}</span>

              {/* Badge notifikasi: hanya muncul jika ada item baru yang belum dibuka tab-nya */}
              {item.id === 'wishlist' && unreadCount > 0 && (
                <span className="absolute right-1 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#c9f05b] px-1 text-[8px] font-bold text-[#17352b] shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
