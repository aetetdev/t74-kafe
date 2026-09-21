/**
 * Demo verisi üreteci.
 *
 * Tohumlu (seeded) rastgelelik kullanılır: sayfa her yenilendiğinde aynı geçmiş
 * üretilir, yalnızca bugüne ait satır eklenir. Demo sırasında rakamlar
 * oynamasın diye bu önemli.
 *
 * Katalog dışarıdan verilir; her marka kendi ürünleriyle kendi geçmişini alır.
 */

import { PRODUCTS } from './catalog'
import { dayKey } from '../lib/format'

/* ------------------------------------------------------- rastgelelik */

function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const makeRng = (seed) => {
  const r = mulberry32(seed)
  return {
    next: r,
    /** [min, max] arası tam sayı */
    int: (min, max) => Math.floor(r() * (max - min + 1)) + min,
    /** [min, max] arası ondalık */
    float: (min, max) => r() * (max - min) + min,
    pick: (arr) => arr[Math.floor(r() * arr.length)],
    /** ağırlıklı seçim — [[değer, ağırlık], ...] */
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

/* --------------------------------------------------------- sabitler */

export const OPENING_DATE = new Date(2026, 2, 27) // 27 Mart 2026

const AD = [
  'Ayşe', 'Mehmet', 'Fatma', 'Mustafa', 'Emine', 'Ahmet', 'Hatice', 'Ali', 'Zeynep', 'Hüseyin',
  'Elif', 'Hasan', 'Meryem', 'İbrahim', 'Şerife', 'Osman', 'Sultan', 'Yusuf', 'Havva', 'Murat',
  'Merve', 'Ömer', 'Esra', 'Ramazan', 'Özlem', 'Kemal', 'Sevgi', 'Burak', 'Derya', 'Serkan',
  'Buse', 'Emre', 'Gizem', 'Onur', 'Selin', 'Barış', 'Ceren', 'Volkan', 'Nihan', 'Tolga',
  'Rabia', 'Furkan', 'Beyza', 'Enes', 'İrem', 'Kaan', 'Melis', 'Cem', 'Duygu', 'Uğur',
]

const SOYAD = [
  'Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir',
  'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek',
  'Polat', 'Korkmaz', 'Erdoğan', 'Bulut', 'Güneş', 'Aksoy', 'Tekin', 'Bozkurt', 'Acar', 'Duran',
  'Karaca', 'Sarı', 'Turan', 'Ateş', 'Uysal', 'Güler', 'Avcı', 'Taş', 'Yavuz', 'Sezer',
]

/**
 * Varsayılan şehir dağılımı — Türkiye geneli, nüfusa yakın.
 * Marka kendi memleketini öne çıkarmak isterse brand.cityWeights ile ezer.
 */
const SEHIRLER = [
  ['İstanbul', 30], ['Ankara', 13], ['İzmir', 10], ['Bursa', 8], ['Antalya', 6],
  ['Kocaeli', 5], ['Konya', 4], ['Adana', 3], ['Eskişehir', 3], ['Gaziantep', 3],
  ['Mersin', 2], ['Sakarya', 2], ['Kayseri', 2], ['Samsun', 2], ['Denizli', 2],
  ['Balıkesir', 1], ['Manisa', 1], ['Tekirdağ', 1], ['Trabzon', 1], ['Muğla', 1],
]

const KANALLAR = [
  ['Instagram', 58], ['Doğrudan', 16], ['Google', 14], ['WhatsApp', 8], ['Diğer', 4],
]

const ODEME = [
  ['Kredi Kartı', 62], ['Havale/EFT', 21], ['Kapıda Ödeme', 12], ['Alışveriş Kredisi', 5],
]

const KARGO = [['Yurtiçi Kargo', 46], ['Aras Kargo', 31], ['MNG Kargo', 15], ['Sürat Kargo', 8]]

export const SIPARIS_DURUMLARI = {
  yeni: { label: 'Yeni', tone: 'crimson' },
  hazirlaniyor: { label: 'Hazırlanıyor', tone: 'copper' },
  kargoda: { label: 'Kargoda', tone: 'steel' },
  teslim: { label: 'Teslim Edildi', tone: 'good' },
  iptal: { label: 'İptal', tone: 'critical' },
  iade: { label: 'İade', tone: 'critical' },
}

/**
 * Satış ve ilgi katsayıları katalogdan türetilir; markaya özgü kimlik listesi
 * tutulmaz. Böylece hangi ürün seti gelirse gelsin üretici çalışır.
 *
 * Katsayılar ürün sırasına bağlı olduğu için tohumlu üretimle birlikte
 * deterministiktir — aynı katalog her zaman aynı geçmişi verir.
 */

/** Ürünün satış ağırlığı: öne çıkanlar daha çok satar, sıra da varyans katar */
const satisAgirligi = (p, i) => {
  const taban = p.featured ? 92 : 44
  const varyans = [1, 0.72, 1.28, 0.55, 1.12, 0.86, 1.42, 0.64][i % 8]
  return Math.max(8, Math.round(taban * varyans))
}

/**
 * Ürünün "ilgi" katsayısı — görüntülenme/satış oranını ayırır.
 * Pahalı ürünler çok bakılıp az alınır; panelin en değerli içgörüsü
 * ("çok bakılıp az satılan ürün") buradan çıkar.
 */
const ilgiKatsayisi = (p, i) => {
  const fiyatEtkisi = p.price > 800 ? 3.2 : p.price > 450 ? 2.1 : p.price > 300 ? 1.4 : 1
  const varyans = [1, 1.3, 0.88, 1.5, 1.08, 0.8, 1.22, 1.04][i % 8]
  return fiyatEtkisi * varyans
}

export const KARGO_UCRETI = 49
export const UCRETSIZ_KARGO_ESIGI = 500

/* --------------------------------------------------------- yardımcı */

const gunSayisi = (a, b) => Math.round((b - a) / 86400000)
const gunEkle = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

/**
 * Günlük sipariş beklentisi.
 * Açılıştan itibaren büyüyen bir eğri + hafta sonu etkisi + kampanya sıçramaları.
 */
function gunlukBeklenti(gunIndex, toplamGun, tarih, rng) {
  // Büyüme: 1.4 → ~9 sipariş/gün, doyuma yaklaşan eğri
  const ilerleme = toplamGun > 1 ? gunIndex / (toplamGun - 1) : 1
  const buyume = 1.4 + 8.2 * (1 - Math.exp(-2.6 * ilerleme))

  // Hafta içi/sonu — Cuma, Cumartesi, Pazar daha yoğun
  const gun = tarih.getDay() // 0 Paz … 6 Cmt
  const haftaKatsayi = [1.12, 0.82, 0.86, 0.92, 1.0, 1.18, 1.24][gun]

  // Ramazan/bayram benzeri sezon etkisi yerine: yaz aylarında hafif düşüş
  const ay = tarih.getMonth()
  const mevsim = ay === 6 || ay === 7 ? 0.9 : 1.0

  // Kampanya sıçraması — Instagram reels tutunca
  const sicrama = rng.chance(0.035) ? rng.float(2.2, 4.1) : 1

  return buyume * haftaKatsayi * mevsim * sicrama
}

function poisson(lambda, rng) {
  // Küçük lambda için Knuth yeterli
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k += 1
    p *= rng.next()
  } while (p > L)
  return k - 1
}

/* ---------------------------------------------------- ana üretici */

/** Marka başına önbellek — her katalog kendi geçmişini üretir */
const _cache = {}

export function buildDataset(products = PRODUCTS, brandId = 'varsayilan', opts = {}) {
  const { orderPrefix = 'SP', cityWeights = SEHIRLER } = opts
  if (_cache[brandId]) return _cache[brandId]

  const rng = makeRng(12991299)
  const bugun = new Date()
  const simdi = bugun.getTime()
  const son = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate())
  const toplamGun = Math.max(120, gunSayisi(OPENING_DATE, son) + 1)
  const baslangic = gunEkle(son, -(toplamGun - 1))

  const agirlik = new Map(products.map((p, i) => [p.id, satisAgirligi(p, i)]))
  const ilgi = new Map(products.map((p, i) => [p.id, ilgiKatsayisi(p, i)]))
  const satisPairs = products.map((p) => [p.id, agirlik.get(p.id)])

  const orders = []
  const gunler = []
  const urunGorunum = {} // productId -> toplam görüntülenme
  const urunGunluk = {} // 'YYYY-MM-DD' -> { productId: görüntülenme }
  const musteriler = new Map() // e-posta -> müşteri

  let siparisNo = 1043

  for (let i = 0; i < toplamGun; i += 1) {
    const tarih = gunEkle(baslangic, i)
    const key = dayKey(tarih)
    const beklenti = gunlukBeklenti(i, toplamGun, tarih, rng)
    const adet = poisson(beklenti, rng)

    const gunSiparisleri = []

    for (let j = 0; j < adet; j += 1) {
      // Gün içi saat dağılımı — akşam yoğun
      const saat = rng.weighted([
        [9, 4], [10, 6], [11, 7], [12, 8], [13, 7], [14, 7], [15, 8],
        [16, 9], [17, 10], [18, 11], [19, 12], [20, 14], [21, 13], [22, 9], [23, 5], [0, 3],
      ])
      const olusturma = new Date(tarih)
      olusturma.setHours(saat, rng.int(0, 59), rng.int(0, 59), 0)
      // Bugünün siparişleri geleceğe düşmesin — "az önce" yerine gerçek saat okunsun
      if (olusturma.getTime() > simdi) {
        olusturma.setTime(simdi - rng.int(60, 10 * 3600) * 1000)
      }

      // Sepet içeriği
      const satirSayisi = rng.weighted([[1, 52], [2, 30], [3, 13], [4, 5]])
      const secilen = new Map()
      for (let k = 0; k < satirSayisi; k += 1) {
        const pid = rng.weighted(satisPairs)
        const mevcut = secilen.get(pid) ?? 0
        secilen.set(pid, mevcut + (rng.chance(0.18) ? 2 : 1))
      }

      const items = [...secilen.entries()].map(([pid, qty]) => {
        const p = products.find((x) => x.id === pid)
        return {
          productId: pid,
          name: p.name,
          variant: p.variant,
          sku: p.sku,
          art: p.art,
          tone: p.tone,
          price: p.price,
          qty,
          total: p.price * qty,
        }
      })

      const araToplam = items.reduce((s, it) => s + it.total, 0)
      const kargo = araToplam >= UCRETSIZ_KARGO_ESIGI ? 0 : KARGO_UCRETI
      const indirim = rng.chance(0.14) ? Math.round(araToplam * rng.pick([0.05, 0.1, 0.15])) : 0
      const toplam = araToplam + kargo - indirim

      // Müşteri — %28 ihtimalle mevcut müşteri tekrar alışveriş yapar
      let musteri
      const mevcutlar = [...musteriler.values()]
      if (mevcutlar.length > 20 && rng.chance(0.28)) {
        musteri = mevcutlar[Math.floor(rng.next() * mevcutlar.length)]
      } else {
        const ad = rng.pick(AD)
        const soyad = rng.pick(SOYAD)
        const email = `${ad.toLocaleLowerCase('tr-TR')}.${soyad.toLocaleLowerCase('tr-TR')}${rng.int(11, 99)}@${rng.pick(['gmail.com', 'hotmail.com', 'outlook.com', 'yandex.com'])}`
          .replace(/[şığüöç]/g, (c) => ({ ş: 's', ı: 'i', ğ: 'g', ü: 'u', ö: 'o', ç: 'c' })[c])
        musteri = {
          id: `m-${musteriler.size + 1}`,
          name: `${ad} ${soyad}`,
          email,
          phone: `05${rng.int(30, 55)} ${rng.int(100, 999)} ${rng.int(10, 99)} ${rng.int(10, 99)}`,
          city: rng.weighted(cityWeights),
          firstOrderAt: olusturma.toISOString(),
          orderCount: 0,
          lifetime: 0,
        }
        musteriler.set(email, musteri)
      }
      musteri.orderCount += 1
      musteri.lifetime += toplam

      // Durum — yaşa göre
      const yas = gunSayisi(tarih, son)
      let durum
      if (rng.chance(0.022)) durum = rng.chance(0.6) ? 'iptal' : 'iade'
      else if (yas > 7) durum = 'teslim'
      else if (yas > 3) durum = rng.weighted([['teslim', 72], ['kargoda', 28]])
      else if (yas > 1) durum = rng.weighted([['kargoda', 58], ['hazirlaniyor', 32], ['teslim', 10]])
      else durum = rng.weighted([['yeni', 46], ['hazirlaniyor', 38], ['kargoda', 16]])

      const order = {
        id: `${orderPrefix}-${siparisNo}`,
        number: siparisNo,
        createdAt: olusturma.toISOString(),
        customer: {
          name: musteri.name,
          email: musteri.email,
          phone: musteri.phone,
          city: musteri.city,
        },
        address: `${rng.pick(['Cumhuriyet', 'Atatürk', 'İstiklal', 'Ertuğrulgazi', 'Osmangazi', 'Bahçelievler', 'Yeni'])} Mah. ${rng.pick(['Gül', 'Çınar', 'Zafer', 'Menekşe', 'Lale', 'Fatih'])} Sok. No:${rng.int(1, 84)}/${rng.int(1, 12)}, ${musteri.city}`,
        items,
        subtotal: araToplam,
        shipping: kargo,
        discount: indirim,
        total: toplam,
        status: durum,
        payment: rng.weighted(ODEME),
        channel: rng.weighted(KANALLAR),
        carrier: rng.weighted(KARGO),
        tracking: `${rng.int(100000000, 999999999)}`,
        note: rng.chance(0.09) ? rng.pick(['Hediye paketi rica ederim.', 'Kapıcıya bırakılabilir.', 'Öğleden sonra teslim edilsin.', 'Not kartına “Doğum günün kutlu olsun” yazar mısınız?']) : null,
      }

      siparisNo += 1
      orders.push(order)
      gunSiparisleri.push(order)
    }

    /* ------------------------------------ ziyaret ve görüntülenme */

    const gecerliSiparis = gunSiparisleri.filter((o) => o.status !== 'iptal')
    // Dönüşüm oranı %1.6 – %3.4 arası; ziyaret sayısını buradan geri hesaplıyoruz
    const donusum = rng.float(0.016, 0.034)
    const ziyaret = Math.max(40, Math.round(gecerliSiparis.length / donusum))
    const tekilZiyaretci = Math.round(ziyaret * rng.float(0.72, 0.84))

    // Ürün görüntülenmeleri
    const gunlukGorunum = {}
    let toplamGorunum = 0
    products.forEach((p) => {
      const taban = agirlik.get(p.id) / 100
      const v = Math.round(ziyaret * taban * ilgi.get(p.id) * rng.float(0.28, 0.46))
      gunlukGorunum[p.id] = v
      toplamGorunum += v
      urunGorunum[p.id] = (urunGorunum[p.id] ?? 0) + v
    })
    urunGunluk[key] = gunlukGorunum

    const ciro = gecerliSiparis.reduce((s, o) => s + o.total, 0)

    gunler.push({
      date: key,
      ts: tarih.getTime(),
      orders: gecerliSiparis.length,
      revenue: ciro,
      visits: ziyaret,
      visitors: tekilZiyaretci,
      pageViews: toplamGorunum + Math.round(ziyaret * rng.float(1.4, 2.2)),
      addToCart: Math.round(gecerliSiparis.length * rng.float(2.6, 4.2)),
      checkoutStart: Math.round(gecerliSiparis.length * rng.float(1.3, 1.8)),
      conversion: ziyaret ? (gecerliSiparis.length / ziyaret) * 100 : 0,
    })
  }

  /* ------------------------------------------------------ türetilenler */

  const productStats = products.map((p) => {
    const satirlar = orders
      .filter((o) => o.status !== 'iptal' && o.status !== 'iade')
      .flatMap((o) => o.items.filter((it) => it.productId === p.id))
    const adet = satirlar.reduce((s, it) => s + it.qty, 0)
    const ciro = satirlar.reduce((s, it) => s + it.total, 0)
    const gorunum = urunGorunum[p.id] ?? 0
    return {
      id: p.id,
      name: p.name,
      variant: p.variant,
      category: p.category,
      price: p.price,
      art: p.art,
      tone: p.tone,
      stock: p.stock,
      units: adet,
      revenue: ciro,
      views: gorunum,
      conversion: gorunum ? (adet / gorunum) * 100 : 0,
    }
  })

  const customers = [...musteriler.values()].sort((a, b) => b.lifetime - a.lifetime)

  // Kanal kırılımı — sipariş ve ciro bazında
  const kanalMap = new Map()
  orders
    .filter((o) => o.status !== 'iptal')
    .forEach((o) => {
      const c = kanalMap.get(o.channel) ?? { channel: o.channel, orders: 0, revenue: 0 }
      c.orders += 1
      c.revenue += o.total
      kanalMap.set(o.channel, c)
    })
  const channels = [...kanalMap.values()].sort((a, b) => b.revenue - a.revenue)

  // Şehir kırılımı
  const sehirMap = new Map()
  orders
    .filter((o) => o.status !== 'iptal')
    .forEach((o) => {
      const c = sehirMap.get(o.customer.city) ?? { city: o.customer.city, orders: 0, revenue: 0 }
      c.orders += 1
      c.revenue += o.total
      sehirMap.set(o.customer.city, c)
    })
  const cities = [...sehirMap.values()].sort((a, b) => b.revenue - a.revenue)

  const devices = [
    { device: 'Mobil', share: 81.4 },
    { device: 'Masaüstü', share: 13.2 },
    { device: 'Tablet', share: 5.4 },
  ]

  _cache[brandId] = {
    openingDate: OPENING_DATE,
    from: baslangic,
    to: son,
    orders: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    days: gunler,
    dailyProductViews: urunGunluk,
    productStats,
    customers,
    channels,
    cities,
    devices,
  }
  return _cache[brandId]
}
