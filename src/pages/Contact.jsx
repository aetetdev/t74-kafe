import { useState } from 'react'
import { Building2, Check, Clock, Instagram, Mail, MapPin, Phone, Send } from 'lucide-react'

import { useStore } from '../store/StoreContext'
import { useTenant } from '../store/TenantContext'
import { Button, Ornament, Reveal } from '../components/ui/Bits'

const input =
  'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[0.86rem] outline-none transition placeholder:text-faint focus:border-crimson/70 focus:ring-2 focus:ring-crimson/15'

export default function Contact() {
  const { toast } = useStore()
  const { brand } = useTenant()
  const HOURS = brand.hours
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: 'Genel', message: '' })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    setSent(true)
    toast('Mesajınız alındı — demo', 'good')
  }

  return (
    <>
      <section className="border-b border-line bg-mist/60">
        <div className="shell py-14 text-center lg:py-20">
          <p className="eyebrow">İletişim</p>
          <h1 className="mt-4 text-[2.4rem] sm:text-[3.2rem]">{brand.contact.heroTitle}</h1>
          <Ornament className="mt-6" width="w-20" />
          <p className="mx-auto mt-5 max-w-lg text-[0.93rem] leading-relaxed text-muted">
            {brand.contact.heroBlurb}
          </p>
        </div>
      </section>

      <section className="shell grid grid-cols-1 gap-12 py-16 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:py-20">
        {/* bilgiler */}
        <Reveal>
          <div className="space-y-8">
            <div>
              <p className="eyebrow">Adres</p>
              <div className="mt-4 flex gap-3.5">
                <MapPin size={18} className="mt-0.5 shrink-0 text-crimson-700" />
                <p className="text-[0.92rem] leading-relaxed text-ink-soft">
                  {brand.addressLines.map((l, i) => (
                    <span key={i}>
                      {l}
                      {i < brand.addressLines.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            <div>
              <p className="eyebrow">Ulaşın</p>
              <ul className="mt-4 space-y-3.5">
                <li className="flex items-center gap-3.5">
                  <Phone size={18} className="shrink-0 text-crimson-700" />
                  <a href={`tel:${brand.phoneHref}`} className="crimson-underline text-[0.92rem] text-ink-soft">
                    {brand.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3.5">
                  <Mail size={18} className="shrink-0 text-crimson-700" />
                  <a
                    href={`mailto:${brand.email}`}
                    className="crimson-underline text-[0.92rem] text-ink-soft"
                  >
                    {brand.email}
                  </a>
                </li>
                <li className="flex items-center gap-3.5">
                  <Instagram size={18} className="shrink-0 text-crimson-700" />
                  <a
                    href={brand.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="crimson-underline text-[0.92rem] text-ink-soft"
                  >
                    {brand.instagram}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="eyebrow">Çalışma saatleri</p>
              <dl className="mt-4 space-y-2.5">
                {HOURS.map(([day, hrs]) => (
                  <div key={day} className="flex items-center justify-between border-b border-line pb-2.5 text-[0.87rem]">
                    <dt className="flex items-center gap-2.5 text-ink-soft">
                      <Clock size={15} className="text-faint" />
                      {day}
                    </dt>
                    <dd className="font-medium tnum text-steel-900">{hrs}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl bg-steel-800 p-6 text-snow">
              <Building2 size={20} className="text-crimson-400" />
              <h3 className="mt-4 text-[1.2rem] !text-snow">{brand.contact.corporateTitle}</h3>
              <p className="mt-2.5 text-[0.85rem] leading-relaxed text-snow/70">
                {brand.contact.corporateBlurb}
              </p>
              <a
                href={`tel:${brand.phoneHref}`}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-crimson px-5 py-2.5 text-[0.82rem] font-medium text-steel-900 transition hover:bg-crimson-400"
              >
                <Phone size={15} /> Hemen arayın
              </a>
            </div>

            {/* harita yer tutucusu */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-mist ring-1 ring-line">
              <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                  <pattern id="streets" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M0 30 H60 M30 0 V60" stroke="#D5D9DE" strokeWidth="6" fill="none" />
                    <path d="M0 30 H60 M30 0 V60" stroke="#E7EAED" strokeWidth="3" fill="none" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="#EFE9DC" />
                <rect width="100%" height="100%" fill="url(#streets)" />
                <path d="M-20 140 Q 180 90 420 170" stroke="#D7E4DC" strokeWidth="18" fill="none" />
              </svg>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                <span className="relative grid h-11 w-11 place-items-center rounded-full bg-steel-800 text-snow shadow-lg">
                  <MapPin size={19} />
                  <span className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-steel-800" />
                </span>
              </div>
              <div className="absolute bottom-3 left-3 rounded-lg bg-snow/95 px-3 py-2 text-[0.72rem] text-ink-soft shadow">
                {brand.addressLines[brand.addressLines.length - 1]}
              </div>
            </div>
          </div>
        </Reveal>

        {/* form */}
        <Reveal delay={120}>
          <div className="rounded-2xl border border-line bg-white p-7 lg:p-9">
            {sent ? (
              <div className="py-14 text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-steel-50 text-steel-700">
                  <Check size={28} strokeWidth={1.6} />
                </span>
                <h2 className="mt-6 text-[1.6rem]">Mesajınız bize ulaştı</h2>
                <p className="mx-auto mt-3 max-w-sm text-[0.88rem] leading-relaxed text-muted">
                  En kısa sürede dönüş yapacağız. Acil durumlar için doğrudan arayabilirsiniz.
                </p>
                <Button variant="outline" className="mt-7" onClick={() => setSent(false)}>
                  Yeni mesaj yaz
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div>
                  <h2 className="text-[1.5rem]">Bize yazın</h2>
                  <p className="mt-2 text-[0.85rem] text-muted">
                    Formu doldurun, aynı gün dönelim.
                  </p>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-[0.76rem] font-medium text-ink-soft">Adınız</span>
                  <input required className={input} value={form.name} onChange={set('name')} placeholder="Adınız soyadınız" />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[0.76rem] font-medium text-ink-soft">E-posta</span>
                  <input required type="email" className={input} value={form.email} onChange={set('email')} placeholder="ornek@eposta.com" />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[0.76rem] font-medium text-ink-soft">Konu</span>
                  <select className={input} value={form.subject} onChange={set('subject')}>
                    {['Genel', 'Kurumsal sipariş', 'Toptan alım', 'Sipariş takibi', 'İade / değişim', 'İş birliği'].map(
                      (s) => (
                        <option key={s}>{s}</option>
                      )
                    )}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[0.76rem] font-medium text-ink-soft">Mesajınız</span>
                  <textarea
                    required
                    rows={6}
                    className={`${input} h-auto py-3 leading-relaxed`}
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Nasıl yardımcı olabiliriz?"
                  />
                </label>

                <Button type="submit" size="lg" className="w-full">
                  <Send size={16} /> Gönder
                </Button>

                <p className="text-center text-[0.7rem] text-faint">
                  Demo formu — mesaj gerçekte iletilmez.
                </p>
              </form>
            )}
          </div>
        </Reveal>
      </section>
    </>
  )
}
