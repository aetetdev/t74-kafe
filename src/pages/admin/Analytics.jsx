import { useMemo, useState } from 'react'
import { Eye, MapPin, Monitor, MousePointerClick, Smartphone, Target, Users } from 'lucide-react'

import { useStore } from '../../store/StoreContext'
import { byMonth, byWeek, funnel, PERIODS, slicePeriod, summarize } from '../../lib/metrics'
import { compact, dayMonth, money, monthYear, num, pct } from '../../lib/format'
import { AreaTrend, Donut, DualLine, Funnel, RankedBars, VIZ } from '../../components/admin/charts'
import { ChartWithTable, DataTable, Panel, Segmented, StatCard } from '../../components/admin/AdminUI'
import ProductImage from '../../components/ui/ProductImage'

export default function Analytics() {
  const { dataset } = useStore()
  const [period, setPeriod] = useState('30d')

  const days = dataset.days
  const stats = useMemo(() => summarize(days, period), [days, period])
  const { current } = useMemo(() => slicePeriod(days, period), [days, period])

  const rows = useMemo(() => {
    const src = current.length > 120 ? byMonth(current) : current.length > 45 ? byWeek(current) : current
    const grain = current.length > 120 ? 'ay' : current.length > 45 ? 'hafta' : 'gun'
    return src.map((r) => ({
      ...r,
      label: grain === 'ay' ? monthYear(r.ts) : grain === 'hafta' ? `${dayMonth(r.ts)} hf.` : dayMonth(r.ts),
    }))
  }, [current])

  const steps = useMemo(() => funnel(current), [current])

  /* ilgi tablosu — görüntülenme vs satış */
  const interest = useMemo(
    () => [...dataset.productStats].sort((a, b) => b.views - a.views),
    [dataset.productStats]
  )
  const avgConversion = useMemo(() => {
    const withViews = interest.filter((p) => p.views > 0)
    return withViews.reduce((s, p) => s + p.conversion, 0) / (withViews.length || 1)
  }, [interest])

  const bounceRate = 100 - stats.conversion * 12 // demo türevi
  const pagesPerVisit = current.length
    ? current.reduce((s, d) => s + d.pageViews, 0) / current.reduce((s, d) => s + d.visits, 0)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented options={PERIODS.map((p) => ({ id: p.id, label: p.label }))} value={period} onChange={setPeriod} />
        <p className="text-[0.76rem] text-muted">Instagram ağırlıklı trafik · %81 mobil</p>
      </div>

      {/* metrikler */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ziyaret" value={num(stats.visits)} delta={stats.delta.visits} icon={Eye} />
        <StatCard label="Tekil ziyaretçi" value={num(stats.visitors)} icon={Users} hint="oturum bazlı" />
        <StatCard
          label="Dönüşüm oranı"
          value={pct(stats.conversion, 2)}
          delta={stats.delta.conversion}
          icon={Target}
          hint="ziyaretten siparişe"
        />
        <StatCard
          label="Ziyaret başına sayfa"
          value={pagesPerVisit.toFixed(1).replace('.', ',')}
          icon={MousePointerClick}
          hint={`tahmini hemen çıkma %${Math.max(28, Math.round(bounceRate))}`}
        />
      </div>

      {/* trafik trendi */}
      <ChartWithTable
        title="Ziyaret ve sipariş trendi"
        subtitle="İki seri aynı eksende değil — ölçekleri farklı olduğu için ayrı ayrı okunur"
        chart={
          <div className="space-y-6">
            <div>
              <p className="mb-2 flex items-center gap-2 text-[0.78rem] font-medium text-ink-soft">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: VIZ.series[2] }} />
                Ziyaret
              </p>
              <AreaTrend data={rows} yKey="visits" name="Ziyaret" kind="num" color={VIZ.series[2]} height={180} />
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 text-[0.78rem] font-medium text-ink-soft">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: VIZ.series[0] }} />
                Sipariş
              </p>
              <AreaTrend data={rows} yKey="orders" name="Sipariş" kind="num" color={VIZ.series[0]} height={180} />
            </div>
          </div>
        }
        columns={[
          { key: 'label', label: 'Dönem' },
          { key: 'visits', label: 'Ziyaret', align: 'right', render: (r) => num(r.visits) },
          { key: 'orders', label: 'Sipariş', align: 'right', render: (r) => num(r.orders) },
          {
            key: 'cr',
            label: 'Dönüşüm',
            align: 'right',
            render: (r) => pct(r.visits ? (r.orders / r.visits) * 100 : 0, 2),
          },
        ]}
        rows={rows}
      />

      {/* kanal, şehir, cihaz */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Trafik kaynakları" subtitle="Sipariş sayısına göre">
          <Donut
            rows={dataset.channels.map((c) => ({ label: c.channel, value: c.orders }))}
            kind="num"
            height={172}
          />
          <p className="mt-4 rounded-lg bg-steel-50 px-3.5 py-2.5 text-[0.76rem] leading-relaxed text-steel-800">
            Siparişlerin büyük bölümü Instagram’dan geliyor. Bu, 19,4 binlik takipçi kitlesinin
            doğrudan satışa dönüştüğü anlamına gelir — ama aynı zamanda tek kanala bağımlılık riski.
          </p>
        </Panel>

        <Panel title="Cihaz dağılımı" subtitle="Oturum bazlı">
          <Donut rows={dataset.devices.map((d) => ({ label: d.device, value: d.share }))} kind="pct" height={172} />
          <ul className="mt-4 space-y-2.5">
            {[
              [Smartphone, 'Mobil öncelikli tasarım', 'Sayfalar telefonda 1,4 sn’de açılıyor'],
              [Monitor, 'Masaüstü', 'Kurumsal siparişler ağırlıkla buradan geliyor'],
            ].map(([Icon, t, s]) => (
              <li key={t} className="flex gap-2.5 text-[0.78rem]">
                <Icon size={15} className="mt-0.5 shrink-0 text-faint" />
                <span>
                  <span className="block font-medium text-steel-900">{t}</span>
                  <span className="block text-muted">{s}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Şehirler" subtitle="Ciroya göre ilk 6">
          <RankedBars
            rows={dataset.cities.map((c) => ({ label: c.city, sub: `${c.orders} sipariş`, value: c.revenue }))}
            kind="money"
            max={6}
          />
          <p className="mt-4 flex items-start gap-2 text-[0.74rem] leading-relaxed text-muted">
            <MapPin size={13} className="mt-0.5 shrink-0 text-faint" />
            Şehir dışına giden siparişler toplam cironun büyük kısmını oluşturuyor — kargo
            anlaşması pazarlığı için güçlü bir koz.
          </p>
        </Panel>
      </div>

      {/* huni */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Dönüşüm hunisi" subtitle="Nerede kaybediyoruz?">
          <Funnel steps={steps} />
          <p className="mt-5 rounded-lg bg-crimson-50 px-3.5 py-3 text-[0.78rem] leading-relaxed text-crimson-700">
            En büyük kayıp <strong className="font-semibold">sepetten ödemeye</strong> geçişte.
            Ücretsiz kargo eşiğini sepette göstermek ve misafir alışverişi açmak bu adımı
            iyileştiren iki müdahale.
          </p>
        </Panel>

        <Panel title="Ödeme yöntemi tercihleri" subtitle="Tamamlanan siparişler">
          <RankedBars
            rows={(() => {
              const m = new Map()
              dataset.orders
                .filter((o) => o.status !== 'iptal')
                .forEach((o) => m.set(o.payment, (m.get(o.payment) ?? 0) + 1))
              return [...m.entries()]
                .map(([label, value]) => ({ label, value }))
                .sort((a, b) => b.value - a.value)
            })()}
            kind="num"
            max={5}
          />
          <p className="mt-5 text-[0.76rem] leading-relaxed text-muted">
            Havale/EFT payı yüksek. Kredi kartı taksit seçeneği eklendiğinde ortalama sepet
            tutarının artması beklenir.
          </p>
        </Panel>
      </div>

      {/* ilgi tablosu */}
      <Panel
        title="Ürün ilgisi ve dönüşüm"
        subtitle={`Görüntülenmeye göre sıralı · ortalama dönüşüm ${pct(avgConversion, 2)}`}
        bodyClass="!px-0 !py-4"
      >
        <DataTable
          rowKey={(p) => p.id}
          rows={interest}
          columns={[
            {
              key: 'name',
              label: 'Ürün',
              render: (p) => (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-mist">
                    <ProductImage art={p.art} tone={p.tone} className="h-full w-full" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[0.84rem] font-medium text-steel-900">{p.name}</p>
                    <p className="text-[0.72rem] text-muted">{p.variant}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'views',
              label: 'Görüntülenme',
              align: 'right',
              render: (p) => <span className="text-ink-soft">{num(p.views)}</span>,
            },
            {
              key: 'units',
              label: 'Satış',
              align: 'right',
              render: (p) => <span className="font-medium text-steel-900">{num(p.units)}</span>,
            },
            {
              key: 'conversion',
              label: 'Dönüşüm',
              align: 'right',
              render: (p) => {
                const good = p.conversion >= avgConversion
                return (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-1.5 w-14 overflow-hidden rounded-full bg-mist"
                      title={pct(p.conversion, 2)}
                    >
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (p.conversion / (avgConversion * 2)) * 100)}%`,
                          background: good ? VIZ.series[0] : VIZ.status.serious,
                        }}
                      />
                    </span>
                    <span
                      className="w-12 text-right font-medium"
                      style={{ color: good ? VIZ.goodText : VIZ.badText }}
                    >
                      {pct(p.conversion, 2)}
                    </span>
                  </span>
                )
              },
            },
            {
              key: 'revenue',
              label: 'Ciro',
              align: 'right',
              hideSm: true,
              render: (p) => <span className="font-semibold text-steel-900">{money(p.revenue)}</span>,
            },
          ]}
        />
        <p className="px-5 pt-4 text-[0.75rem] leading-relaxed text-muted">
          Dönüşüm çubuğu ortalamanın iki katına göre ölçeklenmiştir. Turuncu çubuklar ortalamanın
          altında kalan, yani çok bakılıp az satılan ürünlerdir.
        </p>
      </Panel>
    </div>
  )
}
