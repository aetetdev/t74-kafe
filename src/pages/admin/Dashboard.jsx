import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle, ArrowRight, Banknote, Eye, Flame, Lightbulb, Receipt,
  ShoppingCart, TrendingUp, Users,
} from 'lucide-react'

import { useStore } from '../../store/StoreContext'
import { useTenant } from '../../store/TenantContext'
import {
  attentionInsights, byMonth, byWeek, funnel, PERIODS, productLeaderboard,
  slicePeriod, stockAlerts, summarize,
} from '../../lib/metrics'
import { dayMonth, money, monthYear, num, pct, relative } from '../../lib/format'
import { AreaTrend, BarTrend, Donut, Funnel, RankedBars, Spark, VIZ } from '../../components/admin/charts'
import {
  ChartWithTable, DataTable, InsightCard, Panel, Segmented, StatCard, StatusPill,
} from '../../components/admin/AdminUI'
import ProductImage from '../../components/ui/ProductImage'

const GRAINS = [
  { id: 'gun', label: 'Gün' },
  { id: 'hafta', label: 'Hafta' },
  { id: 'ay', label: 'Ay' },
]

export default function Dashboard() {
  const { dataset, orders, products } = useStore()
  const { brand } = useTenant()
  const [period, setPeriod] = useState('30d')
  const [grain, setGrain] = useState('gun')

  const days = dataset.days
  const stats = useMemo(() => summarize(days, period), [days, period])
  const { current } = useMemo(() => slicePeriod(days, period), [days, period])

  /* ------------------------------------------------ grafik serisi */
  const chartRows = useMemo(() => {
    const label = (ts, g) =>
      g === 'ay' ? monthYear(ts) : g === 'hafta' ? `${dayMonth(ts)} hf.` : dayMonth(ts)
    const src = grain === 'ay' ? byMonth(current) : grain === 'hafta' ? byWeek(current) : current
    return src.map((r) => ({ ...r, label: label(r.ts, grain) }))
  }, [current, grain])

  const avgRevenue = chartRows.length
    ? chartRows.reduce((s, r) => s + r.revenue, 0) / chartRows.length
    : 0

  const sparkRows = useMemo(() => current.map((d) => ({ value: d.revenue })), [current])
  const sparkOrders = useMemo(() => current.map((d) => ({ value: d.orders })), [current])
  const sparkVisits = useMemo(() => current.map((d) => ({ value: d.visits })), [current])

  /* --------------------------------------------------- yan veriler */
  const from = current[0]?.ts ?? 0
  const to = (current.at(-1)?.ts ?? Date.now()) + 86400000

  const topProducts = useMemo(
    () => productLeaderboard(orders, from, to).slice(0, 6),
    [orders, from, to]
  )

  const insights = useMemo(() => attentionInsights(dataset.productStats), [dataset.productStats])
  const alerts = useMemo(() => stockAlerts(products, 20), [products])
  const steps = useMemo(() => funnel(current), [current])

  const channelRows = useMemo(
    () => dataset.channels.map((c) => ({ label: c.channel, value: c.revenue })),
    [dataset.channels]
  )

  const recentOrders = orders.slice(0, 7)

  /* --------------------------------------------------- yıllık özet */
  const yearly = useMemo(() => {
    const rows = byMonth(days)
    return {
      rows,
      revenue: rows.reduce((s, r) => s + r.revenue, 0),
      orders: rows.reduce((s, r) => s + r.orders, 0),
      best: [...rows].sort((a, b) => b.revenue - a.revenue)[0],
    }
  }, [days])

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------- dönem seçici */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          options={PERIODS.map((p) => ({ id: p.id, label: p.label }))}
          value={period}
          onChange={setPeriod}
        />
        <p className="text-[0.76rem] text-muted">
          {stats.comparable
            ? 'Değişimler bir önceki eşit uzunluktaki döneme göredir'
            : 'Açılıştan bugüne — karşılaştırılacak önceki dönem yok'}
        </p>
      </div>

      {/* ---------------------------------------------------- metrikler */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ciro"
          value={money(stats.revenue)}
          delta={stats.delta.revenue}
          icon={Banknote}
          chart={<Spark data={sparkRows} color={VIZ.series[0]} />}
        />
        <StatCard
          label="Sipariş"
          value={num(stats.orders)}
          delta={stats.delta.orders}
          icon={ShoppingCart}
          chart={<Spark data={sparkOrders} color={VIZ.series[1]} />}
        />
        <StatCard
          label="Ziyaret"
          value={num(stats.visits)}
          delta={stats.delta.visits}
          icon={Eye}
          hint={`${num(stats.visitors)} tekil`}
          chart={<Spark data={sparkVisits} color={VIZ.series[2]} />}
        />
        <StatCard
          label="Ortalama sepet"
          value={money(stats.aov)}
          delta={stats.delta.aov}
          icon={Receipt}
          hint={`dönüşüm ${pct(stats.conversion, 2)}`}
        />
      </div>

      {/* ------------------------------------------------------ ana grafik */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartWithTable
            title="Ciro trendi"
            subtitle={`${chartRows.length} ${grain === 'ay' ? 'ay' : grain === 'hafta' ? 'hafta' : 'gün'} · toplam ${money(stats.revenue)}`}
            action={<Segmented size="sm" options={GRAINS} value={grain} onChange={setGrain} />}
            chart={
              <AreaTrend
                data={chartRows}
                yKey="revenue"
                name="Ciro"
                kind="money"
                average={avgRevenue}
                height={280}
              />
            }
            columns={[
              { key: 'label', label: 'Dönem' },
              { key: 'orders', label: 'Sipariş', align: 'right', render: (r) => num(r.orders) },
              { key: 'revenue', label: 'Ciro', align: 'right', render: (r) => money(r.revenue) },
            ]}
            rows={chartRows}
          />
        </div>

        <ChartWithTable
          title="Sipariş adedi"
          subtitle={`Dönem toplamı ${num(stats.orders)} sipariş`}
          chart={
            <BarTrend
              data={chartRows}
              yKey="orders"
              name="Sipariş"
              kind="num"
              color={VIZ.series[0]}
              height={280}
            />
          }
          columns={[
            { key: 'label', label: 'Dönem' },
            { key: 'orders', label: 'Sipariş', align: 'right', render: (r) => num(r.orders) },
          ]}
          rows={chartRows}
        />
      </div>

      {/* -------------------------------------------------------- içgörü */}
      {insights && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <InsightCard tone="crimson" icon={Lightbulb} title="Dikkat isteyen ürün">
            <p>
              <strong className="font-semibold text-steel-900">
                {insights.underperformer.name}
              </strong>{' '}
              açılıştan bu yana{' '}
              <strong className="font-semibold tnum">{num(insights.underperformer.views)}</strong> kez
              görüntülendi ama dönüşümü{' '}
              <strong className="font-semibold tnum">{pct(insights.underperformer.conversion, 2)}</strong> —
              ortalamanın (<span className="tnum">{pct(insights.averageConversion, 2)}</span>) altında.
              Fiyat, görsel veya açıklama gözden geçirilmeli.
            </p>
          </InsightCard>

          <InsightCard tone="steel" icon={Eye} title="En çok ilgi gören">
            <p>
              <strong className="font-semibold text-steel-900">{insights.mostViewed.name}</strong>{' '}
              <span className="tnum">{num(insights.mostViewed.views)}</span> görüntülenmeyle listenin
              başında. Bu ürünü anasayfa vitrininde tutmak trafiği doğru yere yönlendiriyor.
            </p>
          </InsightCard>

          <InsightCard tone="crimson" icon={TrendingUp} title="En verimli ürün">
            <p>
              <strong className="font-semibold text-steel-900">{insights.star.name}</strong> her{' '}
              <span className="tnum">100</span> görüntülenmede{' '}
              <strong className="font-semibold tnum">{(insights.star.conversion).toFixed(1).replace('.', ',')}</strong>{' '}
              satışa dönüyor. Reklam bütçesi buraya kaydırılabilir.
            </p>
          </InsightCard>
        </div>
      )}

      {/* --------------------------------------------- ürünler & kanallar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel
          title="En çok satan ürünler"
          subtitle="Seçili dönem · ciroya göre"
          action={
            <Link
              to="/yonetim/urunler"
              className="text-[0.76rem] font-medium text-steel-800 transition hover:text-crimson-700"
            >
              Tümü
            </Link>
          }
        >
          <RankedBars
            rows={topProducts.map((p) => ({
              label: p.name,
              sub: p.variant,
              value: p.revenue,
            }))}
            kind="money"
          />
        </Panel>

        <Panel title="Trafik kaynakları" subtitle="Ciroya göre dağılım">
          <Donut rows={channelRows} kind="money" height={172} />
        </Panel>

        <Panel title="Dönüşüm hunisi" subtitle="Ziyaretten siparişe">
          <Funnel steps={steps} />
        </Panel>
      </div>

      {/* ------------------------------------------- yıllık + stok uyarısı */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartWithTable
            title="Aylık performans"
            subtitle={`Tüm dönem ${money(yearly.revenue)} · ${num(yearly.orders)} sipariş${
              yearly.best ? ` · en iyi ay ${monthYear(yearly.best.ts)}` : ''
            }`}
            chart={
              <BarTrend
                data={yearly.rows.map((r) => ({ ...r, label: monthYear(r.ts) }))}
                yKey="revenue"
                name="Ciro"
                kind="money"
                color={VIZ.series[0]}
                height={240}
              />
            }
            columns={[
              { key: 'label', label: 'Ay', render: (r) => monthYear(r.ts) },
              { key: 'orders', label: 'Sipariş', align: 'right', render: (r) => num(r.orders) },
              { key: 'revenue', label: 'Ciro', align: 'right', render: (r) => money(r.revenue) },
            ]}
            rows={yearly.rows}
          />
        </div>

        <Panel
          title="Stok uyarıları"
          subtitle={`${alerts.length} ürün eşiğin altında`}
          action={
            <Link
              to="/yonetim/urunler"
              className="text-[0.76rem] font-medium text-steel-800 transition hover:text-crimson-700"
            >
              Yönet
            </Link>
          }
        >
          {alerts.length === 0 ? (
            <p className="py-8 text-center text-[0.84rem] text-muted">Tüm ürünlerde stok yeterli.</p>
          ) : (
            <ul className="space-y-3">
              {alerts.slice(0, 7).map((a) => (
                <li key={a.id} className="flex items-center gap-3">
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                    style={{
                      background: a.level === 'critical' ? '#FBEAEA' : '#FEF6E3',
                      color: a.level === 'critical' ? VIZ.status.critical : '#8A6100',
                    }}
                  >
                    <AlertTriangle size={14} strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.82rem] font-medium text-steel-900">
                      {a.name}
                    </span>
                    <span className="block text-[0.72rem] text-muted">{a.variant}</span>
                  </span>
                  <span
                    className="shrink-0 text-[0.85rem] font-semibold tnum"
                    style={{ color: a.level === 'critical' ? VIZ.badText : '#8A6100' }}
                  >
                    {a.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* ------------------------------------------------------ son siparişler */}
      <Panel
        title="Son siparişler"
        subtitle="En yeni 7 kayıt"
        bodyClass="!px-0 !py-4"
        action={
          <Link
            to="/yonetim/siparisler"
            className="inline-flex items-center gap-1 text-[0.76rem] font-medium text-steel-800 transition hover:text-crimson-700"
          >
            Tüm siparişler <ArrowRight size={13} />
          </Link>
        }
      >
        <DataTable
          rowKey={(r) => r.id}
          rows={recentOrders}
          columns={[
            {
              key: 'id',
              label: 'Sipariş',
              render: (o) => (
                <span className="font-medium tnum text-steel-900">{o.id}</span>
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
              label: 'Ürünler',
              hideSm: true,
              render: (o) => (
                <span className="flex -space-x-2">
                  {o.items.slice(0, 3).map((it, i) => (
                    <span
                      key={i}
                      className="h-8 w-8 overflow-hidden rounded-lg bg-mist ring-2 ring-white"
                      title={it.name}
                    >
                      <ProductImage art={it.art} tone={it.tone} className="h-full w-full" />
                    </span>
                  ))}
                  {o.items.length > 3 && (
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-mist text-[0.66rem] font-semibold text-muted ring-2 ring-white">
                      +{o.items.length - 3}
                    </span>
                  )}
                </span>
              ),
            },
            {
              key: 'createdAt',
              label: 'Tarih',
              hideSm: true,
              render: (o) => <span className="text-[0.78rem] text-muted">{relative(o.createdAt)}</span>,
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
      </Panel>

      {/* ------------------------------------------------------- alt bilgi */}
      <p className="flex items-center justify-center gap-2 py-2 text-center text-[0.72rem] text-faint">
        <Flame size={13} />
        Veriler {brand.dataNote}.
      </p>
    </div>
  )
}
