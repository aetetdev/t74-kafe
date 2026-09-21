import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { money } from '../../lib/format'
import { useStore } from '../../store/StoreContext'
import ProductImage from '../ui/ProductImage'
import { Badge } from '../ui/Bits'

export default function ProductCard({ product, priority = false }) {
  const { addToCart } = useStore()
  const discounted = product.compareAt && product.compareAt > product.price
  const soldOut = product.stock === 0

  return (
    <article className="group relative flex flex-col">
      <Link
        to={`/urun/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-2xl bg-mist"
      >
        <ProductImage
          art={product.art}
          tone={product.tone}
          title={product.name}
          className="h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]"
        />

        {/* üst rozetler */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.badge && (
            <Badge tone={product.badge === 'Yeni' ? 'steel' : product.badge === 'Çok Satan' ? 'crimson' : 'copper'}>
              {product.badge}
            </Badge>
          )}
          {discounted && !soldOut && (
            <Badge tone="clay">
              %{Math.round((1 - product.price / product.compareAt) * 100)} indirim
            </Badge>
          )}
        </div>

        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-snow/72 backdrop-blur-[1px]">
            <span className="rounded-full bg-steel-900 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-snow">
              Tükendi
            </span>
          </div>
        )}

        {/* hızlı ekle */}
        {!soldOut && (
          <button
            onClick={(e) => {
              e.preventDefault()
              addToCart(product, 1)
            }}
            className="absolute bottom-3 right-3 grid h-11 w-11 translate-y-3 place-items-center rounded-full bg-steel-800 text-snow opacity-0 shadow-lg transition-all duration-400 hover:bg-steel-900 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
            aria-label={`${product.name} sepete ekle`}
            title="Sepete ekle"
          >
            <Plus size={19} strokeWidth={2} />
          </button>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-crimson-700">
          {product.category}
        </p>
        <h3 className="mt-1.5 text-[1.08rem] leading-snug">
          <Link to={`/urun/${product.slug}`} className="crimson-underline">
            {product.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-[0.78rem] text-muted">{product.variant}</p>
        <p className="mt-2 line-clamp-2 text-[0.8rem] leading-relaxed text-muted">{product.short}</p>

        <div className="mt-3 flex items-baseline gap-2 pt-1">
          <span className="text-[1.05rem] font-semibold tnum text-steel-900">
            {money(product.price)}
          </span>
          {discounted && (
            <span className="text-[0.82rem] tnum text-faint line-through">
              {money(product.compareAt)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
