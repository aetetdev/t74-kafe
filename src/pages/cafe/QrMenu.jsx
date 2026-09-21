import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, ChevronRight, Minus, Package, Plus, Search, ShoppingBag } from 'lucide-react'

import { useCafe } from '../../store/CafeContext'
import { useStore } from '../../store/StoreContext'
import { useTenant } from '../../store/TenantContext'
import { MENU_KATEGORILERI } from '../../data/cafe'
import { money } from '../../lib/format'
import { CafeGlyph, Sheet } from '../../components/cafe/CafeBits'
import { Button, Emblem } from '../../components/ui/Bits'
import ProductImage from '../../components/ui/ProductImage'

export default function QrMenu() {
  const [params] = useSearchParams()
  // Karekodun taşıdığı masa ipucu — müşteriye gösterilmez, kasaya iletilir
  const tableHint = params.get('m')
  const { submitOrder, activeMenu, menuById } = useCafe()
  const { brand } = useTenant()
  const { products } = useStore()

  const [cat, setCat] = useState(MENU_KATEGORILERI[0].id)
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState(null)
  const [qty, setQty] = useState(1)
  const [option, setOption] = useState(null)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [placed, setPlaced] = useState(null) // gönderilen sipariş

  const tabsRef = useRef(null)

  const list = useMemo(() => {
    if (query.trim()) {
      const q = query.toLocaleLowerCase('tr-TR')
      return activeMenu.filter((m) => [m.name, m.desc].join(' ').toLocaleLowerCase('tr-TR').includes(q))
    }
    return activeMenu.filter((m) => m.cat === cat)
  }, [cat, query, activeMenu])

  const cartTotal = cart.reduce((s, l) => s + l.price * l.qty, 0)
  const cartCount = cart.reduce((s, l) => s + l.qty, 0)

  const openDetail = (mi) => {
    setDetail(mi)
    setQty(1)
    setOption(mi.options?.[0] ?? null)
  }

  const addToCart = () => {
    if (!detail) return
    setCart((c) => {
      const key = `${detail.id}|${option ?? ''}`
      const idx = c.findIndex((l) => `${l.menuItemId}|${l.note ?? ''}` === key)
      if (idx >= 0) return c.map((l, i) => (i === idx ? { ...l, qty: l.qty + qty } : l))
      return [...c, { menuItemId: detail.id, name: detail.name, price: detail.price, qty, note: option }]
    })
    setDetail(null)
  }

  const send = () => {
    if (cart.length === 0) return
    const order = submitOrder({
      lines: cart.map((l) => ({ menuItemId: l.menuItemId, qty: l.qty, note: l.note })),
      source: 'QR Menü',
      tableHint,
    })
    if (!order) return
    setCart([])
    setCartOpen(false)
    setPlaced(order)
  }

  useEffect(() => {
    if (query) return
    tabsRef.current?.querySelector(`[data-cat="${cat}"]`)?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [cat, query, activeMenu])

  /* ------------------------------------------------- sipariş alındı */

  if (placed) {
    return (
      <div className="min-h-screen bg-snow">
        <div className="relative overflow-hidden bg-steel-900 px-6 pb-14 pt-16 text-center text-snow">
          <div className="grain absolute inset-0" />
          <span className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-crimson text-steel-900">
            <Check size={38} strokeWidth={2.4} />
          </span>
          <h1 className="relative mt-7 text-[2rem] leading-tight !text-snow">Siparişiniz alındı</h1>
          <p className="relative mt-3 text-[0.9rem] text-snow/70">
            Kasaya iletildi, hazırlanmaya başlıyor.
          </p>
        </div>

        <div className="mx-auto max-w-md px-5 py-8">
          <div className="rounded-2xl border-2 border-dashed border-crimson/60 bg-crimson-50/70 p-6 text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-crimson-700">
              Sipariş numaranız
            </p>
            <p className="mt-2 font-display text-[3rem] font-semibold leading-none tnum text-steel-900">
              {placed.shortNo}
            </p>
            <p className="mt-3 text-[0.82rem] leading-relaxed text-ink-soft">
              Görevli masanıza geldiğinde bu numarayı söylemeniz yeterli.
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-line bg-white p-5">
            <p className="eyebrow">Sipariş özeti</p>
            <ul className="mt-3 divide-y divide-line">
              {placed.items.map((it, i) => (
                <li key={i} className="flex items-center gap-3 py-2.5">
                  <CafeGlyph cat={menuById(it.menuItemId)?.cat} size={38} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.86rem] font-medium text-steel-900">
                      {it.qty}× {it.name}
                    </span>
                    {it.note && <span className="block text-[0.74rem] text-muted">{it.note}</span>}
                  </span>
                  <span className="text-[0.86rem] font-semibold tnum text-steel-900">
                    {money(it.total)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
              <span className="text-[0.9rem] font-medium text-ink-soft">Toplam</span>
              <span className="font-display text-[1.5rem] font-semibold tnum text-steel-900">
                {money(placed.total)}
              </span>
            </div>
            <p className="mt-2 text-center text-[0.7rem] text-faint">
              Ödeme masada alınır. Bu demoda tahsilat yapılmaz.
            </p>
          </div>

          {/* online mağaza köprüsü */}
          <div className="mt-5 overflow-hidden rounded-2xl bg-steel-800 p-5 text-snow">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-crimson-400">
              Beklerken
            </p>
            <h2 className="mt-2 text-[1.3rem] leading-snug !text-snow">
              Beğendiğiniz kahveyi eve götürün
            </h2>
            <p className="mt-2 text-[0.84rem] leading-relaxed text-snow/70">
              Burada içtiğiniz harmanların paketlisi online mağazamızda. Kapınıza gönderiyoruz.
            </p>
            <Button as={Link} to="/magaza" variant="crimson" size="sm" className="mt-4">
              Online mağazaya git <ArrowRight size={15} />
            </Button>
          </div>

          <button
            onClick={() => setPlaced(null)}
            className="mt-6 w-full rounded-full border border-line bg-white py-3 text-[0.86rem] font-medium text-steel-800 transition hover:border-crimson"
          >
            Menüye dön · yeni sipariş ver
          </button>
        </div>
      </div>
    )
  }

  /* ---------------------------------------------------------- menü */

  return (
    <div className="min-h-screen bg-snow pb-28">
      <header className="relative overflow-hidden bg-steel-900 px-5 pb-6 pt-7 text-snow">
        <div className="grain absolute inset-0" />
        <div className="relative mx-auto flex max-w-lg items-center gap-3">
          <Emblem className="h-11 w-11 shrink-0" ink="#F6F7F8" />
          <div className="min-w-0">
            <p className="font-display text-[1.25rem] font-semibold leading-none">{brand.shortName}</p>
            <p className="mt-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-crimson-400">
              {brand.badge}
            </p>
          </div>
        </div>
        <p className="relative mx-auto mt-4 max-w-lg text-[0.84rem] leading-relaxed text-snow/65">
          Menüden seçin, siparişinizi buradan gönderin. Görevli hazırlayıp masanıza getirir.
        </p>
      </header>

      {/* arama + kategoriler */}
      <div className="sticky top-0 z-30 border-b border-line bg-snow/95 backdrop-blur-lg">
        <div className="mx-auto max-w-lg px-5 pt-3">
          <label className="relative block">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Menüde ara…"
              className="h-10 w-full rounded-full border border-line bg-white pl-10 pr-4 text-[0.85rem] outline-none transition placeholder:text-faint focus:border-crimson/60"
            />
          </label>
        </div>

        {!query && (
          <div ref={tabsRef} className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-5 pb-3">
            {MENU_KATEGORILERI.map((c) => (
              <button
                key={c.id}
                data-cat={c.id}
                onClick={() => setCat(c.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-[0.8rem] font-medium transition ${
                  cat === c.id ? 'bg-steel-800 text-snow' : 'bg-white text-ink-soft ring-1 ring-line'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="mx-auto max-w-lg px-5 py-5">
        {!query && (
          <h2 className="mb-4 text-[1.4rem]">{MENU_KATEGORILERI.find((c) => c.id === cat)?.name}</h2>
        )}

        <ul className="space-y-2.5">
          {list.map((mi) => (
            <li key={mi.id}>
              <button
                onClick={() => openDetail(mi)}
                className="flex w-full items-start gap-3.5 rounded-2xl border border-line bg-white p-3.5 text-left transition active:scale-[0.99] hover:border-crimson/50"
              >
                <CafeGlyph cat={mi.cat} size={46} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-[0.95rem] font-medium text-steel-900">{mi.name}</span>
                    <span className="shrink-0 text-[0.95rem] font-semibold tnum text-steel-900">
                      {money(mi.price)}
                    </span>
                  </span>
                  <span className="mt-0.5 block line-clamp-2 text-[0.78rem] leading-snug text-muted">
                    {mi.desc}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {mi.popular && (
                      <span className="rounded-full bg-crimson-50 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-crimson-700">
                        Çok tercih edilen
                      </span>
                    )}
                    {mi.linkedProductId && (
                      <span className="rounded-full bg-steel-50 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-steel-700">
                        Eve götürülebilir
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {list.length === 0 && (
          <p className="py-16 text-center text-[0.88rem] text-muted">Aramanıza uyan kalem yok.</p>
        )}

        {/* online mağaza köprüsü */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-steel-800 p-5 text-snow">
          <div className="flex items-start gap-4">
            <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-snow/15">
              <ProductImage art="bag" tone="steel" className="h-full w-full" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-crimson-400">
                Online mağaza
              </p>
              <h3 className="mt-1.5 text-[1.15rem] leading-snug !text-snow">
                Online mağazamızı görmek ister misiniz?
              </h3>
              <p className="mt-1.5 text-[0.8rem] leading-relaxed text-snow/65">
                Harmanlarımız, lokum ve kolonyalarımız paketli olarak kapınıza gelsin.
              </p>
            </div>
          </div>
          <Button as={Link} to="/" variant="crimson" size="sm" className="mt-4 w-full">
            <Package size={15} /> Mağazayı keşfet <ArrowRight size={15} />
          </Button>
        </div>
      </main>

      {/* alt sipariş çubuğu */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-snow/95 px-5 py-3 backdrop-blur-lg">
        <div className="mx-auto max-w-lg">
          <button
            onClick={() => setCartOpen(true)}
            disabled={cartCount === 0}
            className="flex h-13 min-h-[3.25rem] w-full items-center justify-between gap-3 rounded-full bg-steel-800 px-5 text-snow transition disabled:opacity-40 active:scale-[0.98]"
          >
            <span className="flex items-center gap-2 text-[0.88rem] font-medium">
              <ShoppingBag size={17} />
              {cartCount > 0 ? `${cartCount} kalem seçildi` : 'Menüden seçim yapın'}
            </span>
            <span className="text-[0.95rem] font-semibold tnum">{money(cartTotal)}</span>
          </button>
        </div>
      </div>

      {/* kalem detayı */}
      <Sheet
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.name}
        footer={
          detail && (
            <div className="flex items-center gap-3">
              <div className="flex h-12 shrink-0 items-center rounded-full border border-line bg-white">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-12 w-11 place-items-center rounded-l-full text-muted"
                  aria-label="Azalt"
                >
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center text-[0.95rem] font-semibold tnum">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  className="grid h-12 w-11 place-items-center rounded-r-full text-muted"
                  aria-label="Artır"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={addToCart}
                className="h-12 flex-1 rounded-full bg-steel-800 px-5 text-[0.88rem] font-medium text-snow transition active:scale-[0.98]"
              >
                Ekle · {money(detail.price * qty)}
              </button>
            </div>
          )
        }
      >
        {detail && (
          <>
            <div className="flex items-start gap-4">
              <CafeGlyph cat={detail.cat} size={64} />
              <div className="min-w-0 flex-1">
                <p className="text-[0.88rem] leading-relaxed text-ink-soft">{detail.desc}</p>
                <p className="mt-2 text-[1.2rem] font-semibold tnum text-steel-900">
                  {money(detail.price)}
                </p>
                <p className="mt-0.5 text-[0.74rem] text-muted">
                  Ortalama hazırlık {detail.prep} dk
                </p>
              </div>
            </div>

            {detail.options && (
              <div className="mt-6">
                <p className="eyebrow">Tercih</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {detail.options.map((o) => (
                    <button
                      key={o}
                      onClick={() => setOption(o)}
                      className={`rounded-full px-3.5 py-2 text-[0.8rem] transition ${
                        option === o
                          ? 'bg-steel-800 font-medium text-snow'
                          : 'bg-white text-ink-soft ring-1 ring-line'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {detail.linkedProductId &&
              (() => {
                const p = products.find((x) => x.id === detail.linkedProductId)
                if (!p) return null
                return (
                  <Link
                    to={`/urun/${p.slug}`}
                    className="mt-6 flex items-center gap-3.5 rounded-2xl border border-dashed border-crimson/50 bg-crimson-50/60 p-3.5 transition hover:border-crimson"
                  >
                    <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-mist">
                      <ProductImage art={p.art} tone={p.tone} className="h-full w-full" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-crimson-700">
                        Bunu eve götürün
                      </span>
                      <span className="mt-0.5 block truncate text-[0.88rem] font-medium text-steel-900">
                        {p.name} · {p.variant}
                      </span>
                      <span className="block text-[0.8rem] font-semibold tnum text-steel-900">
                        {money(p.price)}
                      </span>
                    </span>
                    <ChevronRight size={17} className="shrink-0 text-crimson-700" />
                  </Link>
                )
              })()}
          </>
        )}
      </Sheet>

      {/* sipariş özeti */}
      <Sheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        title="Siparişiniz"
        footer={
          <>
            <div className="mb-3 flex items-center justify-between text-[1rem]">
              <span className="font-medium text-ink-soft">Toplam</span>
              <span className="font-semibold tnum text-steel-900">{money(cartTotal)}</span>
            </div>
            <Button size="lg" className="w-full" onClick={send} disabled={cart.length === 0}>
              Siparişi gönder
            </Button>
            <p className="mt-2.5 text-center text-[0.68rem] leading-relaxed text-faint">
              Sipariş kasaya düşer, görevli masanızı eşleştirir. Ödeme masada alınır.
            </p>
          </>
        }
      >
        {cart.length === 0 ? (
          <p className="py-10 text-center text-[0.88rem] text-muted">Henüz kalem eklemediniz.</p>
        ) : (
          <ul className="divide-y divide-line">
            {cart.map((l, i) => (
              <li key={`${l.menuItemId}-${i}`} className="flex items-center gap-3 py-3">
                <CafeGlyph cat={menuById(l.menuItemId)?.cat} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.88rem] font-medium text-steel-900">{l.name}</span>
                  {l.note && <span className="block text-[0.74rem] text-muted">{l.note}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-2.5">
                  <button
                    onClick={() =>
                      setCart((c) =>
                        c.map((x, j) => (j === i ? { ...x, qty: x.qty - 1 } : x)).filter((x) => x.qty > 0)
                      )
                    }
                    className="grid h-9 w-9 place-items-center rounded-full bg-mist text-muted"
                    aria-label="Azalt"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center text-[0.86rem] font-semibold tnum">{l.qty}</span>
                  <button
                    onClick={() => setCart((c) => c.map((x, j) => (j === i ? { ...x, qty: x.qty + 1 } : x)))}
                    className="grid h-9 w-9 place-items-center rounded-full bg-mist text-muted"
                    aria-label="Artır"
                  >
                    <Plus size={14} />
                  </button>
                  <span className="w-16 text-right text-[0.88rem] font-semibold tnum text-steel-900">
                    {money(l.price * l.qty)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Sheet>
    </div>
  )
}
