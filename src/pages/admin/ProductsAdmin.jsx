import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ExternalLink, Eye, Pencil, Plus, Search, Star, Trash2, TrendingUp,
} from 'lucide-react'

import { useStore } from '../../store/StoreContext'
import { money, num, pct } from '../../lib/format'
import { DataTable, Panel, Segmented } from '../../components/admin/AdminUI'
import { Button } from '../../components/ui/Bits'
import ProductImage from '../../components/ui/ProductImage'
import { VIZ } from '../../components/admin/charts'

export default function ProductsAdmin() {
  const { products, categories, dataset, deleteProduct, toggleFeatured, adjustStock } = useStore()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [confirming, setConfirming] = useState(null)

  const statsById = useMemo(
    () => Object.fromEntries(dataset.productStats.map((s) => [s.id, s])),
    [dataset.productStats]
  )

  const rows = useMemo(() => {
    let out = products.map((p) => ({ ...p, stats: statsById[p.id] }))
    if (category !== 'all') out = out.filter((p) => p.category === category)
    if (query.trim()) {
      const q = query.toLocaleLowerCase('tr-TR')
      out = out.filter((p) =>
        [p.name, p.variant, p.sku, p.category].join(' ').toLocaleLowerCase('tr-TR').includes(q)
      )
    }
    return out.sort((a, b) => (b.stats?.revenue ?? 0) - (a.stats?.revenue ?? 0))
  }, [products, statsById, category, query])

  const totals = useMemo(
    () => ({
      count: products.length,
      stock: products.reduce((s, p) => s + (p.stock ?? 0), 0),
      value: products.reduce((s, p) => s + (p.stock ?? 0) * p.price, 0),
      featured: products.filter((p) => p.featured).length,
    }),
    [products]
  )

  return (
    <div className="space-y-5">
      {/* özet */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Ürün sayısı', num(totals.count), 'katalogda'],
          ['Toplam stok', num(totals.stock), 'adet'],
          ['Stok değeri', money(totals.value), 'satış fiyatı üzerinden'],
          ['Vitrinde', num(totals.featured), 'anasayfada öne çıkan'],
        ].map(([label, value, hint]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-[0.74rem] font-medium uppercase tracking-[0.1em] text-muted">{label}</p>
            <p className="mt-2.5 font-display text-[1.8rem] font-semibold leading-none tnum text-steel-900">
              {value}
            </p>
            <p className="mt-1.5 text-[0.72rem] text-faint">{hint}</p>
          </div>
        ))}
      </div>

      {/* araç çubuğu */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-56 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ürün adı veya stok kodu ara…"
            className="h-10 w-full rounded-xl border border-line bg-white pl-10 pr-4 text-[0.84rem] outline-none transition placeholder:text-faint focus:border-crimson/60"
          />
        </label>
        <Button as={Link} to="/yonetim/urunler/yeni" size="sm">
          <Plus size={16} /> Yeni ürün
        </Button>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <Segmented
          options={[{ id: 'all', label: 'Tümü' }, ...categories.map((c) => ({ id: c, label: c }))]}
          value={category}
          onChange={setCategory}
        />
      </div>

      <Panel title={`${num(rows.length)} ürün`} bodyClass="!px-0 !py-4">
        <DataTable
          rowKey={(p) => p.id}
          rows={rows}
          empty="Bu filtreye uyan ürün yok"
          columns={[
            {
              key: 'name',
              label: 'Ürün',
              render: (p) => (
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-mist">
                    <ProductImage art={p.art} tone={p.tone} className="h-full w-full" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[0.85rem] font-medium text-steel-900">{p.name}</p>
                    <p className="text-[0.72rem] text-muted">
                      {p.variant} · {p.sku}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              key: 'category',
              label: 'Kategori',
              hideSm: true,
              render: (p) => <span className="text-[0.8rem] text-muted">{p.category}</span>,
            },
            {
              key: 'price',
              label: 'Fiyat',
              align: 'right',
              render: (p) => (
                <span>
                  <span className="block font-medium text-steel-900">{money(p.price)}</span>
                  {p.compareAt > p.price && (
                    <span className="block text-[0.7rem] text-faint line-through">
                      {money(p.compareAt)}
                    </span>
                  )}
                </span>
              ),
            },
            {
              key: 'stock',
              label: 'Stok',
              align: 'right',
              render: (p) => (
                <input
                  type="number"
                  min={0}
                  value={p.stock ?? 0}
                  onChange={(e) => adjustStock(p.id, Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className={`h-9 w-20 rounded-lg border bg-white px-2.5 text-right text-[0.82rem] tnum outline-none transition focus:border-crimson/70 ${
                    p.stock <= 10
                      ? 'border-[#D03B3B]/40 text-[#9A2C2C]'
                      : p.stock <= 20
                        ? 'border-[#FAB219]/60 text-[#8A6100]'
                        : 'border-line text-steel-900'
                  }`}
                />
              ),
            },
            {
              key: 'views',
              label: 'Görüntülenme',
              align: 'right',
              hideSm: true,
              render: (p) => (
                <span className="inline-flex items-center gap-1.5 text-[0.8rem] text-muted">
                  <Eye size={13} className="text-faint" />
                  {num(p.stats?.views ?? 0)}
                </span>
              ),
            },
            {
              key: 'units',
              label: 'Satış',
              align: 'right',
              hideSm: true,
              render: (p) => (
                <span>
                  <span className="block text-[0.82rem] font-medium text-steel-900">
                    {num(p.stats?.units ?? 0)}
                  </span>
                  <span
                    className="block text-[0.7rem]"
                    style={{
                      color:
                        (p.stats?.conversion ?? 0) >= 3
                          ? VIZ.goodText
                          : (p.stats?.conversion ?? 0) >= 1.5
                            ? VIZ.muted
                            : VIZ.badText,
                    }}
                  >
                    {pct(p.stats?.conversion ?? 0, 1)} dönüşüm
                  </span>
                </span>
              ),
            },
            {
              key: 'revenue',
              label: 'Ciro',
              align: 'right',
              hideSm: true,
              render: (p) => (
                <span className="font-semibold text-steel-900">{money(p.stats?.revenue ?? 0)}</span>
              ),
            },
            {
              key: 'actions',
              label: '',
              align: 'right',
              render: (p) => (
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => toggleFeatured(p.id)}
                    title={p.featured ? 'Vitrinden kaldır' : 'Vitrine ekle'}
                    className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                      p.featured
                        ? 'bg-crimson-50 text-crimson-700'
                        : 'text-faint hover:bg-mist hover:text-steel-800'
                    }`}
                  >
                    <Star size={14} fill={p.featured ? 'currentColor' : 'none'} />
                  </button>
                  <Link
                    to={`/urun/${p.slug}`}
                    target="_blank"
                    title="Mağazada gör"
                    className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-mist hover:text-steel-800"
                  >
                    <ExternalLink size={14} />
                  </Link>
                  <button
                    onClick={() => navigate(`/yonetim/urunler/${p.id}`)}
                    title="Düzenle"
                    className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-mist hover:text-steel-800"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setConfirming(p)}
                    title="Sil"
                    className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-[#FBEAEA] hover:text-[#9A2C2C]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Panel>

      {/* silme onayı */}
      {confirming && (
        <div className="fixed inset-0 z-50 grid place-items-center p-6">
          <div className="animate-scrim absolute inset-0 bg-steel-950/45" onClick={() => setConfirming(null)} />
          <div className="animate-rise relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#FBEAEA] text-[#9A2C2C]">
              <Trash2 size={18} />
            </span>
            <h3 className="mt-4 text-[1.2rem]">Ürünü silmek istiyor musunuz?</h3>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">
              <strong className="font-medium text-steel-900">
                {confirming.name} · {confirming.variant}
              </strong>{' '}
              katalogdan kaldırılacak. Bu işlem geri alınamaz — demoyu sıfırlayarak geri
              getirebilirsiniz.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirming(null)}>
                Vazgeç
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  deleteProduct(confirming.id)
                  setConfirming(null)
                }}
              >
                Sil
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="flex items-center justify-center gap-2 py-2 text-center text-[0.72rem] text-faint">
        <TrendingUp size={13} />
        Stok alanını doğrudan tablodan düzenleyebilirsiniz — değişiklik anında kaydedilir.
      </p>
    </div>
  )
}
