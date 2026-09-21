import { Link } from 'react-router-dom'
import {
  ArrowRight, Flame, Gift, Instagram, Package, Quote, Sprout, Truck,
} from 'lucide-react'

import { useStore } from '../store/StoreContext'
import { useTenant } from '../store/TenantContext'
import { money } from '../lib/format'
import { UCRETSIZ_KARGO_ESIGI } from '../data/generate'
import ProductCard from '../components/site/ProductCard'
import ProductImage from '../components/ui/ProductImage'
import { Badge, Button, Ornament, Reveal, SectionHead } from '../components/ui/Bits'

/* --------------------------------------------- selçuklu yıldızı deseni */

function StarPattern({ className = '', color = '#C4122F', opacity = 0.07 }) {
  return (
    <svg className={className} aria-hidden="true" style={{ opacity }}>
      <defs>
        <pattern id="seljuk" width="72" height="72" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
          <g fill="none" stroke={color} strokeWidth="1">
            <path d="M36 6 L44 20 L60 20 L52 34 L60 48 L44 48 L36 62 L28 48 L12 48 L20 34 L12 20 L28 20 Z" />
            <rect x="20" y="18" width="32" height="32" transform="rotate(45 36 34)" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#seljuk)" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */

export default function Home() {
  const { products, collections } = useStore()
  const { brand } = useTenant()
  const { hero: heroCopy, story, cta, collectionsIntro } = brand
  const featured = products.filter((p) => p.featured).slice(0, 4)
  const hero = products.find((p) => p.featured) ?? products[0]

  return (
    <>
      {/* ============================================================ HERO */}
      <section className="relative overflow-hidden bg-steel-900 text-snow">
        <div className="grain absolute inset-0" />
        <StarPattern className="absolute inset-0 h-full w-full" />
        <div
          className="absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(196,18,47,.20), transparent 65%)' }}
        />
        <div
          className="absolute -bottom-56 -left-32 h-[32rem] w-[32rem] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(100,112,126,.24), transparent 68%)' }}
        />

        <div className="shell relative grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-8 lg:py-24">
          {/* metin */}
          <div className="animate-rise">
            <p className="eyebrow !text-crimson-400">{heroCopy.eyebrow}</p>

            <h1 className="mt-6 text-[3rem] leading-[0.98] !text-snow sm:text-[4rem] lg:text-[4.6rem]">
              {heroCopy.titleTop}
              <br />
              <span className="italic text-crimson-400">{heroCopy.titleAccent}</span>
            </h1>

            <Ornament className="mt-7 !justify-start" tone="light" width="w-24" />

            <p className="mt-7 max-w-lg text-[1rem] leading-relaxed text-snow/72">
              {heroCopy.blurb}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button as={Link} to="/magaza" variant="crimson" size="lg">
                Koleksiyonu keşfet <ArrowRight size={17} />
              </Button>
              <Button as={Link} to="/hikayemiz" variant="outlineLight" size="lg">
                Hikâyemiz
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-snow/12 pt-7">
              {heroCopy.stats.map(([n, l]) => (
                <div key={l}>
                  <p className="font-display text-[1.8rem] font-semibold leading-none text-crimson-400">{n}</p>
                  <p className="mt-1.5 text-[0.72rem] tracking-wide text-snow/50">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* görsel */}
          <div className="relative animate-rise" style={{ animationDelay: '160ms' }}>
            <div className="relative mx-auto max-w-md">
              {/* halka */}
              <div className="absolute inset-[-8%] rounded-full border border-crimson/20" />
              <div className="absolute inset-[2%] rounded-full border border-crimson/12" />
              <div
                className="absolute inset-[6%] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(196,18,47,.16), transparent 62%)' }}
              />

              {/* buhar */}
              <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="animate-steam absolute block h-14 w-[3px] rounded-full bg-gradient-to-t from-transparent via-snow/50 to-transparent"
                    style={{ left: `${i * 16 - 16}px`, animationDelay: `${i * 900}ms` }}
                  />
                ))}
              </div>

              <div className="relative overflow-hidden rounded-[2rem] ring-1 ring-snow/12 lift-lg">
                <ProductImage art={hero.art} tone={hero.tone} title={hero.name} className="h-full w-full" />
              </div>

              {/* yüzen fiyat kartı */}
              <Link
                to={`/urun/${hero.slug}`}
                className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-2xl bg-snow px-4 py-3 shadow-xl transition hover:-translate-y-0.5 sm:-left-8"
              >
                <div>
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-crimson-700">
                    Çok satan
                  </p>
                  <p className="mt-0.5 text-[0.95rem] font-medium text-steel-900">{hero.name}</p>
                  <p className="text-[0.72rem] text-muted">{hero.variant} · Orta kavrum</p>
                </div>
                <span className="ml-2 rounded-full bg-steel-800 px-3 py-2 text-[0.82rem] font-semibold tnum text-snow">
                  {money(hero.price)}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================== GÜVEN ŞERİDİ */}
      <section className="border-b border-line bg-mist/70">
        <div className="shell grid grid-cols-2 gap-x-6 gap-y-7 py-8 lg:grid-cols-4">
          {[
            [Flame, 'Haftada iki kez kavrum', 'Sipariş öncesi değil, sipariş için kavurur'],
            [Truck, `${money(UCRETSIZ_KARGO_ESIGI)} üzeri kargo bedava`, '1–3 iş gününde kapınızda'],
            [Gift, 'Hediye paketi ücretsiz', 'El yazısı notunuzu biz yazalım'],
            [Sprout, 'Doğrudan üreticiden', 'Aracı yok, kendi kavurduğumuz çekirdek'],
          ].map(([Icon, title, blurb], i) => (
            <Reveal key={title} delay={i * 80} className="flex gap-3.5">
              <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-steel-700 ring-1 ring-line">
                <Icon size={17} strokeWidth={1.6} />
              </span>
              <div>
                <p className="text-[0.84rem] font-semibold leading-tight text-steel-900">{title}</p>
                <p className="mt-1 text-[0.76rem] leading-snug text-muted">{blurb}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ==================================================== ÖNE ÇIKANLAR */}
      <section className="shell py-20 lg:py-28">
        <Reveal>
          <SectionHead
            eyebrow={collectionsIntro.eyebrow}
            title={collectionsIntro.title}
            blurb={collectionsIntro.blurb}
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 flex justify-center">
          <Button as={Link} to="/magaza" variant="outline" size="lg">
            Tüm ürünleri gör <ArrowRight size={16} />
          </Button>
        </Reveal>
      </section>

      {/* ==================================================== KOLEKSİYONLAR */}
      <section className="border-y border-line bg-mist/50 py-20 lg:py-24">
        <div className="shell">
          <Reveal>
            <SectionHead eyebrow="Koleksiyonlar" title="Neyi arıyorsanız" align="left" />
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {collections.map((c, i) => {
              const sample = products.find((p) => p.collection === c.slug) ?? products[i]
              return (
                <Reveal key={c.slug} delay={i * 110}>
                  <Link
                    to={`/magaza?koleksiyon=${c.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-line transition duration-500 hover:ring-crimson/50 lift hover:lift-lg"
                  >
                    <div className="relative aspect-[16/11] overflow-hidden bg-mist">
                      <ProductImage
                        art={sample?.art}
                        tone={sample?.tone}
                        className="h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.07]"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-steel-950/45 to-transparent" />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-crimson-700">
                        {c.tagline}
                      </p>
                      <h3 className="mt-2 text-[1.35rem] leading-snug">{c.name}</h3>
                      <p className="mt-3 flex-1 text-[0.83rem] leading-relaxed text-muted">{c.blurb}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-steel-800">
                        Koleksiyona bak
                        <ArrowRight
                          size={15}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========================================================== HİKÂYE */}
      <section className="relative overflow-hidden bg-steel-800 py-20 text-snow lg:py-28">
        <div className="grain absolute inset-0" />
        <StarPattern className="absolute inset-0 h-full w-full" opacity={0.05} />
        <div className="shell relative grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow !text-crimson-400">{story.eyebrow}</p>
            <h2 className="mt-5 text-[2.2rem] leading-tight !text-snow sm:text-[2.8rem]">
              {story.titleTop}
              <br />
              <span className="italic text-crimson-400">{story.titleAccent}</span>
            </h2>
            <div className="mt-7 space-y-4 text-[0.95rem] leading-relaxed text-snow/72">
              {story.paragraphs.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>

            <figure className="mt-9 border-l-2 border-crimson/60 pl-6">
              <Quote size={20} className="mb-3 text-crimson-400" />
              <blockquote className="font-display text-[1.4rem] italic leading-snug text-snow/90">
                “{brand.quote.text}”
              </blockquote>
              <figcaption className="mt-3 text-[0.76rem] tracking-wide text-crimson-400">
                {brand.quote.source}
              </figcaption>
            </figure>

            <Button as={Link} to="/hikayemiz" variant="outlineLight" className="mt-9">
              Hikâyenin tamamı <ArrowRight size={15} />
            </Button>
          </Reveal>

          <Reveal delay={140}>
            <div className="grid grid-cols-2 gap-4">
              {['cezve', 'lokum', 'kolonya', 'cups'].map((art, i) => (
                <div
                  key={art}
                  className={`overflow-hidden rounded-2xl ring-1 ring-snow/12 ${i % 2 ? 'translate-y-7' : ''}`}
                >
                  <ProductImage
                    art={art}
                    tone={['copper', 'clay', 'steel', 'crimson'][i]}
                    className="aspect-square w-full"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================================================== SÜREÇ */}
      <section className="shell py-20 lg:py-28">
        <Reveal>
          <SectionHead
            eyebrow="Nasıl işliyor"
            title="Siparişten fincana üç adım"
            blurb="Stoktan değil, siparişten kavuruyoruz. Bu yüzden paketin üstündeki tarih her zaman tazedir."
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
          {[
            [Sprout, '01', 'Harmanı seçin', 'Açık, orta ya da koyu kavrum. Öğütümü Türk kahvesi inceliğinde hazırlıyoruz.'],
            [Flame, '02', 'Biz kavuralım', 'Siparişiniz haftanın kavrum gününde, küçük partide kavrulur ve aynı gün paketlenir.'],
            [Package, '03', 'Kapınıza gelsin', 'Tek yönlü valfli, ağzı kilitli ambalajda; 1–3 iş günü içinde adresinizde.'],
          ].map(([Icon, no, title, blurb], i) => (
            <Reveal key={no} delay={i * 120} className="relative text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-steel-50 text-steel-700 ring-1 ring-steel-100">
                <Icon size={24} strokeWidth={1.4} />
              </span>
              <p className="mt-5 font-display text-[0.95rem] font-semibold tracking-[0.2em] text-crimson">
                {no}
              </p>
              <h3 className="mt-2 text-[1.3rem]">{title}</h3>
              <p className="mx-auto mt-3 max-w-xs text-[0.85rem] leading-relaxed text-muted">{blurb}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ====================================================== INSTAGRAM */}
      <section className="border-t border-line bg-mist/60 py-20">
        <div className="shell">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Instagram</p>
              <h2 className="mt-3 text-[2rem] sm:text-[2.4rem]">Ocağın başından</h2>
              <p className="mt-3 max-w-md text-[0.9rem] text-muted">
                {brand.followers} kişi burada. Kavrum günleri, mekândan kareler ve gelen mektuplar.
              </p>
            </div>
            <Button
              as="a"
              href={brand.instagramUrl}
              target="_blank"
              rel="noreferrer"
              variant="outline"
            >
              <Instagram size={16} /> {brand.instagram}
            </Button>
          </Reveal>

          <div className="mt-10 grid grid-cols-3 gap-3 md:grid-cols-6">
            {[
              ['bag', 'steel'], ['cezve', 'copper'], ['lokum', 'clay'],
              ['cups', 'crimson'], ['kolonya', 'steel'], ['hamper', 'steel'],
            ].map(([art, tone], i) => (
              <Reveal key={i} delay={i * 60}>
                <a
                  href={brand.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block aspect-square overflow-hidden rounded-xl bg-mist"
                >
                  <ProductImage
                    art={art}
                    tone={tone}
                    className="h-full w-full transition-transform duration-700 group-hover:scale-110"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-steel-950/0 text-snow opacity-0 transition-all duration-300 group-hover:bg-steel-950/45 group-hover:opacity-100">
                    <Instagram size={20} />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ CTA */}
      <section className="relative overflow-hidden bg-steel-950 py-20 text-snow">
        <StarPattern className="absolute inset-0 h-full w-full" opacity={0.06} />
        <div
          className="absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2"
          style={{ background: 'radial-gradient(ellipse at top, rgba(196,18,47,.18), transparent 70%)' }}
        />
        <Reveal className="shell relative text-center">
          <Badge tone="crimson" className="!bg-crimson/15 !text-crimson-400 !ring-crimson/30">
            {cta.badge}
          </Badge>
          <h2 className="mx-auto mt-6 max-w-2xl text-[2.1rem] leading-tight !text-snow sm:text-[2.7rem]">
            {cta.titleTop}
            <br />
            <span className="italic text-crimson-400">{cta.titleAccent}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[0.93rem] leading-relaxed text-snow/70">
            {cta.blurb}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button as={Link} to="/magaza?kategori=Hediye+Seti" variant="crimson" size="lg">
              Hediye setlerine bak <ArrowRight size={16} />
            </Button>
            <Button as={Link} to="/iletisim" variant="outlineLight" size="lg">
              Kurumsal teklif alın
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  )
}
