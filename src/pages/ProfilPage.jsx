import { useState, useEffect, useRef } from 'react'
import { Icon } from '../components/Icon'
import userService from '../services/userService'

export default function ProfilPage({ wishlistCount, user, onUpdateUser, onLogout }) {
  const [username, setUsername] = useState(user?.username || 'Aquascaper')
  const [email, setEmail] = useState(user?.email || 'user@aquascapehub.com')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '')
  const [previewUrl, setPreviewUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user) {
      setUsername(user.username || '')
      setEmail(user.email || '')
      setAvatarUrl(user.avatar_url || '')
    }
  }, [user])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB')
        return
      }
      setSelectedFile(file)
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
      setError('')
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!username.trim() || !email.trim()) {
        throw new Error('Nama pengguna dan email tidak boleh kosong')
      }

      let updatedUserData = {
        username: username.trim(),
        email: email.trim(),
      }

      // 1. Jika ada file foto yang dipilih, upload ke Supabase Storage Bucket 'avatars'
      if (selectedFile) {
        const uploadResult = await userService.uploadAvatar(user?.id || 'demo-user', selectedFile)
        if (uploadResult?.avatar_url) {
          updatedUserData.avatar_url = uploadResult.avatar_url
          setAvatarUrl(uploadResult.avatar_url)
        }
      }

      // 2. Update data username dan email
      const updated = await userService.updateProfile(user?.id || 'demo-user', updatedUserData)

      if (onUpdateUser) {
        onUpdateUser(updated)
      }

      setSelectedFile(null)
      setPreviewUrl('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Gagal menyimpan profil')
    } finally {
      setLoading(false)
    }
  }

  const currentDisplayAvatar =
    previewUrl ||
    avatarUrl ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'

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
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Foto Profil dengan Tombol Ganti Foto Langsung */}
            <div className="relative group">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-[#c9f05b] bg-[#14352b] shadow-md">
                <img
                  src={currentDisplayAvatar}
                  alt={username}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
                  }}
                />
              </div>

              {/* Tombol Upload Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                title="Ganti Foto Profil"
              >
                <Icon name="download" size={16} />
                <span className="mt-1 text-[9px] font-bold">Ganti Foto</span>
              </button>
            </div>

            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold">{user?.username || username}</h2>
              <p className="mt-1 text-xs text-white/70">{user?.email || email}</p>

              {/* Tombol Pilih Foto untuk Mobile / Kenyamanan User */}
              <div className="mt-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#c9f05b] px-3.5 py-1.5 text-xs font-bold text-[#0c2f27] shadow transition hover:bg-[#d7f775] active:scale-95"
                >
                  <Icon name="download" size={14} />
                  <span>Upload Foto Profil</span>
                </button>
                {selectedFile && (
                  <span className="ml-2 text-[11px] text-[#c9f05b]">
                    ✓ {selectedFile.name.slice(0, 18)}...
                  </span>
                )}
              </div>
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
            <div className="text-2xl font-bold text-[#17352b]">🌿</div>
            <div className="mt-1 text-xs text-[#70827a]">Aquascaper</div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="rounded-[24px] border border-[#dfe6dc] bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-sm font-bold text-[#315d4b]">
          Edit Data Profil
        </h3>

        {/* Username */}
        <div className="mb-4">
          <label htmlFor="prof-name" className="mb-1.5 block text-xs font-semibold text-[#315d4b]">
            Nama Pengguna / Lengkap
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
        <div className="mb-6">
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#173f34] text-sm font-bold text-white hover:bg-[#1f5040] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Icon name="loader" size={16} className="animate-spin" />
              <span>Menyimpan ke Supabase...</span>
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
