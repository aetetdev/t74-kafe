/**
 * T74 Kafe ürün kataloğu — vitrin ve online mağaza bu listeden beslenir.
 */

export const CATEGORIES = [
  'Kahve',
  'Soğuk',
  'Fincan & Cezve',
  'Atıştırmalık',
  'Hediye Seti',
  'Abonelik',
]

export const COLLECTIONS = [
  {
    slug: 'harmanlar',
    name: 'Harmanlarımız',
    tagline: 'Kendi kavurduğumuz',
    blurb: 'Haftada iki kez, küçük partiler hâlinde kavurduğumuz çekirdekler.',
  },
  {
    slug: 'demleme',
    name: 'Demleme Ekipmanları',
    tagline: 'Evde de aynı tat',
    blurb: 'Cezve, fincan ve V60. Kafede kullandığımız ekipmanların aynısı.',
  },
  {
    slug: 'sofra',
    name: 'Sofra & Atıştırmalık',
    tagline: 'Kahvenin yanına',
    blurb: 'Aynı gün yaptığımız kurabiyeler ve seçtiğimiz lokumlar.',
  },
]

export const PRODUCTS = [
  {
    id: 't-ev-250', slug: 'ev-harmani-250g', name: 'Ev Harmanı', variant: '250 g',
    category: 'Kahve', collection: 'harmanlar', price: 320, compareAt: null,
    art: 'bag', tone: 'steel', badge: 'Çok Satan', featured: true, stock: 84, sku: 'T74-EV-250',
    attrs: { Kavrum: 'Orta', Çekirdek: '%100 Arabica', Öğütüm: 'Tercihinize göre' },
    notes: ['Kakao', 'Fındık', 'Karamel'],
    short: 'Orta kavrum, dengeli. Her demleme yöntemine uyar.',
    description:
      'Kafede en çok içilen harman. Brezilya ve Kolombiya çekirdeklerinin orta kavrumu; espressoda da French Press’te de dengeli çalışır. Sipariş sırasında öğütüm tercihinizi belirtin, biz ayarlayalım.',
    createdAt: '2021-04-01',
  },
  {
    id: 't-ev-1000', slug: 'ev-harmani-1kg', name: 'Ev Harmanı', variant: '1 kg',
    category: 'Kahve', collection: 'harmanlar', price: 1100, compareAt: 1280,
    art: 'bag', tone: 'steel', badge: 'Avantajlı Boy', featured: false, stock: 36, sku: 'T74-EV-1000',
    attrs: { Kavrum: 'Orta', Çekirdek: '%100 Arabica', Öğütüm: 'Tercihinize göre' },
    notes: ['Kakao', 'Fındık', 'Karamel'],
    short: 'Aynı harman, kilogram fiyatı belirgin daha uygun.',
    description:
      'Düzenli içenler ve ofisler için. Tek yönlü valfli, ağzı kilitli ambalajda gönderilir; açıldıktan sonra serin ve kuru yerde saklayın.',
    createdAt: '2021-06-10',
  },
  {
    id: 't-sabah-250', slug: 'sabah-harmani-250g', name: 'Sabah Harmanı', variant: '250 g',
    category: 'Kahve', collection: 'harmanlar', price: 340, compareAt: null,
    art: 'bag', tone: 'copper', badge: null, featured: true, stock: 62, sku: 'T74-SBH-250',
    attrs: { Kavrum: 'Açık', Çekirdek: '%100 Arabica', Öğütüm: 'Filtre inceliği' },
    notes: ['Turunçgil', 'Çiçeksi', 'Bal'],
    short: 'Açık kavrum, filtre için. Aydınlık ve canlı.',
    description:
      'Sabah servis ettiğimiz filtre kahvenin çekirdeği. Kavrum kısa tutulur, çekirdeğin kendi tatlılığı öne çıkar. V60 ve Chemex için idealdir.',
    createdAt: '2022-02-14',
  },
  {
    id: 't-yirga-250', slug: 'etiyopya-yirgacheffe-250g', name: 'Etiyopya Yirgacheffe', variant: '250 g',
    category: 'Kahve', collection: 'harmanlar', price: 420, compareAt: null,
    art: 'bag', tone: 'ink', badge: 'Tek Yöre', featured: true, stock: 24, sku: 'T74-ETH-250',
    attrs: { Kavrum: 'Açık', Rakım: '1.900 m', İşlem: 'Yıkanmış' },
    notes: ['Yasemin', 'Bergamot', 'Şeftali'],
    short: 'Tek yöre, yıkanmış. Çiçeksi ve parlak.',
    description:
      'Sınırlı parti. Yirgacheffe bölgesinin yıkanmış çekirdekleri; bardakta yasemin ve bergamot, arka planda şeftali. Sütle içilmek için değil, sade içilmek için.',
    createdAt: '2024-09-02',
  },
  {
    id: 't-coldbrew', slug: 'cold-brew-sise', name: 'Cold Brew', variant: '500 ml şişe',
    category: 'Soğuk', collection: 'harmanlar', price: 180, compareAt: null,
    art: 'serbet', tone: 'copper', badge: 'Mevsimlik', featured: false, stock: 40, sku: 'T74-CB-500',
    attrs: { Hacim: '500 ml', Demleme: '18 saat soğuk', Raf: 'Buzdolabında 7 gün' },
    notes: ['Bitter çikolata', 'Ceviz'],
    short: '18 saat soğuk demlenmiş, şişede. Buzla servis edin.',
    description:
      'Kafede demlediğimiz cold brew’un şişelenmiş hâli. Şekersizdir; sütle seyreltilerek de içilebilir. Koruyucu içermez, buzdolabında saklayın.',
    createdAt: '2023-06-01',
  },
  {
    id: 't-karakoy-set', slug: 'karakoy-seti', name: 'Karaköy Seti', variant: 'Kahve + 2 fincan',
    category: 'Hediye Seti', collection: 'harmanlar', price: 690, compareAt: 860,
    art: 'giftset', tone: 'crimson', badge: 'Hediyelik', featured: true, stock: 22, sku: 'T74-HD-SET',
    attrs: { İçerik: '250 g Ev Harmanı + 2 seramik fincan', Kutu: 'Mühürlü karton', Not: 'El yazısı kart' },
    notes: [],
    short: '250 g harman, iki seramik fincan, mühürlü kutu.',
    description:
      'Vermeye değer bir kahve. Kutunun içinde 250 gramlık Ev Harmanı ve iki seramik fincan bulunur. İsterseniz notunuzu biz el yazısıyla yazarız.',
    createdAt: '2021-12-01',
  },
  {
    id: 't-sepet', slug: 'buyuk-hediye-sepeti', name: 'Büyük Hediye Sepeti', variant: 'Kurumsal',
    category: 'Hediye Seti', collection: 'sofra', price: 1450, compareAt: 1780,
    art: 'hamper', tone: 'steel', badge: 'Kurumsal', featured: false, stock: 12, sku: 'T74-HD-SPT',
    attrs: { İçerik: '2 × 250 g harman, kurabiye, lokum, 2 fincan', Kutu: 'Ahşap sepet', Kurumsal: 'Logolu kart' },
    notes: [],
    short: 'İki harman, kurabiye, lokum ve fincan. Tek sepette.',
    description:
      'Bayram, açılış ve kurumsal hediyeler için. 10 adet ve üzeri siparişlerde logolu kart basımı ücretsizdir.',
    createdAt: '2022-11-20',
  },
  {
    id: 't-fincan-2', slug: 'seramik-fincan-seti', name: 'Seramik Fincan Seti', variant: "2'li",
    category: 'Fincan & Cezve', collection: 'demleme', price: 480, compareAt: null,
    art: 'cups', tone: 'crimson', badge: null, featured: false, stock: 30, sku: 'T74-SF-FNC2',
    attrs: { Adet: '2 fincan + 2 tabak', Malzeme: 'Stoneware', Hacim: '180 ml' },
    notes: [],
    short: 'Kafede kullandığımız fincanların aynısı.',
    description:
      'El yapımı stoneware fincanlar. Bulaşık makinesinde yıkanabilir; her biri elde sırlandığı için ton farkları normaldir.',
    createdAt: '2022-03-15',
  },
  {
    id: 't-cezve', slug: 'el-dovmesi-bakir-cezve-t74', name: 'El Dövmesi Bakır Cezve', variant: '3 kişilik',
    category: 'Fincan & Cezve', collection: 'demleme', price: 520, compareAt: null,
    art: 'cezve', tone: 'copper', badge: 'El Yapımı', featured: true, stock: 18, sku: 'T74-SF-CZV',
    attrs: { Kapasite: '3 kişilik (~180 ml)', Malzeme: 'Bakır, kalaylı iç', Sap: 'Ceviz ağacı' },
    notes: [],
    short: 'Kalaylı bakır, ceviz saplı. Ocakta ve közde.',
    description:
      'Çekiç izleri görünen, elde dövülmüş bakır cezve. İçi gıdaya uygun kalayla kaplanmıştır. İndüksiyon ocaklara uygun değildir.',
    createdAt: '2022-03-15',
  },
  {
    id: 't-v60', slug: 'v60-baslangic-seti', name: 'V60 Başlangıç Seti', variant: 'Dripper + sürahi + filtre',
    category: 'Fincan & Cezve', collection: 'demleme', price: 850, compareAt: 990,
    art: 'hamper', tone: 'ink', badge: null, featured: false, stock: 15, sku: 'T74-SF-V60',
    attrs: { İçerik: 'Seramik dripper, cam sürahi, 100 filtre', Kapasite: '600 ml', Rehber: 'Basılı tarif kartı' },
    notes: [],
    short: 'Evde filtre kahveye başlamak için gereken her şey.',
    description:
      'Seramik dripper, 600 ml cam sürahi ve 100 adet filtre kâğıdı. Kutudan basılı tarif kartı çıkar: kaç gram, kaç derece, kaç saniye.',
    createdAt: '2023-01-20',
  },
  {
    id: 't-kurabiye', slug: 'cikolatali-kurabiye-kutusu', name: 'Çikolatalı Kurabiye Kutusu', variant: '300 g',
    category: 'Atıştırmalık', collection: 'sofra', price: 220, compareAt: null,
    art: 'lokum', tone: 'ink', badge: 'Çok Satan', featured: false, stock: 48, sku: 'T74-AT-KRB',
    attrs: { Gramaj: '300 g', İçerik: 'Bitter çikolata, tereyağı', Raf: '10 gün' },
    notes: [],
    short: 'Aynı gün yapılır, ertesi güne kalmaz.',
    description:
      'Mutfağımızda her sabah yapılan çikolatalı kurabiyeler. Bitter çikolata parçaları iri bırakılır. Kargoya sabah verilir.',
    createdAt: '2021-09-05',
  },
  {
    id: 't-lokum', slug: 'fistikli-lokum-t74', name: 'Fıstıklı Lokum', variant: '250 g',
    category: 'Atıştırmalık', collection: 'sofra', price: 190, compareAt: null,
    art: 'lokum', tone: 'clay', badge: null, featured: false, stock: 55, sku: 'T74-AT-LKM',
    attrs: { Gramaj: '250 g', İçerik: 'Antep fıstığı, nişasta, şeker', Raf: '6 ay' },
    notes: [],
    short: 'Bol fıstıklı. Türk kahvesinin yanına tek parça.',
    description:
      'Gaziantep’ten getirttiğimiz, bakır kazanda çifte kavrulmuş lokum. Kafede her Türk kahvesinin yanında bundan bir parça gider.',
    createdAt: '2021-09-05',
  },
  {
    id: 't-abonelik', slug: 'aylik-kahve-aboneligi', name: 'Aylık Kahve Aboneliği', variant: 'Her ay 250 g',
    category: 'Abonelik', collection: 'harmanlar', price: 300, compareAt: 340,
    art: 'bag', tone: 'crimson', badge: 'Yeni', featured: true, stock: 100, sku: 'T74-AB-250',
    attrs: { Sıklık: 'Ayda bir', Gramaj: '250 g', İptal: 'Dilediğiniz zaman' },
    notes: [],
    short: 'Her ay taze kavrum, kapınızda. %12 indirimli.',
    description:
      'Her ayın ilk haftası kavurduğumuz partiden 250 gram gönderiyoruz. Harmanı siz seçin ya da bize bırakın; her ay farklı bir çekirdek deneyin. Kargo dahildir, dilediğiniz zaman iptal edebilirsiniz.',
    createdAt: '2025-11-01',
  },
]

/* ------------------------------------------------- marka çözümleyici */

const SET = { categories: CATEGORIES, collections: COLLECTIONS, products: PRODUCTS }

/** Aktif markanın kataloğu. Tek markalı depoda hep aynısını döndürür. */
export const catalogFor = () => SET

export const findProduct = (slug) => PRODUCTS.find((p) => p.slug === slug)
export const productById = (id) => PRODUCTS.find((p) => p.id === id)

/** Vitrindeki "Öne Çıkanlar" şeridi */
export const featuredProducts = () => PRODUCTS.filter((p) => p.featured)

/** Ürün detayında gösterilecek benzer ürünler */
export function relatedProducts(list, product, limit = 4) {
  if (!product) return []
  const scored = (list ?? PRODUCTS).filter((p) => p.id !== product.id).map((p) => ({
    p,
    score:
      (p.collection === product.collection ? 2 : 0) +
      (p.category === product.category ? 3 : 0) +
      (p.featured ? 1 : 0),
  }))
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.p)
}
