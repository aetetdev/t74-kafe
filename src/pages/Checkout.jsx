import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, CreditCard, Landmark, Lock, Package, ShieldCheck, Truck } from 'lucide-react'

import { useStore } from '../store/StoreContext'
import { useTenant } from '../store/TenantContext'
import { money } from '../lib/format'
import ProductImage from '../components/ui/ProductImage'
import { Button, Empty, Ornament } from '../components/ui/Bits'

const STEPS = ['Teslimat', 'Ödeme', 'Onay']

const IL_LISTESI = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Kocaeli', 'Konya', 'Adana',
  'Eskişehir', 'Gaziantep', 'Mersin', 'Sakarya', 'Kayseri', 'Samsun', 'Denizli',
  'Balıkesir', 'Manisa', 'Tekirdağ', 'Bilecik', 'Kütahya',
]

function Field({ label, hint, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[0.76rem] font-medium text-ink-soft">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[0.7rem] text-faint">{hint}</span>}
    </label>
  )
}

const input =
  'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[0.86rem] outline-none transition placeholder:text-faint focus:border-crimson/70 focus:ring-2 focus:ring-crimson/15'

export default function Checkout() {
  const navigate = useNavigate()
  const { cartLines, cartTotals, placeOrder } = useStore()
  const { brand } = useTenant()
  // İşletmenin kendi şehri listenin başında olsun
  const iller = [brand.city, ...IL_LISTESI.filter((i) => i !== brand.city)]
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: brand.city,
    district: '',
    address: '',
    note: '',
    payment: 'Kredi Kartı',
    gift: false,
    giftNote: '',
  })

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((x) => ({ ...x, [k]: null }))
  }

  if (cartLines.length === 0) {
    return (
      <div className="shell py-24">
        <Empty
          icon={Package}
          title="Sepetinizde ürün yok"
          blurb="Ödeme adımına geçmek için önce sepetinize ürün ekleyin."
          action={
            <Button as={Link} to="/magaza">
              Mağazaya git <ArrowRight size={15} />
            </Button>
          }
        />
      </div>
    )
  }

  const validateDelivery = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Ad gerekli'
    if (!form.lastName.trim()) e.lastName = 'Soyad gerekli'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Geçerli bir e-posta girin'
    if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Geçerli bir telefon girin'
    if (!form.district.trim()) e.district = 'İlçe gerekli'
    if (form.address.trim().length < 10) e.address = 'Açık adres girin'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (step === 0 && !validateDelivery()) return
    setStep((s) => Math.min(2, s + 1))
    window.scrollTo({ top: 0 })
  }

  const submit = () => {
    const order = placeOrder(form)
    navigate(`/siparis/${order.id}`)
  }

  return (
    <section className="shell py-10 lg:py-16">
      <div className="text-center">
        <p className="eyebrow">Sipariş</p>
        <h1 className="mt-3 text-[2.2rem] sm:text-[2.6rem]">Ödeme</h1>
        <Ornament className="mt-5" width="w-16" />
      </div>

      {/* adımlar */}
      <ol className="mx-auto mt-10 flex max-w-lg items-center">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2.5">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-[0.78rem] font-semibold transition ${
                  i < step
                    ? 'bg-steel-700 text-snow'
                    : i === step
                      ? 'bg-crimson text-steel-900'
                      : 'bg-silver text-faint'
                }`}
              >
                {i < step ? <Check size={15} /> : i + 1}
              </span>
              <span
                className={`hidden text-[0.8rem] sm:block ${
                  i <= step ? 'font-medium text-steel-900' : 'text-faint'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={`mx-3 h-px flex-1 transition-colors ${i < step ? 'bg-steel-600' : 'bg-line'}`}
              />
            )}
          </li>
        ))}
      </ol>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        {/* --------------------------------------------------- form */}
        <div>
          {step === 0 && (
            <div className="animate-fade space-y-5">
              <h2 className="text-[1.5rem]">Teslimat bilgileri</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Ad *">
                  <input className={input} value={form.firstName} onChange={set('firstName')} placeholder="Ayşe" />
                  {errors.firstName && <span className="mt-1 block text-[0.7rem] text-clay">{errors.firstName}</span>}
                </Field>
                <Field label="Soyad *">
                  <input className={input} value={form.lastName} onChange={set('lastName')} placeholder="Yılmaz" />
                  {errors.lastName && <span className="mt-1 block text-[0.7rem] text-clay">{errors.lastName}</span>}
                </Field>
                <Field label="E-posta *">
                  <input className={input} type="email" value={form.email} onChange={set('email')} placeholder="ornek@eposta.com" />
                  {errors.email && <span className="mt-1 block text-[0.7rem] text-clay">{errors.email}</span>}
                </Field>
                <Field label="Telefon *">
                  <input className={input} value={form.phone} onChange={set('phone')} placeholder="0505 000 00 00" />
                  {errors.phone && <span className="mt-1 block text-[0.7rem] text-clay">{errors.phone}</span>}
                </Field>
                <Field label="İl *">
                  <select className={input} value={form.city} onChange={set('city')}>
                    {iller.map((il) => (
                      <option key={il}>{il}</option>
                    ))}
                  </select>
                </Field>
                <Field label="İlçe *">
                  <input className={input} value={form.district} onChange={set('district')} placeholder="Merkez" />
                  {errors.district && <span className="mt-1 block text-[0.7rem] text-clay">{errors.district}</span>}
                </Field>
              </div>

              <Field label="Açık adres *">
                <textarea
                  rows={3}
                  className={`${input} h-auto py-3 leading-relaxed`}
                  value={form.address}
                  onChange={set('address')}
                  placeholder="Mahalle, sokak, bina ve daire numarası"
                />
                {errors.address && <span className="mt-1 block text-[0.7rem] text-clay">{errors.address}</span>}
              </Field>

              <Field label="Sipariş notu" hint="Kuryeye iletilmesini istediğiniz bir şey varsa yazın.">
                <input className={input} value={form.note} onChange={set('note')} placeholder="İsteğe bağlı" />
              </Field>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-mist/70 p-4 ring-1 ring-line">
                <input
                  type="checkbox"
                  checked={form.gift}
                  onChange={set('gift')}
                  className="mt-0.5 h-4 w-4 accent-[#2F3842]"
                />
                <span className="text-[0.84rem] text-ink-soft">
                  <strong className="font-medium text-steel-900">Hediye paketi istiyorum</strong> — ücretsiz.
                  Kutuya el yazısı notunuzu ekleyelim.
                </span>
              </label>

              {form.gift && (
                <Field label="Hediye notu">
                  <textarea
                    rows={2}
                    className={`${input} h-auto py-3`}
                    value={form.giftNote}
                    onChange={set('giftNote')}
                    placeholder="Kartın üstüne yazılacak mesaj"
                  />
                </Field>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade space-y-5">
              <h2 className="text-[1.5rem]">Ödeme yöntemi</h2>

              <div className="space-y-3">
                {[
                  ['Kredi Kartı', CreditCard, 'Tek çekim veya 3–9 taksit'],
                  ['Havale/EFT', Landmark, 'Hesap bilgileri sipariş sonrası e-postanıza gelir'],
                  ['Kapıda Ödeme', Truck, '+29 ₺ hizmet bedeli'],
                ].map(([id, Icon, blurb]) => (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                      form.payment === id
                        ? 'border-steel-800 bg-steel-50'
                        : 'border-line bg-white hover:border-crimson/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={form.payment === id}
                      onChange={() => setForm((f) => ({ ...f, payment: id }))}
                      className="h-4 w-4 accent-[#2F3842]"
                    />
                    <Icon size={19} className="text-steel-700" />
                    <span className="flex-1">
                      <span className="block text-[0.88rem] font-medium text-steel-900">{id}</span>
                      <span className="block text-[0.76rem] text-muted">{blurb}</span>
                    </span>
                  </label>
                ))}
              </div>

              {form.payment === 'Kredi Kartı' && (
                <div className="relative overflow-hidden rounded-2xl border border-dashed border-crimson/50 bg-crimson-50/50 p-5">
                  <span className="absolute right-4 top-4 rounded-full bg-crimson/20 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-crimson-700">
                    Demo
                  </span>
                  <p className="text-[0.8rem] leading-relaxed text-ink-soft">
                    Gerçek sürümde bu alanda <strong className="font-semibold">iyzico / PayTR</strong> ödeme
                    formu yer alacak — kart bilgisi hiçbir zaman sitede tutulmaz, doğrudan bankaya
                    iletilir. Demoda kart alanı devre dışıdır.
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-3 opacity-50 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <span className="mb-1.5 block text-[0.72rem] text-faint">Kart numarası</span>
                      <div className="flex h-11 items-center rounded-xl border border-line bg-white/70 px-3.5 text-[0.86rem] tnum text-faint">
                        •••• •••• •••• ••••
                      </div>
                    </div>
                    <div>
                      <span className="mb-1.5 block text-[0.72rem] text-faint">Son kullanma</span>
                      <div className="flex h-11 items-center rounded-xl border border-line bg-white/70 px-3.5 text-[0.86rem] text-faint">
                        AA / YY
                      </div>
                    </div>
                    <div>
                      <span className="mb-1.5 block text-[0.72rem] text-faint">CVC</span>
                      <div className="flex h-11 items-center rounded-xl border border-line bg-white/70 px-3.5 text-[0.86rem] text-faint">
                        •••
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2.5 rounded-xl bg-steel-50 p-4 text-[0.8rem] text-steel-800">
                <ShieldCheck size={18} className="shrink-0" />
                256-bit SSL. Kart bilgileriniz sunucularımızda saklanmaz.
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade space-y-6">
              <h2 className="text-[1.5rem]">Siparişi onaylayın</h2>

              <div className="rounded-2xl border border-line bg-white p-5">
                <p className="eyebrow">Teslimat adresi</p>
                <p className="mt-2.5 text-[0.88rem] font-medium text-steel-900">
                  {form.firstName} {form.lastName}
                </p>
                <p className="mt-1 text-[0.83rem] leading-relaxed text-muted">
                  {form.address}
                  <br />
                  {form.district} / {form.city}
                  <br />
                  {form.phone} · {form.email}
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-white p-5">
                <p className="eyebrow">Ödeme</p>
                <p className="mt-2.5 text-[0.88rem] font-medium text-steel-900">{form.payment}</p>
                {form.gift && (
                  <p className="mt-2 text-[0.83rem] text-muted">
                    Hediye paketi seçildi{form.giftNote ? ` — “${form.giftNote}”` : ''}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-line bg-white p-5">
                <p className="eyebrow">Ürünler</p>
                <ul className="mt-3 divide-y divide-line">
                  {cartLines.map((l) => (
                    <li key={l.productId} className="flex items-center gap-3 py-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-mist">
                        <ProductImage art={l.product.art} tone={l.product.tone} className="h-full w-full" />
                      </div>
                      <span className="flex-1 text-[0.85rem] text-ink-soft">
                        {l.product.name}{' '}
                        <span className="text-muted">
                          · {l.product.variant} × {l.qty}
                        </span>
                      </span>
                      <span className="text-[0.85rem] font-semibold tnum text-steel-900">{money(l.total)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[0.75rem] leading-relaxed text-muted">
                Siparişi tamamlayarak{' '}
                <span className="underline decoration-line underline-offset-2">
                  mesafeli satış sözleşmesini
                </span>{' '}
                ve{' '}
                <span className="underline decoration-line underline-offset-2">
                  ön bilgilendirme formunu
                </span>{' '}
                okuduğunuzu ve kabul ettiğinizi onaylarsınız.
              </p>
            </div>
          )}

          {/* gezinme */}
          <div className="mt-9 flex items-center justify-between gap-4">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft size={15} /> Geri
              </Button>
            ) : (
              <Button as={Link} to="/magaza" variant="ghost">
                <ArrowLeft size={15} /> Alışverişe dön
              </Button>
            )}

            {step < 2 ? (
              <Button size="lg" onClick={next}>
                Devam et <ArrowRight size={16} />
              </Button>
            ) : (
              <Button size="lg" variant="crimson" onClick={submit}>
                <Lock size={16} /> Siparişi tamamla · {money(cartTotals.total)}
              </Button>
            )}
          </div>
        </div>

        {/* ------------------------------------------------- özet */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-[1.15rem]">Sipariş özeti</h2>

            <ul className="mt-4 max-h-72 space-y-3.5 overflow-y-auto pr-1">
              {cartLines.map((l) => (
                <li key={l.productId} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-mist">
                    <ProductImage art={l.product.art} tone={l.product.tone} className="h-full w-full" />
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-steel-800 px-1 text-[0.62rem] font-bold text-snow">
                      {l.qty}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.82rem] font-medium text-steel-900">{l.product.name}</p>
                    <p className="text-[0.72rem] text-muted">{l.product.variant}</p>
                  </div>
                  <span className="text-[0.82rem] font-semibold tnum text-steel-900">{money(l.total)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[0.84rem]">
              <div className="flex justify-between text-muted">
                <dt>Ara toplam</dt>
                <dd className="tnum">{money(cartTotals.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Kargo</dt>
                <dd className="tnum">
                  {cartTotals.shipping === 0 ? <span className="text-steel-700">Bedava</span> : money(cartTotals.shipping)}
                </dd>
              </div>
              {form.payment === 'Kapıda Ödeme' && (
                <div className="flex justify-between text-muted">
                  <dt>Kapıda ödeme</dt>
                  <dd className="tnum">{money(29)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-3 text-[1.05rem] font-semibold text-steel-900">
                <dt>Toplam</dt>
                <dd className="tnum">
                  {money(cartTotals.total + (form.payment === 'Kapıda Ödeme' ? 29 : 0))}
                </dd>
              </div>
            </dl>

            <p className="mt-4 rounded-lg bg-crimson-50 px-3 py-2.5 text-center text-[0.7rem] leading-relaxed text-crimson-700">
              Bu bir demodur. Gerçek ödeme alınmaz, kartınızdan tahsilat yapılmaz.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
