import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  Check, ChevronDown, ChevronRight, Gift, Minus, Plus, RotateCcw, ShoppingBag, Truck,
} from 'lucide-react'

import { useStore } from '../store/StoreContext'
import { relatedProducts } from '../data/catalog'
import { money } from '../lib/format'
import { UCRETSIZ_KARGO_ESIGI } from '../data/generate'
import ProductImage from '../components/ui/ProductImage'
import ProductCard from '../components/site/ProductCard'
import { Badge, Button, Ornament, QtyStepper, Reveal } from '../components/ui/Bits'

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-line">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-[0.88rem] font-medium text-steel-900">{title}</span>
        <ChevronDown
          size={17}
          className={`text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className="grid transition-all duration-400 ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="pb-5 text-[0.85rem] leading-relaxed text-muted">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default function ProductDetail() {
  const { slug } = useParams()
  const { products, addToCart } = useStore()
  const [qty, setQty] = useState(1)

  const product = products.find((p) => p.slug === slug)

  // Aynı ürünün farklı gramajları — varyant seçici için
  const variants = useMemo(
    () => (product ? products.filter((p) => p.name === product.name) : []),
    [products, product]
  )

  const related = useMemo(() => relatedProducts(products, product, 4), [products, product])

  if (!product) return <Navigate to="/magaza" replace />

  const discounted = product.compareAt && product.compareAt > product.price
  const soldOut = product.stock === 0
  const lowStock = product.stock > 0 && product.stock <= 12

  return (
    <>
      {/* kırıntı yolu */}
      <div className="shell flex items-center gap-1.5 py-5 text-[0.75rem] text-muted">
        <Link to="/" className="transition hover:text-steel-800">Anasayfa</Link>
        <ChevronRight size={13} className="text-faint" />
        <Link to="/magaza" className="transition hover:text-steel-800">Mağaza</Link>
        <ChevronRight size={13} className="text-faint" />
        <Link
          to={`/magaza?kategori=${encodeURIComponent(product.category)}`}
          className="transition hover:text-steel-800"
        >
          {product.category}
        </Link>
        <ChevronRight size={13} className="text-faint" />
        <span className="truncate text-ink-soft">{product.name}</span>
      </div>

      <section className="shell grid grid-cols-1 gap-12 pb-16 lg:grid-cols-2 lg:gap-16">
        {/* -------------------------------------------------- görseller */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative overflow-hidden rounded-3xl bg-mist ring-1 ring-line">
            <ProductImage art={product.art} tone={product.tone} title={product.name} className="aspect-square w-full" />
            <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
              {product.badge && (
                <Badge tone={product.badge === 'Yeni' ? 'steel' : 'crimson'}>{product.badge}</Badge>
              )}
              {discounted && (
                <Badge tone="clay">
                  %{Math.round((1 - product.price / product.compareAt) * 100)} indirim
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-3">
            {[product.art, 'cups', 'giftset', product.art].map((art, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-xl bg-mist ring-1 transition ${
                  i === 0 ? 'ring-crimson/60' : 'ring-line hover:ring-crimson/40'
                }`}
              >
                <ProductImage
                  art={art}
                  tone={i === 0 ? product.tone : ['steel', 'crimson', 'copper', 'clay'][i]}
                  className="aspect-square w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------- bilgiler */}
        <div>
          <p className="eyebrow">{product.category}</p>
          <h1 className="mt-3 text-[2.2rem] leading-tight sm:text-[2.7rem]">{product.name}</h1>
          <p className="mt-2 text-[0.95rem] text-muted">{product.variant}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-[2.2rem] font-semibold tnum text-steel-900">
              {money(product.price)}
            </span>
            {discounted && (
              <span className="text-[1.05rem] tnum text-faint line-through">
                {money(product.compareAt)}
              </span>
            )}
            <span className="text-[0.75rem] text-muted">KDV dahil</span>
          </div>

          <p className="mt-6 text-[0.95rem] leading-relaxed text-ink-soft">{product.short}</p>

          {/* tat notları */}
          {product.notes?.length > 0 && (
            <div className="mt-6">
              <p className="eyebrow">Tat notları</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.notes.map((n) => (
                  <span
                    key={n}
                    className="rounded-full bg-mist px-3.5 py-1.5 text-[0.78rem] text-ink-soft ring-1 ring-line"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* varyantlar */}
          {variants.length > 1 && (
            <div className="mt-7">
              <p className="eyebrow">Gramaj</p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {variants
                  .slice()
                  .sort((a, b) => a.price - b.price)
                  .map((v) => (
                    <Link
                      key={v.id}
                      to={`/urun/${v.slug}`}
                      className={`rounded-xl border px-4 py-2.5 text-left transition ${
                        v.id === product.id
                          ? 'border-steel-800 bg-steel-50'
                          : 'border-line bg-white hover:border-crimson/60'
                      }`}
                    >
                      <span className="block text-[0.85rem] font-medium text-steel-900">{v.variant}</span>
                      <span className="block text-[0.75rem] tnum text-muted">{money(v.price)}</span>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* stok */}
          <div className="mt-7 flex items-center gap-2 text-[0.82rem]">
            {soldOut ? (
              <span className="flex items-center gap-1.5 text-clay">
                <span className="h-1.5 w-1.5 rounded-full bg-clay" /> Tükendi
              </span>
            ) : lowStock ? (
              <span className="flex items-center gap-1.5 text-[#B4633A]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#B4633A]" />
                Son {product.stock} adet
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-steel-700">
                <Check size={14} /> Stokta — bugün kargoya verilir
              </span>
            )}
          </div>

          {/* sepete ekle */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <QtyStepper value={qty} onChange={setQty} />
            <Button
              size="lg"
              disabled={soldOut}
              onClick={() => addToCart(product, qty)}
              className="min-w-52 flex-1"
            >
              <ShoppingBag size={17} />
              {soldOut ? 'Tükendi' : `Sepete ekle · ${money(product.price * qty)}`}
            </Button>
          </div>

          {/* güven satırları */}
          <ul className="mt-7 space-y-3 rounded-2xl bg-mist/70 p-5 text-[0.82rem] text-ink-soft ring-1 ring-line">
            <li className="flex gap-3">
              <Truck size={16} className="mt-0.5 shrink-0 text-steel-600" />
              <span>
                {money(UCRETSIZ_KARGO_ESIGI)} ve üzeri kargo bedava. Altındaki siparişlerde 49 ₺.
                1–3 iş gününde teslim.
              </span>
            </li>
            <li className="flex gap-3">
              <Gift size={16} className="mt-0.5 shrink-0 text-steel-600" />
              <span>Hediye paketi ve el yazısı not ücretsiz — sepette işaretleyin.</span>
            </li>
            <li className="flex gap-3">
              <RotateCcw size={16} className="mt-0.5 shrink-0 text-steel-600" />
              <span>Ambalajı açılmamış ürünlerde 14 gün içinde koşulsuz iade.</span>
            </li>
          </ul>

          {/* akordiyon */}
          <div className="mt-8">
            <Accordion title="Ürün açıklaması" defaultOpen>
              {product.description}
            </Accordion>

            {Object.keys(product.attrs ?? {}).length > 0 && (
              <Accordion title="Özellikler">
                <dl className="divide-y divide-line">
                  {Object.entries(product.attrs).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 py-2.5">
                      <dt className="text-ink-soft">{k}</dt>
                      <dd className="text-right font-medium text-steel-900">{v}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between gap-6 py-2.5">
                    <dt className="text-ink-soft">Ürün kodu</dt>
                    <dd className="text-right font-medium tnum text-steel-900">{product.sku}</dd>
                  </div>
                </dl>
              </Accordion>
            )}

            <Accordion title="Hazırlama önerisi">
              Bir fincan su, tepeleme bir tatlı kaşığı kahve. Kısık ateşte, karıştırmadan ısıtın.
              Köpük yükselmeye başlayınca fincanlara paylaştırın, cezveyi ocağa geri alıp bir kez
              daha kabartın. Kaynatmayın — kaynayan kahve köpüğünü kaybeder.
            </Accordion>

            <Accordion title="Kargo ve iade">
              Siparişler hafta içi 15:00’a kadar verildiğinde aynı gün, sonrasında ertesi iş günü
              kargoya verilir. Kavrum günleri Salı ve Cuma’dır; bu günlere denk gelen siparişler
              taze kavrumla gönderilir. Ambalajı açılmamış ürünlerde 14 gün içinde iade hakkınız
              vardır; iade kargo ücreti tarafımıza aittir.
            </Accordion>
          </div>
        </div>
      </section>

      {/* benzer ürünler */}
      {related.length > 0 && (
        <section className="border-t border-line bg-mist/50 py-16 lg:py-20">
          <div className="shell">
            <div className="text-center">
              <p className="eyebrow">Yanına yakışır</p>
              <h2 className="mt-3 text-[1.9rem] sm:text-[2.2rem]">Bunlar da ilginizi çekebilir</h2>
              <Ornament className="mt-5" width="w-16" />
            </div>
            <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
