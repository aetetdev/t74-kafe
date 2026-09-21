/**
 * Panel metrikleri.
 * Ham günlük veriyi alır, dönem karşılaştırmalı özet üretir.
 */

import { monthKey } from './format'

export const PERIODS = [
  { id: 'today', label: 'Bugün', days: 1 },
  { id: '7d', label: 'Son 7 gün', days: 7 },
  { id: '30d', label: 'Son 30 gün', days: 30 },
  { id: '90d', label: 'Son 90 gün', days: 90 },
  { id: 'all', label: 'Tüm dönem', days: null },
]

export const periodLabel = (id) => PERIODS.find((p) => p.id === id)?.label ?? id

/** Seçili dönem + karşılaştırma için bir önceki eşit uzunluktaki dönem */
export function slicePeriod(days, periodId) {
  const period = PERIODS.find((p) => p.id === periodId) ?? PERIODS[2]
  if (!period.days) return { current: days, previous: [], comparable: false }

  const n = Math.min(period.days, days.length)
  const current = days.slice(-n)
  const previous = days.slice(Math.max(0, days.length - n * 2), days.length - n)
  return { current, previous, comparable: previous.length === n && n > 0 }
}

const sum = (arr, key) => arr.reduce((s, d) => s + (d[key] ?? 0), 0)

const delta = (now, before) => {
  if (!before) return null
  return ((now - before) / before) * 100
}

/** Kart üstündeki dört ana metrik + değişim yüzdeleri */
export function summarize(days, periodId) {
  const { current, previous, comparable } = slicePeriod(days, periodId)

  const revenue = sum(current, 'revenue')
  const orders = sum(current, 'orders')
  const visits = sum(current, 'visits')
  const visitors = sum(current, 'visitors')
  const aov = orders ? revenue / orders : 0
  const conversion = visits ? (orders / visits) * 100 : 0

  const pRevenue = sum(previous, 'revenue')
  const pOrders = sum(previous, 'orders')
  const pVisits = sum(previous, 'visits')
  const pAov = pOrders ? pRevenue / pOrders : 0
  const pConversion = pVisits ? (pOrders / pVisits) * 100 : 0

  return {
    revenue,
    orders,
    visits,
    visitors,
    aov,
    conversion,
    comparable,
    delta: {
      revenue: comparable ? delta(revenue, pRevenue) : null,
      orders: comparable ? delta(orders, pOrders) : null,
      visits: comparable ? delta(visits, pVisits) : null,
      aov: comparable ? delta(aov, pAov) : null,
      conversion: comparable ? delta(conversion, pConversion) : null,
    },
    series: current,
  }
}

/** Günlük seriyi aya toplar — yıllık görünüm için */
export function byMonth(days) {
  const map = new Map()
  days.forEach((d) => {
    const key = monthKey(d.ts)
    const row = map.get(key) ?? { key, ts: d.ts, revenue: 0, orders: 0, visits: 0 }
    row.revenue += d.revenue
    row.orders += d.orders
    row.visits += d.visits
    map.set(key, row)
  })
  return [...map.values()].sort((a, b) => a.ts - b.ts)
}

/** Grafik nokta sayısını makul tutmak için haftaya toplar */
export function byWeek(days) {
  const out = []
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7)
    out.push({
      key: chunk[0].date,
      ts: chunk[0].ts,
      revenue: sum(chunk, 'revenue'),
      orders: sum(chunk, 'orders'),
      visits: sum(chunk, 'visits'),
    })
  }
  return out
}

/**
 * Grafik için uygun çözünürlüğü seçer.
 * 45 günden azsa günlük, 180 günden azsa haftalık, üstünde aylık.
 */
export function resample(days) {
  if (days.length <= 45) return { rows: days.map((d) => ({ ...d, key: d.date })), grain: 'gun' }
  if (days.length <= 180) return { rows: byWeek(days), grain: 'hafta' }
  return { rows: byMonth(days), grain: 'ay' }
}

/** Dönem içindeki siparişlerden ürün sıralaması */
export function productLeaderboard(orders, from, to) {
  const map = new Map()
  orders
    .filter((o) => {
      if (o.status === 'iptal' || o.status === 'iade') return false
      const t = new Date(o.createdAt).getTime()
      return t >= from && t <= to
    })
    .forEach((o) =>
      o.items.forEach((it) => {
        const row = map.get(it.productId) ?? {
          id: it.productId,
          name: it.name,
          variant: it.variant,
          art: it.art,
          tone: it.tone,
          units: 0,
          revenue: 0,
        }
        row.units += it.qty
        row.revenue += it.total
        map.set(it.productId, row)
      })
    )
  return [...map.values()].sort((a, b) => b.revenue - a.revenue)
}

/**
 * Ziyaret → sepet → ödeme → sipariş hunisi.
 *
 * Her adım "o adıma ulaşan oturum sayısı"dır, sayfa görüntülenmesi değil —
 * bir ziyaretçi birden çok ürüne bakabildiği için pageViews doğrudan
 * kullanılamaz, huni artan çıkar. Bu yüzden ürün gören oturum oranından
 * türetiyoruz ve seriyi azalan olmaya zorluyoruz.
 */
export function funnel(days) {
  const visits = sum(days, 'visits')
  const addToCart = sum(days, 'addToCart')
  const checkout = sum(days, 'checkoutStart')
  const orders = sum(days, 'orders')

  const raw = [
    { step: 'Siteye giriş', value: visits },
    { step: 'Ürün görüntüleme', value: Math.round(visits * 0.68) },
    { step: 'Sepete ekleme', value: addToCart },
    { step: 'Ödeme adımı', value: checkout },
    { step: 'Sipariş', value: orders },
  ]

  // Huni asla yukarı çıkmaz
  const steps = raw.map((s, i, arr) => ({
    ...s,
    value: i === 0 ? s.value : Math.min(s.value, arr[i - 1].value),
  }))
  for (let i = 1; i < steps.length; i += 1) {
    steps[i].value = Math.min(steps[i].value, steps[i - 1].value)
  }

  const top = steps[0].value || 1
  return steps.map((s, i) => ({
    ...s,
    share: (s.value / top) * 100,
    dropoff:
      i === 0 ? null : Math.max(0, ((steps[i - 1].value - s.value) / (steps[i - 1].value || 1)) * 100),
  }))
}

/**
 * "Çok bakılıp az satılan" ürünleri bulur.
 * Panelin en satılabilir özelliği: veriyi eyleme çeviren tek cümle.
 */
export function attentionInsights(productStats) {
  const withViews = productStats.filter((p) => p.views > 200 && p.units > 0)
  if (!withViews.length) return null

  const ortDonusum =
    withViews.reduce((s, p) => s + p.conversion, 0) / withViews.length

  const mostViewed = [...withViews].sort((a, b) => b.views - a.views)[0]
  const underperformer = [...withViews]
    .filter((p) => p.views > 800)
    .sort((a, b) => a.conversion / ortDonusum - b.conversion / ortDonusum)[0]
  const star = [...withViews].sort((a, b) => b.conversion - a.conversion)[0]

  return { mostViewed, underperformer, star, averageConversion: ortDonusum }
}

/** Stok uyarıları */
export function stockAlerts(products, threshold = 20) {
  return products
    .filter((p) => p.stock <= threshold)
    .sort((a, b) => a.stock - b.stock)
    .map((p) => ({
      id: p.id,
      name: p.name,
      variant: p.variant,
      stock: p.stock,
      level: p.stock <= 10 ? 'critical' : 'warning',
    }))
}
