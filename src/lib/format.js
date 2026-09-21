// Intl'in tr-TR para birimi çıktısı "₺250,00" şeklinde; Türkiye'de yaygın
// kullanım ise sembolün sonda olduğu "250 ₺". Sayıyı biçimlendirip sembolü
// kendimiz ekliyoruz.
const TRY = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const TRY_KURUS = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const NUM = new Intl.NumberFormat('tr-TR')

/** 1.250 ₺ */
export const money = (n) => `${TRY.format(Math.round(n ?? 0))} ₺`

/** 1.250,00 ₺ — toplamlar ve fatura satırları için */
export const moneyExact = (n) => `${TRY_KURUS.format(n ?? 0)} ₺`

/** 12.480 */
export const num = (n) => NUM.format(Math.round(n ?? 0))

/** Grafik eksenleri için kısa gösterim: 12,5B / 1,2Mn */
export function compact(n) {
  const v = Number(n) || 0
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.', ',')}Mn`
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(v >= 10_000 ? 0 : 1).replace('.', ',')}B`
  return NUM.format(v)
}

/** %12,4 */
export const pct = (n, digits = 1) =>
  `%${(Number(n) || 0).toFixed(digits).replace('.', ',')}`

/** +%12,4 / -%3,1 */
export const signedPct = (n, digits = 1) => {
  const v = Number(n) || 0
  return `${v > 0 ? '+' : v < 0 ? '−' : ''}%${Math.abs(v).toFixed(digits).replace('.', ',')}`
}

const D_LONG = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const D_SHORT = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit' })
const D_DAYMON = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' })
const D_MON = new Intl.DateTimeFormat('tr-TR', { month: 'short', year: '2-digit' })
const D_TIME = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' })

const asDate = (d) => (d instanceof Date ? d : new Date(d))

export const dateLong = (d) => D_LONG.format(asDate(d))
export const dateShort = (d) => D_SHORT.format(asDate(d))
export const dayMonth = (d) => D_DAYMON.format(asDate(d))
export const monthYear = (d) => D_MON.format(asDate(d))
export const time = (d) => D_TIME.format(asDate(d))
export const dateTime = (d) => `${D_SHORT.format(asDate(d))} · ${D_TIME.format(asDate(d))}`

/** "3 saat önce" */
export function relative(d) {
  const diff = Date.now() - asDate(d).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return 'az önce'
  if (min < 60) return `${min} dk önce`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr} saat önce`
  const day = Math.round(hr / 24)
  if (day < 30) return `${day} gün önce`
  const mon = Math.round(day / 30)
  return `${mon} ay önce`
}

/** ISO gün anahtarı — yerel saate göre (toISOString UTC'ye kaydırır, kullanma) */
export function dayKey(d) {
  const x = asDate(d)
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const day = String(x.getDate()).padStart(2, '0')
  return `${x.getFullYear()}-${m}-${day}`
}

export function monthKey(d) {
  const x = asDate(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`
}

/** Türkçe'ye uygun slug */
export function slugify(str) {
  const map = { ş: 's', Ş: 's', ı: 'i', İ: 'i', ğ: 'g', Ğ: 'g', ü: 'u', Ü: 'u', ö: 'o', Ö: 'o', ç: 'c', Ç: 'c' }
  return String(str)
    .replace(/[şŞıİğĞüÜöÖçÇ]/g, (c) => map[c])
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const initials = (name) =>
  String(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toLocaleUpperCase('tr-TR')
