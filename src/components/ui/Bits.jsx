import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTenant } from '../../store/TenantContext'

/* ------------------------------------------------------------- amblem */

export function Emblem({ className = 'h-9 w-9', ring = '#C4122F', ink = '#2F3842' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {/* Kurumsal logodaki kırık halka — üstte ve altta yay, yanlarda boşluk */}
      <path
        d="M11.2 20 A24 24 0 0 1 52.8 20"
        fill="none"
        stroke={ink}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M11.2 44 A24 24 0 0 0 52.8 44"
        fill="none"
        stroke={ink}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Logonun kırmızı "7"si */}
      <path d="M21 18 H45 L33 48 H24 L35 25 H21 Z" fill={ring} />
    </svg>
  )
}

/* ---------------------------------------------------------------- logo */

export function Logo({ inverted = false, compact = false }) {
  const { brand } = useTenant()
  const ink = inverted ? '#F6F7F8' : '#2F3842'
  const sub = inverted ? 'rgba(246,247,248,.62)' : '#8E0C21'
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label={`${brand.name} — anasayfa`}>
      <Emblem className="h-10 w-10 shrink-0 transition-transform duration-500 group-hover:rotate-[8deg]" ink={ink} />
      <span className="flex flex-col leading-none">
        <span
          className="font-display text-[1.32rem] font-semibold tracking-tight"
          style={{ color: ink }}
        >
          {brand.shortName}
        </span>
        {!compact && (
          <span
            className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.32em]"
            style={{ color: sub }}
          >
            {brand.badge}
          </span>
        )}
      </span>
    </Link>
  )
}

/* ------------------------------------------------------------ süsleme */

export function Ornament({ className = '', tone = 'crimson', width = 'w-32' }) {
  const c = tone === 'crimson' ? '#C4122F' : tone === 'light' ? 'rgba(246,247,248,.45)' : '#2F3842'
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} aria-hidden="true">
      <span className={`h-px ${width}`} style={{ background: `linear-gradient(to right, transparent, ${c})` }} />
      <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 shrink-0">
        <path d="M12 1 L16 12 L12 23 L8 12 Z" fill={c} />
      </svg>
      <span className={`h-px ${width}`} style={{ background: `linear-gradient(to left, transparent, ${c})` }} />
    </div>
  )
}

/* --------------------------------------------------------------- buton */

const BTN = {
  primary:
    'bg-steel-800 text-snow hover:bg-steel-900 shadow-[0_1px_2px_rgba(35,41,48,.2)] hover:shadow-[0_8px_20px_-8px_rgba(35,41,48,.5)]',
  crimson: 'bg-crimson text-steel-900 hover:bg-crimson-400 shadow-[0_1px_2px_rgba(169,133,28,.25)] hover:shadow-[0_8px_20px_-8px_rgba(169,133,28,.6)]',
  outline: 'border border-steel-800/25 text-steel-800 hover:border-steel-800/60 hover:bg-steel-50',
  ghost: 'text-steel-800 hover:bg-steel-50',
  light: 'bg-snow text-steel-900 hover:bg-white',
  outlineLight: 'border border-snow/30 text-snow hover:border-snow/70 hover:bg-snow/10',
  danger: 'bg-clay text-white hover:bg-[#8B3A33]',
}

const SIZE = {
  sm: 'h-9 px-4 text-[0.8rem]',
  md: 'h-11 px-6 text-[0.86rem]',
  lg: 'h-[3.25rem] px-8 text-[0.9rem]',
}

export function Button({
  as: As = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  return (
    <As
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-45 ${BTN[variant]} ${SIZE[size]} ${className}`}
      {...rest}
    >
      {children}
    </As>
  )
}

/* --------------------------------------------------------------- rozet */

const BADGE = {
  crimson: 'bg-crimson-50 text-crimson-700 ring-crimson/30',
  steel: 'bg-steel-50 text-steel-700 ring-steel-600/25',
  copper: 'bg-[#FBF0E8] text-[#8C4A28] ring-[#B4633A]/25',
  clay: 'bg-[#FBECEA] text-[#8B3A33] ring-[#A8443C]/25',
  good: 'bg-[#EAF6EA] text-[#136B13] ring-[#0CA30C]/25',
  critical: 'bg-[#FBEAEA] text-[#9A2C2C] ring-[#D03B3B]/25',
  neutral: 'bg-silver/60 text-ink-soft ring-line',
}

export function Badge({ tone = 'crimson', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.12em] ring-1 ring-inset ${BADGE[tone] ?? BADGE.neutral} ${className}`}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------ kaydırmada belirme */

export function Reveal({ children, delay = 0, className = '', as: As = 'div' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <As
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(22px)',
        transition: `opacity .75s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .75s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </As>
  )
}

/* --------------------------------------------------------- bölüm başlığı */

export function SectionHead({ eyebrow, title, blurb, align = 'center', tone = 'dark' }) {
  const isCenter = align === 'center'
  return (
    <div className={`${isCenter ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}`}>
      {eyebrow && (
        <p className={`eyebrow ${tone === 'light' ? '!text-crimson-400' : ''}`}>{eyebrow}</p>
      )}
      <h2
        className={`mt-3 text-[2rem] leading-[1.1] sm:text-[2.6rem] ${tone === 'light' ? '!text-snow' : ''}`}
      >
        {title}
      </h2>
      {isCenter && <Ornament className="mt-5" tone={tone === 'light' ? 'light' : 'crimson'} width="w-20" />}
      {blurb && (
        <p
          className={`mt-5 text-[0.95rem] leading-relaxed ${tone === 'light' ? 'text-snow/70' : 'text-muted'}`}
        >
          {blurb}
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- miktar */

export function QtyStepper({ value, onChange, min = 1, max = 99, size = 'md' }) {
  const h = size === 'sm' ? 'h-8' : 'h-10'
  const w = size === 'sm' ? 'w-8' : 'w-10'
  return (
    <div className={`inline-flex items-center rounded-full border border-line bg-white ${h}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${w} ${h} grid place-items-center rounded-l-full text-muted transition hover:text-steel-800 disabled:opacity-30`}
        aria-label="Adedi azalt"
      >
        −
      </button>
      <span className={`min-w-7 text-center text-sm font-semibold tnum text-steel-900`}>{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${w} ${h} grid place-items-center rounded-r-full text-muted transition hover:text-steel-800 disabled:opacity-30`}
        aria-label="Adedi artır"
      >
        +
      </button>
    </div>
  )
}

/* -------------------------------------------------------------- boşluk */

export function Empty({ icon: Icon, title, blurb, action }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-white/50 px-6 py-16 text-center">
      {Icon && (
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-steel-50 text-steel-600">
          <Icon size={22} strokeWidth={1.5} />
        </span>
      )}
      <h3 className="text-xl">{title}</h3>
      {blurb && <p className="mt-2 max-w-sm text-sm text-muted">{blurb}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
