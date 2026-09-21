import { useId, useMemo } from 'react'
import QRCode from 'qrcode'

/**
 * Markaya uygun, stilize karekod.
 *
 * Hazır kütüphane çıktısı yerine modül matrisini kendimiz çiziyoruz: yuvarlak
 * noktalar, özel köşe göstergeleri (finder pattern) ve ortada marka mührü.
 * Hata düzeltme seviyesi H (%30) seçildiği için ortadaki mühür okumayı bozmaz.
 */

export const QR_THEMES = {
  celik: {
    id: 'celik',
    name: 'Çelik',
    bg: '#F6F7F8',
    fg: '#2F3842',
    accent: '#C4122F',
    emblemBg: '#2F3842',
    emblemFg: '#F6F7F8',
  },
  gece: {
    id: 'gece',
    name: 'Gece',
    bg: '#232930',
    fg: '#DCE1E6',
    accent: '#EA8390',
    emblemBg: '#C4122F',
    emblemFg: '#F6F7F8',
  },
  kirmizi: {
    id: 'kirmizi',
    name: 'Kırmızı',
    bg: '#FCEDF0',
    fg: '#8E0C21',
    accent: '#C4122F',
    emblemBg: '#C4122F',
    emblemFg: '#FCEDF0',
  },
  murekkep: {
    id: 'murekkep',
    name: 'Mürekkep',
    bg: '#FFFFFF',
    fg: '#191D21',
    accent: '#C4122F',
    emblemBg: '#191D21',
    emblemFg: '#FFFFFF',
  },

}

export const QR_STYLES = [
  { id: 'nokta', name: 'Nokta' },
  { id: 'yuvarlak', name: 'Yuvarlak' },
  { id: 'klasik', name: 'Klasik' },
]

/** Köşe göstergelerinin kapladığı 7×7 alanlar */
function isFinder(row, col, size) {
  return (
    (row < 7 && col < 7) ||
    (row < 7 && col >= size - 7) ||
    (row >= size - 7 && col < 7)
  )
}

/** Ortadaki mühür için boşaltılacak alan */
function isEmblemZone(row, col, size, span) {
  const from = Math.floor((size - span) / 2)
  const to = from + span
  return row >= from && row < to && col >= from && col < to
}

function Finder({ x, y, unit, fg, accent, shape }) {
  const s = unit * 7
  const outerR = shape === 'klasik' ? 0 : unit * 1.9
  const innerR = shape === 'klasik' ? 0 : unit * 0.95
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={0}
        y={0}
        width={s}
        height={s}
        rx={outerR}
        fill="none"
        stroke={fg}
        strokeWidth={unit}
      />
      <rect
        x={unit * 2}
        y={unit * 2}
        width={unit * 3}
        height={unit * 3}
        rx={innerR}
        fill={accent}
      />
    </g>
  )
}

export default function QrArt({
  value,
  theme = 'celik',
  style = 'nokta',
  emblemText = 'T74',
  showEmblem = true,
  className = '',
  quiet = 2,
}) {
  const uid = useId().replace(/:/g, '')
  const t = QR_THEMES[theme] ?? QR_THEMES.celik

  const qr = useMemo(() => {
    try {
      return QRCode.create(value || ' ', { errorCorrectionLevel: 'H' })
    } catch {
      return null
    }
  }, [value])

  if (!qr) return null

  const size = qr.modules.size
  const data = qr.modules.data
  const unit = 4 // modül kenarı (viewBox birimi)
  const span = size + quiet * 2
  const box = span * unit
  const emblemSpan = showEmblem ? 7 : 0

  const dots = []
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!data[r * size + c]) continue
      if (isFinder(r, c, size)) continue
      if (showEmblem && isEmblemZone(r, c, size, emblemSpan)) continue

      const x = (c + quiet) * unit
      const y = (r + quiet) * unit

      if (style === 'nokta') {
        dots.push(<circle key={`${r}-${c}`} cx={x + unit / 2} cy={y + unit / 2} r={unit * 0.42} />)
      } else if (style === 'yuvarlak') {
        dots.push(
          <rect key={`${r}-${c}`} x={x + unit * 0.06} y={y + unit * 0.06} width={unit * 0.88} height={unit * 0.88} rx={unit * 0.3} />
        )
      } else {
        dots.push(<rect key={`${r}-${c}`} x={x} y={y} width={unit} height={unit} />)
      }
    }
  }

  const finderShape = style === 'klasik' ? 'klasik' : 'yumusak'
  const q = quiet * unit
  const far = (size - 7 + quiet) * unit
  const emblemPx = emblemSpan * unit
  const emblemXY = (box - emblemPx) / 2

  return (
    <svg
      viewBox={`0 0 ${box} ${box}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Menü karekodu"
      data-qr-value={value}
    >
      <rect width={box} height={box} rx={unit * 3} fill={t.bg} />

      <g fill={t.fg}>{dots}</g>

      <Finder x={q} y={q} unit={unit} fg={t.fg} accent={t.accent} shape={finderShape} />
      <Finder x={far} y={q} unit={unit} fg={t.fg} accent={t.accent} shape={finderShape} />
      <Finder x={q} y={far} unit={unit} fg={t.fg} accent={t.accent} shape={finderShape} />

      {showEmblem && (
        <g>
          <rect
            x={emblemXY}
            y={emblemXY}
            width={emblemPx}
            height={emblemPx}
            rx={unit * 1.6}
            fill={t.emblemBg}
            stroke={t.bg}
            strokeWidth={unit * 0.5}
          />
          <text
            x={box / 2}
            y={box / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontWeight="700"
            fontSize={emblemPx * (emblemText.length > 3 ? 0.3 : 0.38)}
            letterSpacing={emblemPx * 0.01}
            fill={t.emblemFg}
          >
            {emblemText}
          </text>
        </g>
      )}
      <title id={uid}>{value}</title>
    </svg>
  )
}

/* ------------------------------------------------------------ indirme */

/** Bir SVG düğümünü dosya olarak indirir */
export function downloadSvg(node, filename) {
  if (!node) return
  const clone = node.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const src = new XMLSerializer().serializeToString(clone)
  const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${src}`], {
    type: 'image/svg+xml;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** SVG'yi PNG'ye çevirip indirir — yazıcıya vermek için daha güvenli */
export function downloadPng(node, filename, px = 1024) {
  if (!node) return
  const clone = node.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const src = new XMLSerializer().serializeToString(clone)
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = px
    canvas.height = px
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, px, px)
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }, 'image/png')
  }
  img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(src)))}`
}
