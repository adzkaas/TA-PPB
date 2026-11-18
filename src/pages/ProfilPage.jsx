import { useState, useEffect, useRef } from 'react'
import { Icon } from '../components/Icon'
import userService from '../services/userService'

export default function ProfilPage({ wishlistCount, user, onUpdateUser, onLogout }) {
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(user?.username || 'Aquascaper')
  const [email, setEmail] = useState(user?.email || 'user@aquascapehub.com')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '')
  
  // State saat dalam mode edit
  const [editUsername, setEditUsername] = useState(user?.username || 'Aquascaper')
  const [editEmail, setEditEmail] = useState(user?.email || 'user@aquascapehub.com')
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
      setEditUsername(user.username || '')
      setEditEmail(user.email || '')
    }
  }, [user])

  const handleStartEditing = () => {
    setEditUsername(username)
    setEditEmail(email)
    setSelectedFile(null)
    setPreviewUrl('')
    setError('')
    setIsEditing(true)
  }

  const handleCancelEditing = () => {
    setEditUsername(username)
    setEditEmail(email)
    setSelectedFile(null)
    setPreviewUrl('')
    setError('')
    setIsEditing(false)
  }

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
      if (!editUsername.trim() || !editEmail.trim()) {
        throw new Error('Nama pengguna dan email tidak boleh kosong')
      }

      let updatedUserData = {
        username: editUsername.trim(),
        email: editEmail.trim(),
      }

      // 1. Jika ada file foto baru yang dipilih, upload ke Supabase Storage Bucket 'avatars'
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

      setUsername(updated.username || editUsername.trim())
      setEmail(updated.email || editEmail.trim())
      if (updated.avatar_url) {
        setAvatarUrl(updated.avatar_url)
      }

      setSelectedFile(null)
      setPreviewUrl('')
      setIsEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Gagal menyimpan profil')
    } finally {
      setLoading(false)
    }
  }

  const currentDisplayAvatar =
    (isEditing && previewUrl) ||
    avatarUrl ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 pb-28 md:px-8">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />

      {/* Header Halaman */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4b8268]">
            Akun Saya
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em]">Profil</h1>
        </div>

        {/* Action Header: Tombol Edit (jika tidak sedang edit) & Tombol Keluar */}
        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              onClick={handleStartEditing}
              className="flex items-center gap-1.5 rounded-full border border-[#0c2f27] bg-[#0c2f27] px-4 py-2 text-xs font-bold text-[#c9f05b] shadow-sm transition hover:bg-[#15463b] active:scale-95"
              title="Edit Data & Foto Profil"
            >
              <Icon name="edit" size={14} />
              <span>Edit Profil</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
            title="Keluar dari akun"
          >
            <Icon name="logOut" size={14} />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {saved && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm animate-fade-in">
          <Icon name="check" size={18} />
          Profil berhasil diperbarui dan disimpan!
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm animate-fade-in">
          <Icon name="alertCircle" size={18} />
          {error}
        </div>
      )}

      {/* Profile Card Banner */}
      <div className="mb-6 overflow-hidden rounded-[28px] border border-[#dfe6dc] bg-white shadow-sm">
        <div className="bg-[#0c2f27] p-7 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Lingkaran Foto Profil + Ikon Edit di Samping Lingkaran */}
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-full border-3 border-[#c9f05b] bg-[#14352b] shadow-lg">
                <img
                  src={currentDisplayAvatar}
                  alt={username}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
                  }}
                />
              </div>

              {/* Ikon Edit Foto di samping lingkaran foto profil (HANYA muncul saat mode edit aktif) */}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-[#c9f05b] text-[#0c2f27] shadow-lg ring-2 ring-[#0c2f27] transition hover:scale-110 active:scale-95"
                  title="Pilih foto profil baru"
                >
                  <Icon name="edit" size={15} />
                </button>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold tracking-tight">{username}</h2>
              <p className="mt-1 text-xs text-white/70">{email}</p>
              {isEditing && selectedFile && (
                <p className="mt-2 inline-block rounded-full bg-[#c9f05b]/20 px-3 py-1 text-[11px] font-bold text-[#c9f05b]">
                  ✓ Foto baru siap diupload
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 divide-x divide-[#e7ece4] border-t border-[#e7ece4]">
          <div className="p-5 text-center">
            <div className="text-2xl font-bold text-[#17352b]">{wishlistCount}</div>
            <div className="mt-1 text-xs text-[#70827a]">Item di Wishlist</div>
          </div>
          <div className="p-5 text-center">
            <div className="text-2xl font-bold text-[#17352b]">🌿</div>
            <div className="mt-1 text-xs text-[#70827a]">Aquascaper Hub</div>
          </div>
        </div>
      </div>

      {/* Tampilan Data Profil (Jika tidak sedang edit) */}
      {!isEditing ? (
        <div className="rounded-[28px] border border-[#dfe6dc] bg-white p-6 shadow-sm">
          <div className="mb-4 border-b border-[#e7ece4] pb-3">
            <h3 className="text-sm font-bold text-[#315d4b]">Informasi Akun</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="block font-semibold text-[#70827a]">Nama Pengguna</span>
              <span className="mt-1 block text-sm font-bold text-[#17352b]">{username}</span>
            </div>
            <div>
              <span className="block font-semibold text-[#70827a]">Alamat Email</span>
              <span className="mt-1 block text-sm font-bold text-[#17352b]">{email}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Form Edit Data Profil (Muncul saat tombol Edit diklik) */
        <form onSubmit={handleSave} className="rounded-[28px] border border-[#dfe6dc] bg-white p-6 shadow-sm animate-fade-in">
          <div className="mb-5 border-b border-[#e7ece4] pb-3">
            <h3 className="text-sm font-bold text-[#0c2f27]">Edit Data Profil</h3>
          </div>

          {/* Username Input */}
          <div className="mb-4">
            <label htmlFor="edit-name" className="mb-1.5 block text-xs font-semibold text-[#315d4b]">
              Nama Pengguna / Lengkap
            </label>
            <input
              id="edit-name"
              type="text"
              required
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              placeholder="Nama pengguna kamu"
              className="w-full rounded-xl border border-[#d9e2d6] bg-[#f8faf6] px-4 py-2.5 text-sm text-[#17352b] outline-none focus:border-[#2f6f53] focus:ring-2 focus:ring-[#2f6f53]/10"
            />
          </div>

          {/* Email Input */}
          <div className="mb-6">
            <label htmlFor="edit-email" className="mb-1.5 block text-xs font-semibold text-[#315d4b]">
              Alamat Email
            </label>
            <input
              id="edit-email"
              type="email"
              required
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full rounded-xl border border-[#d9e2d6] bg-[#f8faf6] px-4 py-2.5 text-sm text-[#17352b] outline-none focus:border-[#2f6f53] focus:ring-2 focus:ring-[#2f6f53]/10"
            />
          </div>

          {/* Tombol Aksi: Batal & Simpan */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancelEditing}
              disabled={loading}
              className="flex-1 rounded-full border border-gray-300 py-3 text-xs font-bold text-gray-700 transition hover:bg-gray-100 active:scale-95 disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0c2f27] py-3 text-xs font-bold text-[#c9f05b] shadow-md transition hover:bg-[#15463b] active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Icon name="loader" size={15} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Icon name="check" size={15} />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
