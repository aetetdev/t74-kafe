/**
 * Kafe içi (on-site) veri katmanı: menü, masalar, siparişler ve masa hesapları.
 *
 * Akış: sipariş masasız oluşur (QR menü ya da garson ekranı) → kasaya düşer →
 * kasa siparişi bir masaya bağlar → masa hesabı büyür → hesap kapanır.
 *
 * E-ticaret tarafından ayrıdır: catalog.js eve gönderilen paketli ürünleri
 * tutar, burası masada servis edilenleri. İkisi linkedProductId ile bağlanır —
 * müşteri masada içtiği kahveyi QR menüden eve sipariş edebilir.
 */

import { dayKey } from '../lib/format'

/* ------------------------------------------------------------ menü */

export const MENU_KATEGORILERI = [
  { id: 'turk-kahvesi', name: 'Türk Kahvesi' },
  { id: 'espresso-bar', name: 'Espresso Bar' },
  { id: 'soguk-kahve', name: 'Soğuk Kahve' },
  { id: 'cay-bitki', name: 'Çay & Bitki' },
  { id: 'serbet-soguk', name: 'Şerbet & Soğuk' },
  { id: 'tatli', name: 'Tatlı & Atıştırmalık' },
  { id: 'kahvalti', name: 'Kahvaltı' },
]

/**
 * prep: ortalama hazırlık süresi (dk) — QR menüde müşteriye bilgi olarak gösterilir.
 *
 * Menü markadan bağımsızdır. Markaya özgü açıklama ve mağaza ürünü bağlantısı
 * brand.menuTweaks ile eklenir (bkz. menuForBrand).
 */
export const MENU = [
  /* --------------------------------------------------- Türk Kahvesi */
  { id: 'm-turk', cat: 'turk-kahvesi', name: 'Türk Kahvesi', price: 75, prep: 5, station: 'bar',
    desc: 'Kendi harmanımızdan, bakır cezvede. Sade, az şekerli veya şekerli.',
    options: ['Sade', 'Az şekerli', 'Orta', 'Şekerli'], popular: true },
  { id: 'm-dibek', cat: 'turk-kahvesi', name: 'Dibek Kahvesi', price: 95, prep: 6, station: 'bar',
    desc: 'Taş dibekte dövülmüş, sütlü ve yoğun.', options: ['Sade', 'Az şekerli', 'Şekerli'] },
  { id: 'm-menengic', cat: 'turk-kahvesi', name: 'Menengiç Kahvesi', price: 95, prep: 6, station: 'bar',
    desc: 'Kafeinsiz, sütlü. Akşam içimi için.' },
  { id: 'm-osmanli', cat: 'turk-kahvesi', name: 'Osmanlı Kahvesi', price: 95, prep: 7, station: 'bar',
    desc: 'Sakızlı, kakuleli. Yanında lokumla.' },

  /* ---------------------------------------------------- Espresso Bar */
  { id: 'm-espresso', cat: 'espresso-bar', name: 'Espresso', price: 70, prep: 2, station: 'bar',
    desc: 'Tek shot, %100 Arabica.', options: ['Tek', 'Double'] },
  { id: 'm-americano', cat: 'espresso-bar', name: 'Americano', price: 85, prep: 3, station: 'bar',
    desc: 'Espresso + sıcak su.' },
  { id: 'm-latte', cat: 'espresso-bar', name: 'Caffè Latte', price: 120, prep: 4, station: 'bar',
    desc: 'Yumuşak süt köpüğü, dengeli.', options: ['Normal süt', 'Laktozsuz', 'Badem sütü', 'Yulaf sütü'], popular: true },
  { id: 'm-cappuccino', cat: 'espresso-bar', name: 'Cappuccino', price: 115, prep: 4, station: 'bar',
    desc: 'Kalın köpük, tarçın isteğe bağlı.', options: ['Normal süt', 'Laktozsuz', 'Yulaf sütü'] },
  { id: 'm-flatwhite', cat: 'espresso-bar', name: 'Flat White', price: 125, prep: 4, station: 'bar',
    desc: 'Double shot, ince mikroköpük.' },
  { id: 'm-mocha', cat: 'espresso-bar', name: 'Mocha', price: 140, prep: 5, station: 'bar',
    desc: 'Bitter çikolata ve süt.' },
  { id: 'm-filtre', cat: 'espresso-bar', name: 'Filtre Kahve', price: 95, prep: 3, station: 'bar',
    desc: 'Günün demlemesi.' },

  /* ----------------------------------------------------- Soğuk Kahve */
  { id: 'm-icelatte', cat: 'soguk-kahve', name: 'Ice Latte', price: 135, prep: 4, station: 'bar',
    desc: 'Buzlu, sütlü.', options: ['Normal süt', 'Laktozsuz', 'Yulaf sütü'], popular: true },
  { id: 'm-coldbrew', cat: 'soguk-kahve', name: 'Cold Brew', price: 140, prep: 2, station: 'bar',
    desc: '18 saat soğuk demlenmiş. Yumuşak ve düşük asit.' },
  { id: 'm-frappe', cat: 'soguk-kahve', name: 'Frappe', price: 145, prep: 5, station: 'bar',
    desc: 'Buzla çırpılmış, kremalı.' },

  /* ------------------------------------------------------ Çay & Bitki */
  { id: 'm-cay', cat: 'cay-bitki', name: 'Demleme Çay', price: 30, prep: 2, station: 'bar',
    desc: 'İnce belli bardakta.', options: ['Açık', 'Demli'], popular: true },
  { id: 'm-fincan-cay', cat: 'cay-bitki', name: 'Fincan Çay', price: 40, prep: 2, station: 'bar',
    desc: 'Büyük fincanda.' },
  { id: 'm-ihlamur', cat: 'cay-bitki', name: 'Ihlamur', price: 55, prep: 4, station: 'bar',
    desc: 'Ballı servis edilir.' },
  { id: 'm-adacayi', cat: 'cay-bitki', name: 'Adaçayı', price: 55, prep: 4, station: 'bar', desc: 'Limonlu.' },
  { id: 'm-kusburnu', cat: 'cay-bitki', name: 'Kuşburnu', price: 55, prep: 4, station: 'bar',
    desc: 'Ekşi ve C vitamini dolu.' },

  /* --------------------------------------------------- Şerbet & Soğuk */
  { id: 'm-demirhindi', cat: 'serbet-soguk', name: 'Demirhindi Şerbeti', price: 70, prep: 2, station: 'bar',
    desc: 'Kendi ürettiğimiz, buzlu servis.' },
  { id: 'm-limonata', cat: 'serbet-soguk', name: 'Ev Yapımı Limonata', price: 75, prep: 3, station: 'bar',
    desc: 'Naneli.' },
  { id: 'm-ayran', cat: 'serbet-soguk', name: 'Ayran', price: 40, prep: 1, station: 'bar', desc: 'Yayık ayranı.' },
  { id: 'm-su', cat: 'serbet-soguk', name: 'Su', price: 15, prep: 1, station: 'bar', desc: '500 ml.' },

  /* --------------------------------------------------------- Tatlı */
  { id: 'm-lokum', cat: 'tatli', name: 'Lokum Tabağı', price: 60, prep: 2, station: 'mutfak',
    desc: 'Fıstıklı ve gül lokumu, üçer parça.', popular: true },
  { id: 'm-cheesecake', cat: 'tatli', name: 'Frambuazlı Cheesecake', price: 165, prep: 3, station: 'mutfak',
    desc: 'Dilim.' },
  { id: 'm-sansebastian', cat: 'tatli', name: 'San Sebastian', price: 175, prep: 3, station: 'mutfak',
    desc: 'Yanık cheesecake.' },
  { id: 'm-brownie', cat: 'tatli', name: 'Sıcak Brownie', price: 145, prep: 8, station: 'mutfak',
    desc: 'Dondurma ile.' },
  { id: 'm-kurabiye', cat: 'tatli', name: 'Ev Kurabiyesi', price: 55, prep: 2, station: 'mutfak',
    desc: 'Günün kurabiyesi, ikili.' },

  /* ------------------------------------------------------- Kahvaltı */
  { id: 'm-serpme', cat: 'kahvalti', name: 'Serpme Kahvaltı', price: 750, prep: 20, station: 'mutfak',
    desc: '2 kişilik. Köy peyniri, bal, kaymak, zeytin, reçel, sınırsız çay.', popular: true },
  { id: 'm-menemen', cat: 'kahvalti', name: 'Menemen', price: 220, prep: 14, station: 'mutfak',
    desc: 'Ekmek ile.', options: ['Sucuklu', 'Peynirli', 'Sade'] },
  { id: 'm-simit', cat: 'kahvalti', name: 'Simit Tabağı', price: 120, prep: 6, station: 'mutfak',
    desc: 'Peynir, zeytin, domates.' },
  { id: 'm-tost', cat: 'kahvalti', name: 'Kaşarlı Tost', price: 150, prep: 8, station: 'mutfak',
    desc: 'Yanında turşu.', options: ['Kaşarlı', 'Sucuklu', 'Karışık'] },
]

export const menuItem = (id) => MENU.find((m) => m.id === id)
export const menuByCat = (cat) => MENU.filter((m) => m.cat === cat)

/* ---------------------------------------------------------- masalar */

export const BOLGELER = [
  { id: 'ic-salon', name: 'İç Salon' },
  { id: 'bahce', name: 'Bahçe' },
  { id: 'teras', name: 'Teras' },
]

/**
 * Markaya göre menü: ortak kalemlerin üzerine o markanın açıklama ve
 * mağaza ürünü bağlantısı yazılır. Tanımsız markada ortak menü döner.
 */
export function menuForBrand(tweaks) {
  if (!tweaks) return MENU
  return MENU.map((m) => (tweaks[m.id] ? { ...m, ...tweaks[m.id] } : m))
}

export const MASALAR = [
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `S${i + 1}`, no: `${i + 1}`, zone: 'ic-salon', seats: i < 4 ? 2 : 4,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `B${i + 1}`, no: `B${i + 1}`, zone: 'bahce', seats: i < 2 ? 6 : 4,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `T${i + 1}`, no: `T${i + 1}`, zone: 'teras', seats: 4,
  })),
]

export const masaById = (id) => MASALAR.find((m) => m.id === id)
export const zoneName = (id) => BOLGELER.find((z) => z.id === id)?.name ?? id

export const GARSONLAR = ['Emre', 'Buse', 'Hakan', 'Selin']

export const SIPARIS_DURUMLARI = {
  bekliyor: { label: 'Kasada bekliyor' },
  atandi: { label: 'Masaya bağlandı' },
  iptal: { label: 'İptal' },
}

export const ODEME_TIPLERI = ['Nakit', 'Kredi Kartı', 'Yemek Kartı']

/* ---------------------------------------------------- rastgelelik */

function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rngFactory = (seed) => {
  const r = mulberry32(seed)
  return {
    next: r,
    int: (min, max) => Math.floor(r() * (max - min + 1)) + min,
    float: (min, max) => r() * (max - min) + min,
    pick: (arr) => arr[Math.floor(r() * arr.length)],
    weighted: (pairs) => {
      const total = pairs.reduce((s, [, w]) => s + w, 0)
      let x = r() * total
      for (const [v, w] of pairs) {
        x -= w
        if (x <= 0) return v
      }
      return pairs[pairs.length - 1][0]
    },
    chance: (p) => r() < p,
  }
}

/* ------------------------------------------------------- ağırlıklar */

/** Menü kalemi satış ağırlıkları — çay ve Türk kahvesi baskın */
const SATIS_AGIRLIK = {
  'm-cay': 165, 'm-turk': 140, 'm-latte': 95, 'm-fincan-cay': 62, 'm-americano': 48,
  'm-cappuccino': 46, 'm-filtre': 40, 'm-icelatte': 58, 'm-espresso': 34, 'm-flatwhite': 30,
  'm-coldbrew': 26, 'm-mocha': 24, 'm-frappe': 22, 'm-dibek': 34, 'm-menengic': 20, 'm-osmanli': 26,
  'm-ihlamur': 22, 'm-adacayi': 18, 'm-kusburnu': 14, 'm-demirhindi': 30, 'm-limonata': 34,
  'm-ayran': 26, 'm-su': 70, 'm-lokum': 74, 'm-cheesecake': 46, 'm-sansebastian': 38,
  'm-brownie': 32, 'm-kurabiye': 30, 'm-serpme': 26, 'm-menemen': 34, 'm-simit': 28, 'm-tost': 40,
}

/** Saatlik doluluk profili (10:00–23:00) */
const SAAT_PROFIL = [
  [10, 4], [11, 6], [12, 8], [13, 9], [14, 8], [15, 11], [16, 13],
  [17, 14], [18, 13], [19, 12], [20, 14], [21, 12], [22, 7], [23, 3],
]

export const SERVIS_SAATLERI = SAAT_PROFIL.map(([h]) => h)

const gunEkle = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const gunFarki = (a, b) => Math.round((b - a) / 86400000)

export const ACILIS = new Date(2026, 2, 27)

/* ------------------------------------------------------ ana üretici */

let _cache = null

/**
 * Akış: sipariş masasız oluşur (QR ya da garson) → kasaya düşer →
 * kasa bir masaya bağlar → masa hesabı büyür → hesap kapanır.
 */
export function buildCafeDataset() {
  if (_cache) return _cache

  const rng = rngFactory(29061299)
  const now = new Date()
  const nowTs = now.getTime()
  const son = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const toplamGun = Math.max(120, gunFarki(ACILIS, son) + 1)
  const baslangic = gunEkle(son, -(toplamGun - 1))

  const menuPairs = MENU.map((m) => [m.id, SATIS_AGIRLIK[m.id] ?? 20])

  /** Bir siparişin kalemlerini üretir */
  // carpan: kişi başına düşen kalem aralığı. İlk sipariş dolu, sonrakiler
  // ("bir çay daha") belirgin şekilde küçük olur.
  const kalemUret = (kisi, saat, haftaSonu, carpan = [1.0, 1.7]) => {
    const secilen = new Map()
    const adet = Math.max(1, Math.round(kisi * rng.float(carpan[0], carpan[1])))
    for (let k = 0; k < adet; k += 1) {
      let mid = rng.weighted(menuPairs)
      // Serpme kahvaltı yalnızca sabah, ağırlıkla hafta sonu
      if (mid === 'm-serpme' && (saat > 14 || (!haftaSonu && rng.chance(0.6)))) mid = 'm-cay'
      secilen.set(mid, (secilen.get(mid) ?? 0) + 1)
    }
    return [...secilen.entries()].map(([mid, qty]) => {
      const mi = menuItem(mid)
      return { menuItemId: mid, name: mi.name, price: mi.price, qty, total: mi.price * qty, note: null }
    })
  }

  const tickets = [] // kapanmış masa hesapları
  const days = []
  const hourGrid = {}
  const itemTally = {}

  let ticketNo = 4120
  let orderNo = 20400

  for (let i = 0; i < toplamGun; i += 1) {
    const tarih = gunEkle(baslangic, i)
    const gun = tarih.getDay()
    const haftaSonu = gun === 0 || gun === 6
    const ilerleme = toplamGun > 1 ? i / (toplamGun - 1) : 1

    const taban = 34 + 30 * (1 - Math.exp(-2.4 * ilerleme))
    const adet = Math.max(8, Math.round(taban * (haftaSonu ? 1.42 : 1) * rng.float(0.84, 1.16)))

    let gunCiro = 0
    let gunKisi = 0
    let gunSure = 0
    let gunAdet = 0

    for (let j = 0; j < adet; j += 1) {
      const saat = rng.weighted(SAAT_PROFIL)
      const acilis = new Date(tarih)
      acilis.setHours(saat, rng.int(0, 59), 0, 0)
      if (acilis.getTime() > nowTs) continue

      const kisi = rng.weighted([[1, 12], [2, 38], [3, 20], [4, 18], [5, 7], [6, 5]])
      const sure = rng.int(28, 115)
      const kapanis = new Date(acilis.getTime() + sure * 60000)

      // Bir masa hesabı 1–3 siparişten oluşur (ilk sipariş + sonradan eklenenler)
      const siparisSayisi = rng.weighted([[1, 58], [2, 32], [3, 10]])
      const orders = []
      for (let s = 0; s < siparisSayisi; s += 1) {
        const kaynak = rng.chance(0.34) ? 'QR Menü' : 'Garson'
        orders.push({
          id: `SP-${orderNo}`,
          source: kaynak,
          waiter: kaynak === 'Garson' ? rng.pick(GARSONLAR) : null,
          items: kalemUret(kisi, saat, haftaSonu, s === 0 ? [1.0, 1.7] : [0.35, 0.8]),
          createdAt: new Date(acilis.getTime() + s * rng.int(6, 25) * 60000).toISOString(),
        })
        orderNo += 1
      }

      const items = []
      orders.forEach((o) =>
        o.items.forEach((it) => {
          const v = items.find((x) => x.menuItemId === it.menuItemId)
          if (v) {
            v.qty += it.qty
            v.total += it.total
          } else items.push({ ...it })
        })
      )

      const toplam = items.reduce((s, it) => s + it.total, 0)
      if (toplam === 0) continue

      items.forEach((it) => {
        const t = itemTally[it.menuItemId] ?? { qty: 0, revenue: 0 }
        t.qty += it.qty
        t.revenue += it.total
        itemTally[it.menuItemId] = t
      })

      const masa = rng.pick(MASALAR)
      const iptal = rng.chance(0.012)
      const qrVar = orders.some((o) => o.source === 'QR Menü')

      tickets.push({
        id: `AD-${ticketNo}`,
        number: ticketNo,
        tableId: masa.id,
        tableNo: masa.no,
        zone: masa.zone,
        guests: kisi,
        waiter: orders.find((o) => o.waiter)?.waiter ?? rng.pick(GARSONLAR),
        openedAt: acilis.toISOString(),
        closedAt: kapanis.toISOString(),
        durationMin: sure,
        orders,
        items,
        total: toplam,
        status: iptal ? 'iptal' : 'odendi',
        payment: rng.weighted([['Kredi Kartı', 58], ['Nakit', 30], ['Yemek Kartı', 12]]),
        hasQr: qrVar,
      })
      ticketNo += 1

      if (!iptal) {
        gunCiro += toplam
        gunKisi += kisi
        gunSure += sure
        gunAdet += 1
        hourGrid[`${gun}-${saat}`] = (hourGrid[`${gun}-${saat}`] ?? 0) + 1
      }
    }

    days.push({
      date: dayKey(tarih),
      ts: tarih.getTime(),
      tickets: gunAdet,
      revenue: gunCiro,
      guests: gunKisi,
      avgTicket: gunAdet ? gunCiro / gunAdet : 0,
      avgDuration: gunAdet ? gunSure / gunAdet : 0,
      occupancy: Math.min(100, (gunSure / (MASALAR.length * 13 * 60)) * 100),
    })
  }

  /* ------------------------------------- kasada bekleyen siparişler */

  const pendingOrders = []
  const bekleyenSayisi = rng.int(2, 4)
  for (let i = 0; i < bekleyenSayisi; i += 1) {
    const kaynak = rng.chance(0.6) ? 'QR Menü' : 'Garson'
    const kisi = rng.weighted([[1, 14], [2, 42], [3, 22], [4, 22]])
    const items = kalemUret(kisi, now.getHours(), false)
    pendingOrders.push({
      id: `SP-${orderNo}`,
      shortNo: String(orderNo % 1000).padStart(3, '0'),
      source: kaynak,
      waiter: kaynak === 'Garson' ? rng.pick(GARSONLAR) : null,
      items,
      total: items.reduce((s, it) => s + it.total, 0),
      createdAt: new Date(nowTs - rng.int(0, 9) * 60000).toISOString(),
      status: 'bekliyor',
      tableId: null,
      note: rng.chance(0.2) ? rng.pick(['Şekersiz olsun', 'Laktozsuz süt', 'Yanında buz']) : null,
    })
    orderNo += 1
  }

  /* --------------------------------------------- açık masa hesapları */

  const openAccounts = []
  const acikSayisi = rng.int(4, 7)
  const kullanilan = new Set()

  for (let i = 0; i < acikSayisi; i += 1) {
    let masa = rng.pick(MASALAR)
    let guard = 0
    while (kullanilan.has(masa.id) && guard < 40) {
      masa = rng.pick(MASALAR)
      guard += 1
    }
    kullanilan.add(masa.id)

    const gecenDk = rng.int(6, 74)
    const acilis = new Date(nowTs - gecenDk * 60000)
    const kisi = rng.weighted([[1, 10], [2, 40], [3, 22], [4, 18], [5, 6], [6, 4]])
    const siparisSayisi = rng.weighted([[1, 60], [2, 30], [3, 10]])

    const orders = []
    for (let s = 0; s < siparisSayisi; s += 1) {
      const kaynak = rng.chance(0.4) ? 'QR Menü' : 'Garson'
      const items = kalemUret(kisi, now.getHours(), false, s === 0 ? [1.0, 1.7] : [0.35, 0.8])
      orders.push({
        id: `SP-${orderNo}`,
        source: kaynak,
        waiter: kaynak === 'Garson' ? rng.pick(GARSONLAR) : null,
        items,
        total: items.reduce((s2, it) => s2 + it.total, 0),
        createdAt: new Date(acilis.getTime() + s * rng.int(5, 18) * 60000).toISOString(),
        status: 'atandi',
        tableId: masa.id,
        note: null,
      })
      orderNo += 1
    }

    openAccounts.push({
      id: `AD-${ticketNo}`,
      number: ticketNo,
      tableId: masa.id,
      tableNo: masa.no,
      zone: masa.zone,
      guests: kisi,
      openedAt: acilis.toISOString(),
      closedAt: null,
      orderIds: orders.map((o) => o.id),
      orders,
      status: 'acik',
      payment: null,
    })
    ticketNo += 1
  }

  /* -------------------------------------------------- türetilenler */

  const menuStats = MENU.map((m) => {
    const t = itemTally[m.id] ?? { qty: 0, revenue: 0 }
    return { id: m.id, name: m.name, cat: m.cat, price: m.price, qty: t.qty, revenue: t.revenue }
  }).sort((a, b) => b.revenue - a.revenue)

  const paid = tickets.filter((t) => t.status === 'odendi')

  const zoneStats = BOLGELER.map((z) => {
    const rows = paid.filter((t) => t.zone === z.id)
    const rev = rows.reduce((s, t) => s + t.total, 0)
    return { id: z.id, name: z.name, tickets: rows.length, revenue: rev, avgTicket: rows.length ? rev / rows.length : 0 }
  }).sort((a, b) => b.revenue - a.revenue)

  const waiterStats = GARSONLAR.map((w) => {
    const rows = paid.filter((t) => t.waiter === w)
    const rev = rows.reduce((s, t) => s + t.total, 0)
    return { name: w, tickets: rows.length, revenue: rev, avgTicket: rows.length ? rev / rows.length : 0 }
  }).sort((a, b) => b.revenue - a.revenue)

  // Sipariş adedi bazında kaynak payı (masa hesabı değil, tekil sipariş)
  const allOrders = paid.flatMap((t) => t.orders ?? [])
  const qrShare = allOrders.length
    ? (allOrders.filter((o) => o.source === 'QR Menü').length / allOrders.length) * 100
    : 0

  _cache = {
    from: baslangic,
    to: son,
    tickets: tickets.sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt)),
    pendingOrders,
    openAccounts,
    days,
    hourGrid,
    menuStats,
    zoneStats,
    waiterStats,
    qrShare,
    nextTicketNo: ticketNo,
    nextOrderNo: orderNo,
  }
  return _cache
}
