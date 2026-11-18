import { useState, useEffect } from 'react'
import { Icon } from '../components/Icon'
import userService from '../services/userService'

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
]

export default function ProfilPage({ wishlistCount, user, onUpdateUser, onLogout }) {
  const [username, setUsername] = useState(user?.username || 'Aquascaper')
  const [email, setEmail] = useState(user?.email || 'user@aquascapehub.com')
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
  )
  const [bio, setBio] = useState(user?.bio || '')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setUsername(user.username || '')
      setEmail(user.email || '')
      setAvatarUrl(user.avatar_url || '')
      setBio(user.bio || '')
    }
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!username.trim() || !email.trim()) {
        throw new Error('Nama pengguna dan email tidak boleh kosong')
      }

      const updated = await userService.updateProfile(user?.id || 'demo-user', {
        username: username.trim(),
        email: email.trim(),
        avatar_url: avatarUrl.trim(),
        bio: bio.trim(),
      })

      if (onUpdateUser) {
        onUpdateUser(updated)
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message || 'Gagal menyimpan profil')
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 pb-28 md:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4b8268]">
            Akun Saya
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em]">Profil</h1>
        </div>

        {/* Tombol Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
          title="Keluar dari akun"
        >
          <Icon name="logOut" size={15} />
          <span>Keluar</span>
        </button>
      </div>

      {/* Feedback toast */}
      {saved && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700">
          <Icon name="check" size={18} />
          Profil berhasil diperbarui dan disimpan!
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700">
          <Icon name="alertCircle" size={18} />
          {error}
        </div>
      )}

      {/* Profile Card Summary */}
      <div className="mb-6 overflow-hidden rounded-[24px] border border-[#dfe6dc] bg-white shadow-sm">
        <div className="bg-[#0c2f27] p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="relative h-18 w-18 overflow-hidden rounded-2xl border-2 border-[#c9f05b] bg-[#14352b]">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                alt={username}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{user?.username || username}</h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    isAdmin
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-[#c9f05b] text-[#0c2f27]'
                  }`}
                >
                  {isAdmin ? '🛡️ Admin' : '🌿 Pengguna'}
                </span>
              </div>
              <p className="mt-1 text-xs text-white/70">{user?.email || email}</p>
              <p className="mt-0.5 text-[11px] text-white/40">ID: {user?.id || 'AQH-USER'}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 divide-x divide-[#e7ece4] border-t border-[#e7ece4]">
          <div className="p-5 text-center">
            <div className="text-2xl font-bold text-[#17352b]">{wishlistCount}</div>
            <div className="mt-1 text-xs text-[#70827a]">Item di Wishlist</div>
          </div>
          <div className="p-5 text-center">
            <div className="text-2xl font-bold text-[#17352b]">
              {isAdmin ? '🛡️ Full Akses' : '🌿 Penjelajah'}
            </div>
            <div className="mt-1 text-xs text-[#70827a]">
              {isAdmin ? 'Edit & Hapus Item Aktif' : 'Koleksi & Wishlist'}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="rounded-[24px] border border-[#dfe6dc] bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-sm font-bold text-[#315d4b]">
          Edit Username, Foto & Email
        </h3>

        {/* Username */}
        <div className="mb-4">
          <label htmlFor="prof-name" className="mb-1.5 block text-xs font-semibold text-[#315d4b]">
            Username / Nama Lengkap
          </label>
          <input
            id="prof-name"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nama pengguna kamu"
            className="w-full rounded-xl border border-[#d9e2d6] bg-[#f8faf6] px-4 py-2.5 text-sm text-[#17352b] outline-none focus:border-[#2f6f53] focus:ring-2 focus:ring-[#2f6f53]/10"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="prof-email" className="mb-1.5 block text-xs font-semibold text-[#315d4b]">
            Alamat Email
          </label>
          <input
            id="prof-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="w-full rounded-xl border border-[#d9e2d6] bg-[#f8faf6] px-4 py-2.5 text-sm text-[#17352b] outline-none focus:border-[#2f6f53] focus:ring-2 focus:ring-[#2f6f53]/10"
          />
        </div>

        {/* Avatar URL */}
        <div className="mb-4">
          <label htmlFor="prof-avatar" className="mb-1.5 block text-xs font-semibold text-[#315d4b]">
            URL Foto Profil / Avatar
          </label>
          <input
            id="prof-avatar"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-[#d9e2d6] bg-[#f8faf6] px-4 py-2.5 text-sm text-[#17352b] outline-none focus:border-[#2f6f53] focus:ring-2 focus:ring-[#2f6f53]/10"
          />

          {/* Preset Avatar Picker */}
          <div className="mt-3">
            <span className="block text-[11px] font-medium text-[#70827a] mb-2">
              Atau pilih avatar cepat:
            </span>
            <div className="flex items-center gap-2">
              {AVATAR_PRESETS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setAvatarUrl(p)}
                  className={`h-10 w-10 overflow-hidden rounded-full border-2 transition-transform hover:scale-110 ${
                    avatarUrl === p ? 'border-[#0c2f27] ring-2 ring-[#c9f05b]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p} alt={`Avatar ${idx}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label htmlFor="prof-bio" className="mb-1.5 block text-xs font-semibold text-[#315d4b]">
            Bio / Catatan Aquascape
          </label>
          <textarea
            id="prof-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Ceritakan tentang aquascape atau tank favoritmu..."
            rows={2}
            className="w-full rounded-xl border border-[#d9e2d6] bg-[#f8faf6] px-4 py-2.5 text-sm text-[#17352b] outline-none focus:border-[#2f6f53] focus:ring-2 focus:ring-[#2f6f53]/10 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#173f34] text-sm font-bold text-white hover:bg-[#1f5040] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Icon name="loader" size={16} className="animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Icon name="check" size={16} />
              <span>Simpan Profil</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
