import { Link } from 'react-router-dom'
import { ArrowRight, Flame, Heart, Instagram, Quote, Users } from 'lucide-react'

import { useTenant } from '../store/TenantContext'
import ProductImage from '../components/ui/ProductImage'
import { Button, Emblem, Ornament, Reveal, SectionHead } from '../components/ui/Bits'

const VALUE_ICONS = [Flame, Heart, Users]

export default function About() {
  const { brand } = useTenant()
  const a = brand.about
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden bg-steel-900 py-20 text-snow lg:py-28">
        <div className="grain absolute inset-0" />
        <div
          className="absolute left-1/2 top-0 h-96 w-[46rem] -translate-x-1/2"
          style={{ background: 'radial-gradient(ellipse at top, rgba(196,18,47,.18), transparent 70%)' }}
        />
        <div className="shell relative text-center">
          <Emblem className="mx-auto h-16 w-16" ink="#F6F7F8" />
          <p className="eyebrow mt-8 !text-crimson-400">Hikâyemiz</p>
          <h1 className="mx-auto mt-5 max-w-3xl text-[2.6rem] leading-[1.05] !text-snow sm:text-[3.6rem]">
            {a.heroTitleTop}
            <br />
            <span className="italic text-crimson-400">{a.heroTitleAccent}</span>
          </h1>
          <Ornament className="mt-8" tone="light" width="w-24" />
          <p className="mx-auto mt-7 max-w-xl text-[1rem] leading-relaxed text-snow/70">
            {a.heroBlurb}
          </p>
        </div>
      </section>

      {/* söz */}
      <section className="shell py-20 lg:py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Quote size={30} className="mx-auto text-crimson" />
          <blockquote className="mt-7 font-display text-[1.7rem] italic leading-snug text-steel-900 sm:text-[2.2rem]">
            “{brand.quote.text}”
          </blockquote>
          <figcaption className="mt-6 text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-crimson-700">
            {brand.quote.source}
          </figcaption>
          <p className="mx-auto mt-8 max-w-xl text-[0.93rem] leading-relaxed text-muted">
            {a.quoteBlurb}
          </p>
        </Reveal>
      </section>

      {/* zaman çizgisi */}
      <section className="border-y border-line bg-mist/50 py-20 lg:py-24">
        <div className="shell">
          <Reveal>
            <SectionHead eyebrow="Kısaca" title="Kısa bir zaman çizgisi" />
          </Reveal>

          <ol className="relative mx-auto mt-16 max-w-2xl">
            <span className="absolute left-[5.5rem] top-2 hidden h-[calc(100%-1rem)] w-px bg-line sm:block" />
            {a.timeline.map(([year, title, blurb], i) => (
              <Reveal key={year} delay={i * 90}>
                <li className="relative grid grid-cols-1 gap-x-8 gap-y-2 pb-11 sm:grid-cols-[5.5rem_1fr]">
                  <span className="pt-0.5 font-display text-[1.1rem] font-semibold text-crimson-700 sm:text-right">
                    {year}
                  </span>
                  <span className="absolute left-[5.5rem] top-2 hidden h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-crimson ring-4 ring-mist sm:block" />
                  <div className="sm:pl-6">
                    <h3 className="text-[1.2rem]">{title}</h3>
                    <p className="mt-2 text-[0.87rem] leading-relaxed text-muted">{blurb}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* değerler */}
      <section className="shell py-20 lg:py-24">
        <Reveal>
          <SectionHead eyebrow="Nasıl çalışıyoruz" title="Üç şeye dikkat ediyoruz" />
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
          {a.values.map(([title, blurb], i) => {
            const Icon = VALUE_ICONS[i] ?? Flame
            return (
            <Reveal key={title} delay={i * 110} className="text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-steel-50 text-steel-700 ring-1 ring-steel-100">
                <Icon size={21} strokeWidth={1.5} />
              </span>
              <h3 className="mt-5 text-[1.25rem]">{title}</h3>
              <p className="mx-auto mt-3 max-w-xs text-[0.86rem] leading-relaxed text-muted">{blurb}</p>
            </Reveal>
            )
          })}
        </div>
      </section>

      {/* işletmeci */}
      <section className="border-t border-line bg-steel-800 py-20 text-snow lg:py-24">
        <div className="grain absolute inset-0" />
        <div className="shell relative grid grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <div className="grid grid-cols-2 gap-4">
              {[['bag', 'steel'], ['lokum', 'clay'], ['kolonya', 'steel'], ['cezve', 'copper']].map(
                ([art, tone], i) => (
                  <div
                    key={i}
                    className={`overflow-hidden rounded-2xl ring-1 ring-snow/12 ${i % 2 ? 'translate-y-6' : ''}`}
                  >
                    <ProductImage art={art} tone={tone} className="aspect-square w-full" />
                  </div>
                )
              )}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <p className="eyebrow !text-crimson-400">{a.ownerLabel}</p>
            <h2 className="mt-5 text-[2rem] leading-tight !text-snow sm:text-[2.5rem]">
              {a.ownerName}
            </h2>
            <div className="mt-6 space-y-4 text-[0.95rem] leading-relaxed text-snow/72">
              {a.ownerParagraphs.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button as={Link} to="/iletisim" variant="crimson">
                {a.ownerCta} <ArrowRight size={15} />
              </Button>
              <Button
                as="a"
                href={brand.instagramUrl}
                target="_blank"
                rel="noreferrer"
                variant="outlineLight"
              >
                <Instagram size={15} /> {brand.instagram}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="shell py-20 text-center lg:py-24">
        <Reveal>
          <h2 className="mx-auto max-w-xl text-[2rem] leading-tight sm:text-[2.5rem]">
            Sofranıza bir hikâye ekleyin
          </h2>
          <Ornament className="mt-6" width="w-16" />
          <Button as={Link} to="/magaza" size="lg" className="mt-8">
            Koleksiyonu keşfet <ArrowRight size={16} />
          </Button>
        </Reveal>
      </section>
    </>
  )
}
