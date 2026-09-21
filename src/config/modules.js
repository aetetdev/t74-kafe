/**
 * Modül ve paket tanımları.
 *
 * Ürün tek parça değil: her yetenek bağımsız açılıp kapanabilen bir modül.
 * Paketler bu modüllerin hazır demetleri; müşteriye "Kafe Pro" satılır ama
 * arka planda sadece modül listesi değişir. Sonradan tek modül de eklenebilir.
 *
 * Bir modül kapalıyken ilgili menü kilitli görünür ve tıklanınca yükseltme
 * ekranı çıkar — kaybolmaz. Müşterinin neyi almadığını görmesi satışa yarar.
 */

export const MODULES = {
  qrMenu: {
    id: 'qrMenu',
    name: 'QR Menü',
    short: 'Müşteri telefonundan menü ve sipariş',
    desc: 'Masadaki karekod okutulur, menü açılır, sipariş doğrudan kasaya düşer. Masa numarası sorulmaz.',
    routes: ['/menu'],
  },
  menuManager: {
    id: 'menuManager',
    name: 'Menü Yönetimi',
    short: 'Fiyat ve kalem düzenleme',
    desc: 'Fiyatı tablodan değiştirin, biten ürünü satıştan kaldırın, yeni kalem ekleyin. Değişiklik anında menüye yansır.',
    routes: ['/yonetim/menu'],
  },
  qrCodes: {
    id: 'qrCodes',
    name: 'Karekod Üretici',
    short: 'Masa karekodları ve baskı',
    desc: 'Her masa için markanıza uygun karekod kartı üretir; yazdırın ya da SVG olarak indirin.',
    routes: ['/yonetim/karekod'],
  },
  waiter: {
    id: 'waiter',
    name: 'Garson Ekranı',
    short: 'Telefondan elle sipariş',
    desc: 'Garson menüden seçip kasaya gönderir. QR menüyle aynı kuyruğa düşer.',
    routes: ['/garson'],
  },
  pos: {
    id: 'pos',
    name: 'Kasa & Adisyon',
    short: 'Sipariş–masa eşleştirme ve hesap',
    desc: 'Gelen siparişleri masaya bağlar, hesap özeti çıkarır, ödemeyi kapatır. Tablette çalışır.',
    routes: ['/kasa'],
  },
  cafeReports: {
    id: 'cafeReports',
    name: 'Kafe Raporları',
    short: 'Masa cirosu ve yoğunluk',
    desc: 'Ciro, doluluk, ortalama hesap, haftalık yoğunluk ısı haritası, menü ve garson performansı.',
    routes: ['/yonetim/kafe'],
  },
  storefront: {
    id: 'storefront',
    name: 'Online Mağaza',
    short: 'E-ticaret vitrini ve sipariş',
    desc: 'Ürün vitrini, sepet, ödeme akışı ve sipariş yönetimi. Kafede içilen ürünü eve satmanın yolu.',
    routes: ['/magaza', '/urun', '/odeme', '/siparis', '/yonetim/siparisler', '/yonetim/urunler'],
  },
  webAnalytics: {
    id: 'webAnalytics',
    name: 'Site Analitiği',
    short: 'Ziyaret, dönüşüm, huni',
    desc: 'Ziyaretçi trendi, dönüşüm hunisi, trafik kaynağı, cihaz kırılımı ve ürün ilgisi tablosu.',
    routes: ['/yonetim/analitik'],
  },
  customers: {
    id: 'customers',
    name: 'Müşteri Yönetimi',
    short: 'Müşteri listesi ve sadakat',
    desc: 'Müşteri kayıtları, yaşam boyu değer, tekrar oranı ve sadakat fırsatları.',
    routes: ['/yonetim/musteriler'],
  },
}

export const MODULE_LIST = Object.values(MODULES)

/* ------------------------------------------------------------ paketler */

const K = ['qrMenu', 'menuManager', 'qrCodes']
const KP = [...K, 'waiter', 'pos']
const KPRO = [...KP, 'cafeReports']
const KMAX = [...KPRO, 'storefront', 'webAnalytics', 'customers']

export const PLANS = [
  {
    id: 'kafe',
    name: 'Kafe',
    tagline: 'Karekod menüyle başlayın',
    setup: 12000,
    monthly: 2500,
    modules: K,
    best: 'Menüsünü dijitale taşımak isteyen, sipariş akışını değiştirmek istemeyen kafeler.',
  },
  {
    id: 'kafe-plus',
    name: 'Kafe Plus',
    tagline: 'Sipariş ve hesap yönetimi',
    setup: 20000,
    monthly: 4500,
    modules: KP,
    best: 'Garson ve kasa akışını tek sisteme almak isteyen işletmeler.',
    popular: true,
  },
  {
    id: 'kafe-pro',
    name: 'Kafe Pro',
    tagline: 'Rakamları da görün',
    setup: 28000,
    monthly: 7000,
    modules: KPRO,
    best: 'Yoğunluk, ciro ve personel performansına göre karar almak isteyenler.',
  },
  {
    id: 'kafe-pro-max',
    name: 'Kafe Pro Max',
    tagline: 'Kafe + online mağaza',
    setup: 40000,
    monthly: 11500,
    modules: KMAX,
    best: 'Ürününü paketleyip online da satan, tek panelden yönetmek isteyen markalar.',
  },
]

export const planById = (id) => PLANS.find((p) => p.id === id) ?? PLANS[1]

/** Tek tek satılan modüllerin aylık ek ücreti (paket dışı ekleme) */
export const MODULE_ADDON_PRICE = {
  qrMenu: 900,
  menuManager: 700,
  qrCodes: 500,
  waiter: 1200,
  pos: 1800,
  cafeReports: 1500,
  storefront: 3500,
  webAnalytics: 1200,
  customers: 900,
}

/** Bir yolun hangi modüle ait olduğunu bulur (en uzun eşleşme kazanır) */
export function moduleForPath(pathname) {
  let bulunan = null
  let uzunluk = -1
  MODULE_LIST.forEach((m) => {
    m.routes.forEach((r) => {
      if ((pathname === r || pathname.startsWith(`${r}/`)) && r.length > uzunluk) {
        bulunan = m
        uzunluk = r.length
      }
    })
  })
  return bulunan
}
