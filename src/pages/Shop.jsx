import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PackageSearch, Search, SlidersHorizontal, X } from 'lucide-react'

import { useStore } from '../store/StoreContext'
import { useTenant } from '../store/TenantContext'
import ProductCard from '../components/site/ProductCard'
import { Button, Empty, Ornament, Reveal } from '../components/ui/Bits'

const SORTS = [
  { id: 'featured', label: 'Öne çıkanlar' },
  { id: 'new', label: 'En yeniler' },
  { id: 'price-asc', label: 'Fiyat: artan' },
  { id: 'price-desc', label: 'Fiyat: azalan' },
  { id: 'name', label: 'İsme göre' },
]

export default function Shop() {
  const { products, categories, collections } = useStore()
  const { brand } = useTenant()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const category = params.get('kategori')
  const collection = params.get('koleksiyon')

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const clearAll = () => {
    setParams(new URLSearchParams(), { replace: true })
    setQuery('')
  }

  const activeCollection = collections.find((c) => c.slug === collection)
  const hasFilters = Boolean(category || collection || query)

  const list = useMemo(() => {
    let out = [...products]
    if (category) out = out.filter((p) => p.category === category)
    if (collection) out = out.filter((p) => p.collection === collection)
    if (query.trim()) {
      const q = query.toLocaleLowerCase('tr-TR')
      out = out.filter((p) =>
        [p.name, p.variant, p.category, p.short, ...(p.notes ?? [])]
          .join(' ')
          .toLocaleLowerCase('tr-TR')
          .includes(q)
      )
    }
    switch (sort) {
      case 'price-asc':
        out.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        out.sort((a, b) => b.price - a.price)
        break
      case 'name':
        out.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
        break
      case 'new':
        out.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        break
      default:
        out.sort((a, b) => Number(b.featured) - Number(a.featured))
    }
    return out
  }, [products, category, collection, query, sort])

  const counts = useMemo(() => {
    const map = {}
    products.forEach((p) => {
      map[p.category] = (map[p.category] ?? 0) + 1
    })
    return map
  }, [products])

  return (
    <>
      {/* başlık */}
      <section className="relative overflow-hidden border-b border-line bg-mist/60">
        <div className="shell py-14 text-center lg:py-20">
          <p className="eyebrow">{activeCollection ? 'Koleksiyon' : 'Mağaza'}</p>
          <h1 className="mt-4 text-[2.4rem] sm:text-[3.2rem]">
            {activeCollection ? activeCollection.name : category ? category : 'Tüm ürünler'}
          </h1>
          <Ornament className="mt-6" width="w-20" />
          <p className="mx-auto mt-5 max-w-xl text-[0.92rem] leading-relaxed text-muted">
            {activeCollection
              ? activeCollection.blurb
              : brand.shopBlurb}
          </p>
        </div>
      </section>

      <section className="shell py-10 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
          {/* ------------------------------------------------ filtreler */}
          <aside className={`lg:block ${filtersOpen ? 'block' : 'hidden'}`}>
            <div className="sticky top-28 space-y-8">
              <div>
                <label className="relative block">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ürün ara…"
                    className="h-11 w-full rounded-full border border-line bg-white pl-10 pr-4 text-[0.85rem] outline-none transition placeholder:text-faint focus:border-crimson/60"
                  />
                </label>
              </div>

              <div>
                <p className="eyebrow">Kategori</p>
                <ul className="mt-4 space-y-0.5">
                  <li>
                    <button
                      onClick={() => setParam('kategori', null)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[0.85rem] transition ${
                        !category ? 'bg-steel-50 font-medium text-steel-800' : 'text-ink-soft hover:bg-silver/50'
                      }`}
                    >
                      Tümü
                      <span className="text-[0.72rem] tnum text-faint">{products.length}</span>
                    </button>
                  </li>
                  {categories.map((c) => (
                    <li key={c}>
                      <button
                        onClick={() => setParam('kategori', category === c ? null : c)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[0.85rem] transition ${
                          category === c
                            ? 'bg-steel-50 font-medium text-steel-800'
                            : 'text-ink-soft hover:bg-silver/50'
                        }`}
                      >
                        {c}
                        <span className="text-[0.72rem] tnum text-faint">{counts[c] ?? 0}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="eyebrow">Koleksiyon</p>
                <ul className="mt-4 space-y-0.5">
                  {collections.map((c) => (
                    <li key={c.slug}>
                      <button
                        onClick={() => setParam('koleksiyon', collection === c.slug ? null : c.slug)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-[0.85rem] leading-snug transition ${
                          collection === c.slug
                            ? 'bg-steel-50 font-medium text-steel-800'
                            : 'text-ink-soft hover:bg-silver/50'
                        }`}
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-1.5 text-[0.8rem] text-muted underline-offset-4 transition hover:text-clay hover:underline"
                >
                  <X size={13} /> Filtreleri temizle
                </button>
              )}
            </div>
          </aside>

          {/* ---------------------------------------------------- liste */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFiltersOpen((v) => !v)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-[0.8rem] font-medium text-ink-soft lg:hidden"
                >
                  <SlidersHorizontal size={15} /> Filtrele
                </button>
                <p className="text-[0.82rem] text-muted">
                  <strong className="font-semibold tnum text-steel-900">{list.length}</strong> ürün
                </p>
              </div>

              <label className="flex items-center gap-2 text-[0.8rem] text-muted">
                Sırala
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-10 rounded-full border border-line bg-white px-4 pr-8 text-[0.82rem] text-ink-soft outline-none transition focus:border-crimson/60"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {list.length === 0 ? (
              <div className="pt-12">
                <Empty
                  icon={PackageSearch}
                  title="Aradığınız ürünü bulamadık"
                  blurb="Farklı bir kategori seçin ya da arama teriminizi değiştirin."
                  action={
                    <Button variant="outline" onClick={clearAll}>
                      Filtreleri temizle
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-12 pt-10 xl:grid-cols-3 xl:gap-x-8">
                {list.map((p, i) => (
                  <Reveal key={p.id} delay={Math.min(i, 6) * 70}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
