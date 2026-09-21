import { useMemo, useState } from 'react'
import {
  ChevronLeft, ChevronRight, Download, MapPin, Package, Phone, Search, Truck, X,
} from 'lucide-react'

import { useStore } from '../../store/StoreContext'
import { SIPARIS_DURUMLARI } from '../../data/generate'
import { dateTime, money, num } from '../../lib/format'
import { DataTable, Panel, StatusPill } from '../../components/admin/AdminUI'
import { Button } from '../../components/ui/Bits'
import ProductImage from '../../components/ui/ProductImage'

const PAGE_SIZE = 12

const STATUS_TABS = [
  { id: 'all', label: 'Tümü' },
  ...Object.entries(SIPARIS_DURUMLARI).map(([id, v]) => ({ id, label: v.label })),
]

/* ------------------------------------------------------ detay çekmecesi */

function OrderDrawer({ order, onClose }) {
  const { updateOrderStatus } = useStore()
  if (!order) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="animate-scrim absolute inset-0 bg-steel-950/40" onClick={onClose} />
      <aside className="animate-drawer relative flex h-full w-full max-w-lg flex-col bg-[#F1F3F5] shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-line bg-white px-6 py-5">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">Sipariş</p>
            <h2 className="mt-1 text-[1.4rem] tnum">{order.id}</h2>
            <p className="mt-1 text-[0.78rem] text-muted">{dateTime(order.createdAt)}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-mist hover:text-steel-800"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* durum değiştirme */}
          <Panel title="Durum" subtitle="Değişiklik anında müşteriye e-posta olarak iletilir">
            <div className="flex flex-wrap gap-2">
              {Object.entries(SIPARIS_DURUMLARI).map(([id, v]) => (
                <button
                  key={id}
                  onClick={() => updateOrderStatus(order.id, id)}
                  className={`rounded-full px-3.5 py-2 text-[0.76rem] font-medium transition ${
                    order.status === id
                      ? 'bg-steel-800 text-snow'
                      : 'bg-mist text-ink-soft hover:bg-silver'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </Panel>

          {/* müşteri */}
          <Panel title="Müşteri">
            <p className="text-[0.92rem] font-medium text-steel-900">{order.customer.name}</p>
            <ul className="mt-3 space-y-2 text-[0.82rem] text-muted">
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="shrink-0 text-faint" />
                {order.customer.phone}
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 shrink-0 text-faint" />
                {order.address}
              </li>
              <li className="flex items-center gap-2.5">
                <Truck size={14} className="shrink-0 text-faint" />
                {order.carrier} · takip no <span className="tnum">{order.tracking}</span>
              </li>
            </ul>
            {order.note && (
              <p className="mt-4 rounded-lg bg-crimson-50 px-3.5 py-2.5 text-[0.8rem] leading-relaxed text-crimson-700">
                <strong className="font-semibold">Sipariş notu:</strong> {order.note}
              </p>
            )}
          </Panel>

          {/* ürünler */}
          <Panel title="Ürünler" bodyClass="!py-3">
            <ul className="divide-y divide-line">
              {order.items.map((it) => (
                <li key={it.productId} className="flex items-center gap-3.5 py-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-mist">
                    <ProductImage art={it.art} tone={it.tone} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.85rem] font-medium text-steel-900">{it.name}</p>
                    <p className="text-[0.74rem] text-muted">
                      {it.variant} · {it.sku} · {it.qty} adet
                    </p>
                  </div>
                  <span className="text-[0.85rem] font-semibold tnum text-steel-900">
                    {money(it.total)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-2 space-y-1.5 border-t border-line pt-3 text-[0.83rem]">
              <div className="flex justify-between text-muted">
                <dt>Ara toplam</dt>
                <dd className="tnum">{money(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Kargo</dt>
                <dd className="tnum">{order.shipping === 0 ? 'Bedava' : money(order.shipping)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-muted">
                  <dt>İndirim</dt>
                  <dd className="tnum text-[#9A2C2C]">−{money(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-2.5 text-[1rem] font-semibold text-steel-900">
                <dt>Toplam</dt>
                <dd className="tnum">{money(order.total)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Ödeme ve kaynak">
            <dl className="space-y-2.5 text-[0.83rem]">
              {[
                ['Ödeme yöntemi', order.payment],
                ['Geliş kanalı', order.channel],
                ['Kargo firması', order.carrier],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-medium text-steel-900">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>

        <footer className="flex gap-3 border-t border-line bg-white px-6 py-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Kapat
          </Button>
          <Button className="flex-1" onClick={() => updateOrderStatus(order.id, 'kargoda')}>
            <Truck size={15} /> Kargoya ver
          </Button>
        </footer>
      </aside>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export default function Orders() {
  const { orders, toast } = useStore()
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    let out = orders
    if (tab !== 'all') out = out.filter((o) => o.status === tab)
    if (query.trim()) {
      const q = query.toLocaleLowerCase('tr-TR')
      out = out.filter((o) =>
        [o.id, o.customer.name, o.customer.email, o.customer.city, o.tracking]
          .join(' ')
          .toLocaleLowerCase('tr-TR')
          .includes(q)
      )
    }
    return out
  }, [orders, tab, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const rows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const counts = useMemo(() => {
    const c = { all: orders.length }
    orders.forEach((o) => {
      c[o.status] = (c[o.status] ?? 0) + 1
    })
    return c
  }, [orders])

  const totalValue = filtered
    .filter((o) => o.status !== 'iptal' && o.status !== 'iade')
    .reduce((s, o) => s + o.total, 0)

  return (
    <div className="space-y-5">
      {/* araç çubuğu */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-56 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder="Sipariş no, müşteri, şehir veya takip no ara…"
            className="h-10 w-full rounded-xl border border-line bg-white pl-10 pr-4 text-[0.84rem] outline-none transition placeholder:text-faint focus:border-crimson/60"
          />
        </label>
        <Button variant="outline" size="sm" onClick={() => toast('CSV dışa aktarma — demo')}>
          <Download size={15} /> Dışa aktar
        </Button>
      </div>

      {/* sekmeler */}
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id)
              setPage(0)
            }}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-[0.8rem] font-medium transition ${
              tab === t.id
                ? 'bg-steel-800 text-snow'
                : 'bg-white text-ink-soft ring-1 ring-line hover:ring-crimson/50'
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[0.66rem] tnum ${
                tab === t.id ? 'bg-snow/20' : 'bg-mist text-muted'
              }`}
            >
              {counts[t.id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <Panel
        title={`${num(filtered.length)} sipariş`}
        subtitle={`Toplam değer ${money(totalValue)}`}
        bodyClass="!px-0 !py-4"
      >
        <DataTable
          rowKey={(o) => o.id}
          rows={rows}
          onRowClick={setSelected}
          empty="Bu filtreye uyan sipariş yok"
          columns={[
            {
              key: 'id',
              label: 'Sipariş',
              render: (o) => (
                <span>
                  <span className="block font-medium tnum text-steel-900">{o.id}</span>
                  {o.isDemoOrder && (
                    <span className="text-[0.66rem] font-medium text-crimson-700">demo siparişi</span>
                  )}
                </span>
              ),
            },
            {
              key: 'customer',
              label: 'Müşteri',
              render: (o) => (
                <span>
                  <span className="block text-[0.82rem] text-ink-soft">{o.customer.name}</span>
                  <span className="block text-[0.72rem] text-faint">{o.customer.city}</span>
                </span>
              ),
            },
            {
              key: 'items',
              label: 'Ürün',
              hideSm: true,
              render: (o) => (
                <span className="text-[0.8rem] text-muted">
                  {o.items.reduce((s, i) => s + i.qty, 0)} adet
                </span>
              ),
            },
            {
              key: 'channel',
              label: 'Kanal',
              hideSm: true,
              render: (o) => <span className="text-[0.8rem] text-muted">{o.channel}</span>,
            },
            {
              key: 'createdAt',
              label: 'Tarih',
              hideSm: true,
              render: (o) => (
                <span className="text-[0.78rem] tnum text-muted">{dateTime(o.createdAt)}</span>
              ),
            },
            { key: 'status', label: 'Durum', render: (o) => <StatusPill status={o.status} /> },
            {
              key: 'total',
              label: 'Tutar',
              align: 'right',
              render: (o) => <span className="font-semibold text-steel-900">{money(o.total)}</span>,
            },
          ]}
        />

        {/* sayfalama */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between gap-4 border-t border-line px-5 pt-4">
            <p className="text-[0.76rem] text-muted">
              Sayfa <span className="tnum font-medium text-steel-900">{safePage + 1}</span> /{' '}
              <span className="tnum">{pageCount}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-muted transition hover:text-steel-800 disabled:opacity-35"
                aria-label="Önceki sayfa"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={safePage >= pageCount - 1}
                className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-muted transition hover:text-steel-800 disabled:opacity-35"
                aria-label="Sonraki sayfa"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Panel>

      <OrderDrawer order={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
