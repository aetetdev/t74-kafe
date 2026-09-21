/**
 * Marka (kiracı) tanımları.
 *
 * Ürün beyaz etiketlidir: aynı kod tabanı farklı işletmeler adına sunulabilir.
 * Markaya özgü ne varsa — isim, adres, hikâye metni, vitrin kopyası — burada
 * durur; bileşenler yalnızca bu sözleşmeyi okur.
 *
 * Bu depo T74 Kafe sürümünü taşır. Yeni bir müşteri için buraya ikinci
 * bir kayıt ve kendi katalog dosyası eklenir; kod tarafında değişiklik gerekmez.
 */

export const BRANDS = {
  t74: {
    id: 't74',
    name: 'T74 Kafe',
    shortName: 'T74',
    // Sipariş ve otomatik SKU öneki — markaya özgü, veri sızıntısını önler
    orderPrefix: 'T74',
    // Ortak kafe menüsünün markaya bakan kısmı: açıklama ve mağaza ürünü bağlantısı
    menuTweaks: {
      'm-turk': {
        desc: 'Ev Harmanı’ndan, bakır cezvede. Sade, az şekerli veya şekerli.',
        linkedProductId: 't-ev-250',
      },
      'm-filtre': { desc: 'Günün demlemesi — Sabah Harmanı.', linkedProductId: 't-sabah-250' },
      'm-coldbrew': { linkedProductId: 't-coldbrew' },
      'm-lokum': { linkedProductId: 't-lokum' },
    },
    emblemText: 'T74',
    badge: 'EST · 2019',
    city: 'İstanbul',
    demoLabel: 'Tanıtım sürümü',
    demoEmail: 'demo@t74kafe.com',
    ownerShort: 'Tolga Yaman',
    // Demo verisinin hangi aralıktan üretildiğini anlatan not
    dataNote: 'son altı aylık örnek kayıtlardır',
    productPlaceholder: 'Ev Harmanı',
    menuDescPlaceholder: 'Ev Harmanı’ndan, bakır cezvede.',
    shopBlurb:
      'Harmanlarımız, demleme ekipmanları ve kahvenin yanına gidenler. Hepsi kafede kullandığımızla aynı.',

    tagline: 'Günün en iyi molası',
    quote: { text: 'İyi kahve acele etmez.', source: 'Kapıdaki yazı' },

    address: 'Kemankeş Mah. Tersane Cad. No: 74, Karaköy / İstanbul',
    addressLines: ['Kemankeş Mah. Tersane Cad.', 'No: 74', 'Karaköy / İstanbul'],
    phone: '0212 000 74 74',
    phoneHref: '+902120007474',
    email: 'merhaba@t74kafe.com',
    instagram: '@t74kafe',
    instagramUrl: 'https://www.instagram.com/',
    followers: '8,2B',

    hero: {
      eyebrow: 'Karaköy · İstanbul',
      titleTop: 'Günün en iyi',
      titleAccent: 'molası',
      blurb:
        'Kendi kavurduğumuz çekirdekler, sabah taze demlenen filtre kahve ve acelesi olmayan bir salon. 2019’dan beri Karaköy’de aynı köşedeyiz.',
      stats: [
        ['8,2B', 'Instagram takipçisi'],
        ['%100', 'Arabica çekirdek'],
        ['2×', 'Haftalık taze kavrum'],
      ],
    },

    story: {
      eyebrow: '2019’dan beri',
      titleTop: 'Karaköy’de küçük bir salon,',
      titleAccent: 'büyük bir ısrar',
      paragraphs: [
        'Tersane Caddesi’nde 74 numarada, eski bir han girişinde başladık. Amacımız büyük bir zincir kurmak değildi; günün ortasında insanların oturup soluklanacağı bir yer açmaktı.',
        'Çekirdeklerimizi küçük partiler hâlinde, haftada iki kez kavuruyoruz. Tatlılarımız aynı gün yapılıyor. Hiçbirinde acele yok.',
      ],
    },

    about: {
      heroTitleTop: 'Bir sokak arası,',
      heroTitleAccent: 'bir fincan kahve',
      heroBlurb:
        'Karaköy’de, tersane kapısının karşısında küçük bir kafeyiz. Yaptığımız iş kahve satmak değil; günü ikiye bölen bir mola vermek.',
      quoteBlurb:
        'Bu cümleyi kapıya astık ve arkasında durduk: iyi kahve acele etmez. Çekirdek de, demleme de, sohbet de.',
      timeline: [
        ['2019', 'İlk gün', 'Tersane Caddesi 74 numarada, altı masayla açıldık. İlk hafta gelen herkese kahve ikram edildi.'],
        ['2021', 'Kendi kavrumumuz', 'Küçük bir kavurma makinesi aldık. O günden beri çekirdeklerimizi kendimiz kavuruyoruz.'],
        ['2023', 'Bahçe', 'Arka avluyu açtık. Yaz aylarının en çok tercih edilen bölümü orası oldu.'],
        ['2024', 'Paket satış', 'Harmanlarımızı paketleyip göndermeye başladık.'],
        ['Bugün', 'Aynı köşe', '8,2 bin kişi Instagram’dan takip ediyor; siparişler Türkiye geneline gidiyor.'],
      ],
      values: [
        ['Küçük parti, taze kavrum', 'Stok için değil, sipariş için kavuruyoruz. Haftada iki gün, o haftanın miktarı kadar.'],
        ['Aynı gün mutfak', 'Tatlılar sabah yapılır, ertesi güne kalmaz. Kalanı personel yer.'],
        ['Kahve bahane', 'Amaç fincanı doldurmak değil, masayı doldurmak.'],
      ],
      ownerLabel: 'İşletmeci',
      ownerName: 'Tolga Yaman',
      ownerParagraphs: [
        'Kafeyi 2019’da açtı. Öncesinde on yıl barista olarak çalıştı, sonra kendi köşesini kurmaya karar verdi.',
        '“Burada kimse siparişini vermek için beklemesin istiyorum. Sistem bunun için var” diyor.',
      ],
      ownerCta: 'Kafeye gelin',
    },

    hours: [
      ['Pazartesi — Cuma', '07:30 — 22:00'],
      ['Cumartesi', '08:30 — 23:00'],
      ['Pazar', '09:00 — 22:00'],
    ],

    contact: {
      heroTitle: 'Buyurun, bir kahve içelim',
      heroBlurb:
        'Karaköy’deyiz. Kurumsal sipariş, toptan çekirdek ya da sadece merak ettiğiniz bir şey için yazın.',
      corporateTitle: 'Kurumsal ve toptan',
      corporateBlurb:
        'Ofis aboneliği ve toptan çekirdek için özel fiyat listemiz var. 10 kg üzeri siparişlerde öğütüm ücretsizdir.',
    },

    cta: {
      badge: 'Kurumsal hediye',
      titleTop: 'Doğum gününde, teşekkürde —',
      titleAccent: 'kahve hediye edin',
      blurb:
        '10 adet ve üzeri kurumsal siparişlerde logolu kart basımı ve özel paketleme ücretsizdir.',
    },

    collectionsIntro: {
      eyebrow: 'Harmanlarımız',
      title: 'Bir harman, bir hikâye',
      blurb:
        'Her harmanı kendi kavuruyoruz. Paketin üstündeki tarih kavrum tarihidir, son kullanma tarihi değil.',
    },

    productSet: 't74',
    // Ürün görsellerindeki ambalaj yazıları
    packLabels: {
      pack: 'T74 KAFE',
      packSub: 'KAHVE',
      lokum: 'LOKUM',
      kolonya: 'KOLONYA',
      serbet: 'SOĞUK DEMLEME',
      cityLine: 'İSTANBUL',
    },
    menuNotes: {
      turkKahvesi: 'Ev Harmanı’ndan, bakır cezvede. Sade, az şekerli veya şekerli.',
      filtre: 'Günün demlemesi — Sabah Harmanı.',
      lokum: 'Fıstıklı ve gül lokumu, üçer parça.',
    },
  },

  /* ---------------------------------------------------------------- */


}

export const DEFAULT_BRAND = 't74'

export const brandById = (id) => BRANDS[id] ?? BRANDS[DEFAULT_BRAND]
