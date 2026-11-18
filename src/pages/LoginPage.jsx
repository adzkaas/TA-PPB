import { useState } from 'react'
import { Icon } from '../components/Icon'
import userService, { DEMO_ACCOUNTS } from '../services/userService'

export default function LoginPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('pengguna')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleQuickLogin = async (account) => {
    setError('')
    setLoading(true)
    try {
      const user = await userService.login(account.email, account.password)
      onLoginSuccess(user)
    } catch (err) {
      setError(err.message || 'Gagal masuk akun')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        if (!username.trim() || !email.trim() || !password.trim()) {
          throw new Error('Semua kolom wajib diisi')
        }
        const user = await userService.register({
          username: username.trim(),
          email: email.trim(),
          password,
          role,
        })
        onLoginSuccess(user)
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error('Email dan password wajib diisi')
        }
        const user = await userService.login(email.trim(), password)
        onLoginSuccess(user)
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat masuk')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#071e18] px-4 py-12 text-white">
      {/* Background radial glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[10%] top-[10%] h-[400px] w-[400px] rounded-full bg-[#c9f05b]/10 blur-[120px]" />
        <div className="absolute -right-[10%] bottom-[10%] h-[400px] w-[400px] rounded-full bg-[#205244]/30 blur-[140px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand Card */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#c9f05b] text-[#0c2f27] shadow-xl shadow-[#c9f05b]/10">
            <Icon name="leaf" size={32} strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Aquascape<span className="text-[#c9f05b]">Hub</span>
          </h1>
          <p className="mt-1 text-xs text-white/60">
            {isRegister ? 'Buat akun baru untuk mulai menjelajah' : 'Silakan masuk untuk melanjutkan'}
          </p>
        </div>

        {/* Demo Fast Login Buttons (Untuk Kemudahan Pengujian TA / Dosen) */}
        {!isRegister && (
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <div className="mb-2.5 flex items-center justify-between text-[11px] font-semibold text-white/70">
              <span>⚡ Akses Cepat Demo Akun:</span>
              <span className="rounded bg-[#c9f05b]/20 px-1.5 py-0.5 text-[9px] text-[#c9f05b]">Praktikum PPB</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin(DEMO_ACCOUNTS[1])}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/10 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-95 disabled:opacity-50"
              >
                <span>🌿</span>
                <span>Role Pengguna</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin(DEMO_ACCOUNTS[0])}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#c9f05b] py-2.5 text-xs font-bold text-[#0c2f27] shadow transition hover:bg-[#d6f578] active:scale-95 disabled:opacity-50"
              >
                <span>🛡️</span>
                <span>Role Admin</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Login / Register Card */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d2a23]/90 p-6 shadow-2xl backdrop-blur-xl">
          {/* Tab Selector */}
          <div className="mb-6 flex rounded-xl bg-[#081b16] p-1">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError('') }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                !isRegister ? 'bg-[#c9f05b] text-[#0c2f27] shadow' : 'text-white/60 hover:text-white'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError('') }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                isRegister ? 'bg-[#c9f05b] text-[#0c2f27] shadow' : 'text-white/60 hover:text-white'
              }`}
            >
              Daftar Baru
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <Icon name="alertCircle" size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Nama Pengguna
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: Budi Aquascaper"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-[#c9f05b] focus:ring-1 focus:ring-[#c9f05b]"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/70">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-[#c9f05b] focus:ring-1 focus:ring-[#c9f05b]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/70">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-[#c9f05b] focus:ring-1 focus:ring-[#c9f05b]"
              />
            </div>

            {isRegister && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Pilih Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('pengguna')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
                      role === 'pengguna'
                        ? 'border-[#c9f05b] bg-[#c9f05b]/20 text-[#c9f05b]'
                        : 'border-white/15 bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <span>🌿 Pengguna</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
                      role === 'admin'
                        ? 'border-[#c9f05b] bg-[#c9f05b]/20 text-[#c9f05b]'
                        : 'border-white/15 bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <span>🛡️ Admin</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c9f05b] py-3 text-sm font-bold text-[#0c2f27] shadow-lg shadow-[#c9f05b]/20 transition hover:bg-[#d4f770] active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Icon name="loader" size={16} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>{isRegister ? 'Daftar Akun Baru' : 'Masuk Sekarang'}</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-[11px] text-white/40">
          AquascapeHub · Tugas Akhir Praktikum PPB 2026
        </p>
      </div>
    </div>
  )
}
