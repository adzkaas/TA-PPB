import { useState, useEffect } from 'react'
import { Icon } from './Icon.jsx'

/**
 * PWABadge — Progressive Web App install prompt banner & offline indicator.
 * Mengikuti arsitektur PWA2_PrakPPB dengan styling tema alam AquascapeHub.
 */
export default function PWABadge() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    if (checkStandalone) {
      setInstalled(true)
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      window.deferredPrompt = e
    }

    const handleAppInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
      window.deferredPrompt = null
    }

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstallClick = async () => {
    const promptEvent = installPrompt || window.deferredPrompt
    if (promptEvent) {
      promptEvent.prompt()
      const { outcome } = await promptEvent.userChoice
      if (outcome === 'accepted') {
        setInstalled(true)
        window.deferredPrompt = null
      }
      setInstallPrompt(null)
    }
  }

  if (dismissed || installed) return null

  // 1. Banner status Offline
  if (isOffline) {
    return (
      <aside
        className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-3.5 shadow-xl md:bottom-6 md:left-auto md:right-6 md:w-auto"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-200/70 text-amber-800">
              📶
            </span>
            <span className="text-xs font-semibold">
              Mode Offline. Data katalog tersimpan tetap dapat diakses.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-full p-1 text-amber-600 hover:bg-amber-200/50"
            aria-label="Tutup notifikasi offline"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      </aside>
    )
  }

  // 2. Banner Install PWA (Floating badge di pojok kanan bawah seperti PWA2)
  return (
    <aside
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-[#dfe6dc] bg-white/95 p-3.5 shadow-[0_16px_36px_rgba(12,47,39,0.14)] backdrop-blur-md transition-all md:bottom-6 md:left-auto md:right-6 md:w-96"
      role="region"
      aria-label="Install App"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0c2f27] text-[#c9f05b] shadow-sm">
            <Icon name="download" size={20} strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-[#17352b]">
              Install <strong className="text-[#2e6a50]">AquascapeHub</strong>
            </span>
            <span className="block truncate text-[10px] text-[#70827a]">
              Akses offline & pengalaman aplikasi penuh.
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            id="pwa-install-btn"
            type="button"
            onClick={handleInstallClick}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#173f34] px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#0c2f27] active:scale-95"
          >
            Install App
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="grid h-7 w-7 place-items-center rounded-full text-[#91a198] transition-colors hover:bg-[#f0f5e9] hover:text-[#17352b]"
            aria-label="Dismiss banner"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
