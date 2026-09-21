import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  ArrowRight, Check, Instagram, LayoutDashboard, Mail, MapPin, Menu,
  Phone, ShoppingBag, Trash2, X,
} from 'lucide-react'

import { useStore } from '../../store/StoreContext'
import { useTenant } from '../../store/TenantContext'
import { money } from '../../lib/format'
import { UCRETSIZ_KARGO_ESIGI } from '../../data/generate'
import { Button, Emblem, Logo, Ornament, QtyStepper } from '../ui/Bits'
import ProductImage from '../ui/ProductImage'

const NAV = [
  { to: '/magaza', label: 'Mağaza' },
  { to: '/hikayemiz', label: 'Hikâyemiz' },
  { to: '/iletisim', label: 'İletişim' },
]

/* ------------------------------------------------------------- duyuru */

function AnnouncementBar() {
  const messages = [
    `${money(UCRETSIZ_KARGO_ESIGI)} ve üzeri siparişlerde kargo bizden`,
    'Siparişler haftada iki kez taze kavrulur',
    'Hediye paketi ve el yazısı not ücretsiz',
  ]
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % messages.length), 4200)
    return () => clearInterval(t)
  }, [messages.length])

  return (
    <div className="relative overflow-hidden bg-steel-900 text-snow">
      <div className="shell flex h-9 items-center justify-center">
        <p key={i} className="animate-fade text-center text-[0.7rem] tracking-[0.14em] text-snow/80">
          {messages[i]}
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- başlık */

function Header() {
  const { cartTotals, setCartOpen } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location.pathname])

  return (
    <>
      <AnnouncementBar />
      <header
        className={`sticky top-0 z-40 border-b transition-all duration-500 ${
          scrolled
            ? 'border-line bg-snow/85 backdrop-blur-xl'
            : 'border-transparent bg-snow'
        }`}
      >
        <div className="shell flex h-[4.5rem] items-center justify-between gap-6">
          <Logo />

          <nav className="hidden items-center gap-9 md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `crimson-underline text-[0.83rem] font-medium tracking-wide transition-colors ${
                    isActive ? 'text-steel-800' : 'text-ink-soft hover:text-steel-800'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              to="/yonetim"
              title="Yönetim paneli (demo)"
              className="hidden h-10 items-center gap-2 rounded-full px-3 text-[0.76rem] font-medium text-muted transition hover:bg-steel-50 hover:text-steel-800 lg:inline-flex"
            >
              <LayoutDashboard size={15} strokeWidth={1.7} />
              Panel
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="relative grid h-10 w-10 place-items-center rounded-full text-steel-800 transition hover:bg-steel-50"
              aria-label={`Sepet — ${cartTotals.count} ürün`}
            >
              <ShoppingBag size={19} strokeWidth={1.7} />
              {cartTotals.count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-crimson px-1 text-[0.63rem] font-bold text-steel-900">
                  {cartTotals.count}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full text-steel-800 transition hover:bg-steel-50 md:hidden"
              aria-label="Menü"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} strokeWidth={1.7} /> : <Menu size={20} strokeWidth={1.7} />}
            </button>
          </div>
        </div>

        {/* mobil menü */}
        <div
          className={`overflow-hidden border-t border-line bg-snow transition-[max-height] duration-400 md:hidden ${
            mobileOpen ? 'max-h-72' : 'max-h-0 border-t-0'
          }`}
        >
          <nav className="shell flex flex-col py-3">
            {[...NAV, { to: '/yonetim', label: 'Yönetim Paneli' }].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className="border-b border-line/70 py-3.5 text-[0.92rem] font-medium text-ink-soft last:border-0"
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
    </>
  )
}

/* --------------------------------------------------------- sepet çekmecesi */

function CartDrawer() {
  const { cartOpen, setCartOpen, cartLines, cartTotals, setQty, removeFromCart } = useStore()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setCartOpen(false)
    if (cartOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [cartOpen, setCartOpen])

  if (!cartOpen) return null

  const progress = Math.min(100, (cartTotals.subtotal / UCRETSIZ_KARGO_ESIGI) * 100)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="animate-scrim absolute inset-0 bg-steel-950/45 backdrop-blur-[2px]"
        onClick={() => setCartOpen(false)}
        aria-hidden="true"
      />
      <aside className="animate-drawer relative flex h-full w-full max-w-md flex-col bg-snow shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="text-xl">Sepetiniz</h2>
            <p className="mt-0.5 text-xs text-muted">{cartTotals.count} ürün</p>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-silver/60 hover:text-steel-800"
            aria-label="Sepeti kapat"
          >
            <X size={18} />
          </button>
        </div>

        {cartLines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-steel-50 text-steel-600">
              <ShoppingBag size={24} strokeWidth={1.4} />
            </span>
            <h3 className="mt-5 text-xl">Sepetiniz henüz boş</h3>
            <p className="mt-2 text-sm text-muted">
              Kavrulmuş harmanlarımıza ve sofra ürünlerimize göz atın.
            </p>
            <Button as={Link} to="/magaza" className="mt-6" onClick={() => setCartOpen(false)}>
              Mağazaya git <ArrowRight size={15} />
            </Button>
          </div>
        ) : (
          <>
            {/* ücretsiz kargo çubuğu */}
            <div className="border-b border-line bg-mist/60 px-6 py-3.5">
              {cartTotals.freeShippingGap > 0 ? (
                <p className="text-[0.76rem] text-ink-soft">
                  Kargo bedava olması için{' '}
                  <strong className="font-semibold text-steel-800">
                    {money(cartTotals.freeShippingGap)}
                  </strong>{' '}
                  daha ekleyin
                </p>
              ) : (
                <p className="flex items-center gap-1.5 text-[0.76rem] font-medium text-steel-700">
                  <Check size={14} /> Kargo bedava
                </p>
              )}
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-silver">
                <div
                  className="h-full rounded-full bg-crimson transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="divide-y divide-line">
                {cartLines.map((line) => (
                  <li key={line.productId} className="flex gap-4 py-4">
                    <Link
                      to={`/urun/${line.product.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-mist"
                    >
                      <ProductImage art={line.product.art} tone={line.product.tone} className="h-full w-full" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[0.88rem] font-medium text-steel-900">
                            {line.product.name}
                          </p>
                          <p className="text-xs text-muted">{line.product.variant}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(line.productId)}
                          className="shrink-0 text-faint transition hover:text-clay"
                          aria-label={`${line.product.name} ürününü çıkar`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between">
                        <QtyStepper
                          size="sm"
                          value={line.qty}
                          onChange={(q) => setQty(line.productId, q)}
                        />
                        <span className="text-[0.88rem] font-semibold tnum text-steel-900">
                          {money(line.total)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line bg-white px-6 py-5">
              <dl className="space-y-1.5 text-[0.84rem]">
                <div className="flex justify-between text-muted">
                  <dt>Ara toplam</dt>
                  <dd className="tnum">{money(cartTotals.subtotal)}</dd>
                </div>
                <div className="flex justify-between text-muted">
                  <dt>Kargo</dt>
                  <dd className="tnum">
                    {cartTotals.shipping === 0 ? (
                      <span className="text-steel-700">Bedava</span>
                    ) : (
                      money(cartTotals.shipping)
                    )}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2.5 text-base font-semibold text-steel-900">
                  <dt>Toplam</dt>
                  <dd className="tnum">{money(cartTotals.total)}</dd>
                </div>
              </dl>
              <Button
                as={Link}
                to="/odeme"
                size="lg"
                className="mt-4 w-full"
                onClick={() => setCartOpen(false)}
              >
                Ödemeye geç <ArrowRight size={16} />
              </Button>
              <p className="mt-2.5 text-center text-[0.68rem] text-faint">
                Bu bir demodur — gerçek ödeme alınmaz.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

/* ------------------------------------------------------------ bildirim */

function Toasts() {
  const { toasts } = useStore()
  if (!toasts.length) return null
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-rise flex items-center gap-2.5 rounded-full bg-steel-900 px-5 py-3 text-[0.82rem] text-snow shadow-xl"
        >
          {t.tone === 'good' && <Check size={15} className="text-crimson-400" />}
          {t.message}
        </div>
      ))}
    </div>
  )
}

/* --------------------------------------------------------------- altlık */

function Footer() {
  const { brand } = useTenant()
  return (
    <footer className="relative overflow-hidden bg-steel-900 text-snow">
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="shell relative py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <Emblem className="h-11 w-11" ink="#F6F7F8" />
              <div>
                <p className="font-display text-[1.35rem] font-semibold leading-none text-snow">
                  {brand.shortName}
                </p>
                <p className="mt-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.32em] text-crimson-400">
                  {brand.badge}
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-xs font-display text-lg italic leading-snug text-snow/75">
              “{brand.tagline}”
            </p>
            <a
              href={brand.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-snow/25 px-4 py-2 text-[0.78rem] text-snow/80 transition hover:border-crimson hover:text-crimson-400"
            >
              <Instagram size={15} /> {brand.instagram}
            </a>
          </div>

          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-crimson-400">
              Mağaza
            </p>
            <ul className="mt-4 space-y-2.5 text-[0.85rem] text-snow/70">
              {[
                ['Tüm ürünler', '/magaza'],
                ['Kahve', '/magaza?kategori=Kahve'],
                ['Lokum', '/magaza?kategori=Lokum'],
                ['Kolonya', '/magaza?kategori=Kolonya'],
                ['Hediye setleri', '/magaza?kategori=Hediye+Seti'],
              ].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="transition hover:text-crimson-400">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-crimson-400">
              Kurumsal
            </p>
            <ul className="mt-4 space-y-2.5 text-[0.85rem] text-snow/70">
              {[
                ['Hikâyemiz', '/hikayemiz'],
                ['İletişim', '/iletisim'],
                ['Yönetim paneli', '/yonetim'],
              ].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="transition hover:text-crimson-400">
                    {label}
                  </Link>
                </li>
              ))}
              <li className="text-snow/40">Mesafeli satış sözleşmesi</li>
              <li className="text-snow/40">İade ve teslimat</li>
            </ul>
          </div>

          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-crimson-400">
              Bize ulaşın
            </p>
            <ul className="mt-4 space-y-3 text-[0.85rem] text-snow/70">
              <li className="flex gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-crimson-400" />
                <span>
                  {brand.addressLines.map((l, i) => (
                    <span key={i}>
                      {l}
                      {i < brand.addressLines.length - 1 && <br />}
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="shrink-0 text-crimson-400" />
                <a href={`tel:${brand.phoneHref}`} className="transition hover:text-crimson-400">
                  {brand.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="shrink-0 text-crimson-400" />
                <a href={`mailto:${brand.email}`} className="transition hover:text-crimson-400">
                  {brand.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Ornament className="mt-14" tone="light" width="w-full max-w-xs" />

        <div className="mt-8 flex flex-col items-center justify-between gap-3 text-[0.72rem] text-snow/45 sm:flex-row">
          <p>© {new Date().getFullYear()} {brand.name}. Tüm hakları saklıdır.</p>
          <p className="rounded-full bg-snow/10 px-3 py-1 text-snow/60">
            {brand.demoLabel} — ödeme ve kargo entegrasyonları örneklenmiştir
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */

export default function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <Toasts />
    </div>
  )
}
