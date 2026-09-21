import { useEffect, useState } from 'react'

/**
 * Kafe modülünün ortak küçük parçaları.
 * Menüde fotoğraf yerine kategoriye göre çizilmiş sade simgeler kullanılır —
 * gerçek fotoğraflar geldiğinde CafeGlyph yerine <img> konur.
 */

const CAT_TONE = {
  'turk-kahvesi': { bg: '#EAE4DC', fg: '#7A5236' },
  'espresso-bar': { bg: '#E7EAEE', fg: '#3E4954' },
  'soguk-kahve': { bg: '#E4EBF3', fg: '#2F5C8A' },
  'cay-bitki': { bg: '#E6EFE9', fg: '#2F6B4B' },
  'serbet-soguk': { bg: '#F6E7E3', fg: '#A0503A' },
  tatli: { bg: '#F6E6EA', fg: '#8B3A50' },
  kahvalti: { bg: '#F7EFDC', fg: '#8A6100' },
}

export const catTone = (cat) => CAT_TONE[cat] ?? { bg: '#E9ECEF', fg: '#4E5A67' }

/* --------------------------------------------------------- simgeler */

function Icon({ cat, size = 20, color }) {
  const s = { width: size, height: size, fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (cat) {
    case 'turk-kahvesi': // cezve
      return (
        <svg viewBox="0 0 24 24" {...s}>
          <path d="M5 8h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" />
          <path d="M16 10h4.5" />
          <path d="M5 8 3 6.5" />
        </svg>
      )
    case 'espresso-bar': // fincan
      return (
        <svg viewBox="0 0 24 24" {...s}>
          <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
          <path d="M17 10a3 3 0 0 1 0 6" />
          <path d="M8 4.5v1.5M12 3.5v2.5" />
        </svg>
      )
    case 'soguk-kahve': // buzlu bardak
      return (
        <svg viewBox="0 0 24 24" {...s}>
          <path d="M6 6h12l-1.5 13a2 2 0 0 1-2 1.8h-5A2 2 0 0 1 7.5 19z" />
          <path d="M7 11h10" />
          <path d="M12 3v3" />
        </svg>
      )
    case 'cay-bitki': // ince belli bardak
      return (
        <svg viewBox="0 0 24 24" {...s}>
          <path d="M8 3h8l-1 7 2 4-2 7H9l-2-7 2-4z" />
          <path d="M7.5 14h9" />
        </svg>
      )
    case 'serbet-soguk': // şişe
      return (
        <svg viewBox="0 0 24 24" {...s}>
          <path d="M10 2h4v4l2.5 3.5A4 4 0 0 1 17 12v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-7a4 4 0 0 1 .5-2.5L10 6z" />
          <path d="M7 14h10" />
        </svg>
      )
    case 'tatli': // dilim
      return (
        <svg viewBox="0 0 24 24" {...s}>
          <path d="M4 10h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
          <path d="M4 10 12 4l8 6" />
          <path d="M4 14h16" />
        </svg>
      )
    case 'kahvalti': // tabak
      return (
        <svg viewBox="0 0 24 24" {...s}>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" {...s}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      )
  }
}

export function CafeGlyph({ cat, size = 44, className = '' }) {
  const tone = catTone(cat)
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl ${className}`}
      style={{ width: size, height: size, background: tone.bg }}
      aria-hidden="true"
    >
      <Icon cat={cat} size={size * 0.46} color={tone.fg} />
    </span>
  )
}

/* ------------------------------------------------------ süre sayacı */

/** Bir zamandan bu yana geçen dakikayı canlı sayar (sipariş ve masa süreleri için) */
export function useElapsed(fromIso, tickMs = 15000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), tickMs)
    return () => clearInterval(t)
  }, [tickMs])
  if (!fromIso) return 0
  return Math.max(0, Math.floor((now - new Date(fromIso).getTime()) / 60000))
}

export function Elapsed({ from, className = '' }) {
  const dk = useElapsed(from)
  return <span className={`tnum ${className}`}>{dk} dk</span>
}

/* -------------------------------------------------------- alt sayfa */

/** Telefonda aşağıdan, tablette ortadan açılan panel */
export function Sheet({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="animate-scrim absolute inset-0 bg-steel-950/50" onClick={onClose} />
      <div className="animate-rise relative flex max-h-[88vh] w-full flex-col rounded-t-3xl bg-snow shadow-2xl sm:max-w-lg sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="text-[1.15rem] leading-tight">{title}</h2>
          <button
            onClick={onClose}
            className="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-silver/60 hover:text-steel-800"
            aria-label="Kapat"
          >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-line bg-white px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}
