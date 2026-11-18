import { useState } from 'react'
import { Icon } from '../components/Icon'

// Halaman Profil — informasi about aplikasi dan profil pengguna
// Sesuai persyaratan TA: 1 halaman Profile/About
const PROFILE_KEY = 'aquascapehub_profile'

function getProfile() {
  try {
    const data = localStorage.getItem(PROFILE_KEY)
    return data
      ? JSON.parse(data)
      : { username: 'Aquascaper', bio: '', userId: 'AQH-' + Math.random().toString(36).slice(2, 8).toUpperCase() }
  } catch {
    return { username: 'Aquascaper', bio: '', userId: 'AQH-' + Math.random().toString(36).slice(2, 8).toUpperCase() }
  }
}

export default function ProfilPage({ wishlistCount }) {
  const [profile, setProfile] = useState(() => {
    const p = getProfile()
    if (!localStorage.getItem(PROFILE_KEY)) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
    }
    return p
  })
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio || '')
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    const updated = { ...profile, username: username.trim() || 'Aquascaper', bio: bio.trim() }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated))
    setProfile(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 pb-28 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4b8268]">
          Akun Saya
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">Profil</h1>
      </div>

      {/* Feedback toast */}
      {saved && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700">
          <Icon name="check" size={18} />
          Profil berhasil disimpan.
        </div>
      )}

      {/* Profile card */}
      <div className="mb-6 overflow-hidden rounded-[24px] border border-[#dfe6dc] bg-white">
        <div className="bg-[#0c2f27] p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#c9f05b] text-[#14352b]">
              <Icon name="user" size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile.username}</h2>
              <p className="text-xs text-white/50">ID: {profile.userId}</p>
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

      {/* Edit form */}
      <form onSubmit={handleSave} className="mb-6 rounded-[24px] border border-[#dfe6dc] bg-white p-6">
        <h3 className="mb-5 text-sm font-bold text-[#315d4b]">Edit Profil</h3>

        <div className="mb-4">
          <label htmlFor="prof-name" className="mb-2 block text-xs font-semibold text-[#315d4b]">
            Nama / Alias
          </label>
          <input
            id="prof-name"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nama aquascaper kamu"
            className="w-full rounded-xl border border-[#d9e2d6] bg-[#f8faf6] px-4 py-3 text-sm text-[#17352b] outline-none focus:border-[#2f6f53] focus:ring-2 focus:ring-[#2f6f53]/10"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="prof-bio" className="mb-2 block text-xs font-semibold text-[#315d4b]">
            Bio / Catatan
          </label>
          <textarea
            id="prof-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Ceritakan tentang aquascape kamu..."
            rows={3}
            className="w-full rounded-xl border border-[#d9e2d6] bg-[#f8faf6] px-4 py-3 text-sm text-[#17352b] outline-none focus:border-[#2f6f53] focus:ring-2 focus:ring-[#2f6f53]/10 resize-none"
          />
        </div>

        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#173f34] text-sm font-bold text-white hover:bg-[#1f5040] transition-colors"
        >
          <Icon name="check" size={16} />
          Simpan Profil
        </button>
      </form>

      {/* About App card */}
      <div className="rounded-[24px] border border-[#dfe6dc] bg-white overflow-hidden">
        <div className="border-b border-[#e7ece4] p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#c9f05b] text-[#14352b]">
              <Icon name="leaf" size={22} strokeWidth={2.2} />
            </span>
            <div>
              <h3 className="text-lg font-bold tracking-[-0.02em]">
                Aquascape<span className="text-[#2f6f53]">Hub</span>
              </h3>
              <p className="text-xs text-[#70827a]">Versi 1.0.0</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm leading-6 text-[#587066]">
            <strong>AquascapeHub</strong> adalah katalog digital untuk tanaman air dan biota akuarium hias. 
            Aplikasi ini membantu para aquascaper menemukan, mempelajari, dan merencanakan ekosistem 
            aquarium yang sehat, indah, dan seimbang.
          </p>
          <div className="mt-5 space-y-3">
            {[
              { label: 'Mata Kuliah', value: 'Pemrograman Berbasis Blok (PPB)' },
              { label: 'Kelompok', value: 'Kelompok 15 — Shift 03' },
              { label: 'Teknologi', value: 'React + Vite + Tailwind CSS v4' },
              { label: 'Backend', value: 'Node.js + Express + Supabase' },
              { label: 'Fitur PWA', value: 'Offline Cache & Installable' },
            ].map((info) => (
              <div key={info.label} className="flex justify-between text-sm">
                <span className="text-[#94a198]">{info.label}</span>
                <span className="font-semibold text-[#17352b]">{info.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
