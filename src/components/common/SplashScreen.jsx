import { useState, useEffect, useCallback, useRef } from 'react'
import { Icon } from '../Icon'

// SplashScreen untuk AquascapeHub — mengikuti pola dari PWA2_PrakPPB
export default function SplashScreen({ onFinish, duration = 4000 }) {
  const [isFading, setIsFading] = useState(false)
  const dismissedRef = useRef(false)

  const handleDismiss = useCallback(() => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    setIsFading(true)
    setTimeout(() => {
      if (onFinish) onFinish()
    }, 600)
  }, [onFinish])

  useEffect(() => {
    const timer = setTimeout(handleDismiss, duration)

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleDismiss()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [duration, handleDismiss])

  return (
    <main
      className={`splash-overlay ${isFading ? 'splash-overlay--fading' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="AquascapeHub Intro"
    >
      {/* Logo */}
      <div className="splash-logo">
        <Icon name="leaf" size={48} strokeWidth={2} />
      </div>

      {/* Brand */}
      <section style={{ textAlign: 'center' }}>
        <div className="splash-brand-name">
          Aquascape<span style={{ color: '#c9f05b' }}>Hub</span>
        </div>
        <div className="splash-brand-sub">Katalog Tanaman Air & Biota Hias</div>
      </section>

      {/* Tagline */}
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', maxWidth: '240px', textAlign: 'center', lineHeight: 1.6 }}>
        Temukan tanaman air dan biota yang tepat untuk aquascape impianmu.
      </p>

      {/* Skip button */}
      <button
        type="button"
        className="splash-skip-btn"
        onClick={(e) => {
          e.stopPropagation()
          handleDismiss()
        }}
        aria-label="Masuk ke aplikasi"
      >
        <span>Mulai Jelajahi</span>
        <Icon name="chevron" size={14} />
      </button>
    </main>
  )
}
