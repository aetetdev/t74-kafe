import { useMemo, useState } from 'react'
import {
  Armchair, Banknote, Clock, Lightbulb, QrCode, Receipt, Store, TrendingUp, Users,
} from 'lucide-react'

import { useCafe } from '../../store/CafeContext'
import { useStore } from '../../store/StoreContext'
import { useTenant } from '../../store/TenantContext'
import { PERIODS, byMonth, byWeek, slicePeriod } from '../../lib/metrics'
import { dayMonth, money, monthYear, num, pct } from '../../lib/format'
import { SERVIS_SAATLERI } from '../../data/cafe'
import { AreaTrend, Donut, RankedBars, VIZ } from '../../components/admin/charts'
import { ChartWithTable, InsightCard, Panel, Segmented, StatCard } from '../../components/admin/AdminUI'

const GUN_ADI = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
const GUN_SIRA = [1, 2, 3, 4, 5, 6, 0] // Pazartesi'den Pazar'a

/* ------------------------------------------------- saatlik ısı haritası */

function HourHeatmap({ grid }) {
  const [hover, setHover] = useState(null)

  const max = useMemo(() => Math.max(1, ...Object.values(grid)), [grid])

  // Sıralı rampa: doğrulanmış tek tonlu marka yeşili (açık → koyu)
  const colorFor = (v) => {
    if (!v) return '#E7EAED'
    const step = Math.min(VIZ.ramp.length - 1, Math.floor((v / max) * VIZ.ramp.length))
    return VIZ.ramp[step]
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="min-w-[34rem]">
          {/* saat başlıkları */}
          <div className="mb-1.5 flex gap-1 pl-9">
            {SERVIS_SAATLERI.map((h) => (
              <span key={h} className="flex-1 text-center text-[0.6rem] tnum text-faint">
                {h}
              </span>
            ))}
          </div>

          {GUN_SIRA.map((g) => (
            <div key={g} className="mb-1 flex items-center gap-1">
              <span className="w-8 shrink-0 text-[0.68rem] font-medium text-muted">{GUN_ADI[g]}</span>
              {SERVIS_SAATLERI.map((h) => {
                const v = grid[`${g}-${h}`] ?? 0
                const on = hover && hover.g === g && hover.h === h
                return (
                  <button
                    key={h}
                    type="button"
                    onMouseEnter={() => setHover({ g, h, v })}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover({ g, h, v })}
                    onBlur={() => setHover(null)}
                    className="h-7 flex-1 rounded-[3px] transition-transform"
                    style={{
                      background: colorFor(v),
                      outline: on ? '2px solid #232930' : 'none',
                      outlineOffset: '1px',
                    }}
                    aria-label={`${GUN_ADI[g]} ${h}:00 — ${v} adisyon`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* gösterge */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[0.7rem] text-muted">
          <span>Az</span>
          {['#E7EAED', ...VIZ.ramp].map((c) => (
            <span key={c} className="h-3.5 w-6 rounded-[2px]" style={{ background: c }} />
          ))}
          <span>Çok</span>
        </div>
        <p className="text-[0.76rem] tnum text-ink-soft">
          {hover ? (
            <>
              <strong className="font-semibold">{GUN_ADI[hover.g]} {hover.h}:00</strong> —{' '}
              {num(hover.v)} adisyon
            </>
          ) : (
            <span className="text-faint">Bir kutunun üstüne gelin</span>
          )}
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export default function CafeAnalytics() {
  const { dataset, todayStats } = useCafe()
  const { dataset: shopDataset } = useStore()
  const { brand } = useTenant()
  const [period, setPeriod] = useState('30d')

  const days = dataset.days
  const { current, previous, comparable } = useMemo(
    () => slicePeriod(days, period),
    [days, period]
  )

  const sum = (arr, k) => arr.reduce((s, d) => s + (d[k] ?? 0), 0)
  const delta = (a, b) => (b ? ((a - b) / b) * 100 : null)

  const revenue = sum(current, 'revenue')
  const tickets = sum(current, 'tickets')
  const guests = sum(current, 'guests')
  const avgTicket = tickets ? revenue / tickets : 0
  const avgGuest = guests ? revenue / guests : 0
  const avgDuration = current.length
    ? current.reduce((s, d) => s + d.avgDuration, 0) / current.length
    : 0
  const occupancy = current.length
    ? current.reduce((s, d) => s + d.occupancy, 0) / current.length
    : 0

  const pRevenue = sum(previous, 'revenue')
  const pTickets = sum(previous, 'tickets')
  const pAvg = pTickets ? pRevenue / pTickets : 0

  const chartRows = useMemo(() => {
    const src = current.length > 120 ? byMonth(current) : current.length > 45 ? byWeek(current) : current
    const grain = current.length > 120 ? 'ay' : current.length > 45 ? 'hafta' : 'gun'
    return src.map((r) => ({
      ...r,
      label: grain === 'ay' ? monthYear(r.ts) : grain === 'hafta' ? `${dayMonth(r.ts)} hf.` : dayMonth(r.ts),
      revenue: r.revenue,
    }))
  }, [current])

  /* ------------------------------ online ile karşılaştırma (aynı dönem) */
  const online = useMemo(() => {
    const { current: oc } = slicePeriod(shopDataset.days, period)
    return { revenue: oc.reduce((s, d) => s + d.revenue, 0), orders: oc.reduce((s, d) => s + d.orders, 0) }
  }, [shopDataset.days, period])

  const toplamCiro = revenue + online.revenue
  const kafePay = toplamCiro ? (revenue / toplamCiro) * 100 : 0

  /* ---------------------------------------------- en sakin/yoğun saat */
  const sessions = useMemo(() => {
    const entries = Object.entries(dataset.hourGrid).map(([k, v]) => {
      const [g, h] = k.split('-').map(Number)
      return { g, h, v }
    })
    if (!entries.length) return null
    const sorted = [...entries].sort((a, b) => b.v - a.v)
    // Sadece servis saatleri içindeki en sakin dilim
    const quiet = [...entries]
      .filter((e) => e.h >= 11 && e.h <= 20)
      .sort((a, b) => a.v - b.v)[0]
    return { peak: sorted[0], quiet }
  }, [dataset.hourGrid])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented options={PERIODS.map((p) => ({ id: p.id, label: p.label }))} value={period} onChange={setPeriod} />
        <p className="text-[0.76rem] text-muted">
          Şu an <strong className="font-semibold text-steel-900">{todayStats.openCount}</strong> masa açık ·{' '}
          {money(todayStats.openValue)} tahsil edilmedi
        </p>
      </div>

      {/* metrikler */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Kafe cirosu"
          value={money(revenue)}
          delta={comparable ? delta(revenue, pRevenue) : null}
          icon={Banknote}
        />
        <StatCard
          label="Adisyon"
          value={num(tickets)}
          delta={comparable ? delta(tickets, pTickets) : null}
          icon={Receipt}
          hint={`${num(guests)} misafir`}
        />
        <StatCard
          label="Ortalama adisyon"
          value={money(avgTicket)}
          delta={comparable ? delta(avgTicket, pAvg) : null}
          icon={Users}
          hint={`kişi başı ${money(avgGuest)}`}
        />
        <StatCard
          label="Doluluk (zaman bazlı)"
          value={pct(occupancy, 1)}
          icon={Armchair}
          hint={`servis saatlerinin oranı · ort. oturma ${Math.round(avgDuration)} dk`}
        />
      </div>

      {/* ciro trendi */}
      <ChartWithTable
        title="Kafe içi ciro"
        subtitle={`${chartRows.length} nokta · dönem toplamı ${money(revenue)}`}
        chart={<AreaTrend data={chartRows} yKey="revenue" name="Kafe cirosu" kind="money" height={260} />}
        columns={[
          { key: 'label', label: 'Dönem' },
          { key: 'tickets', label: 'Adisyon', align: 'right', render: (r) => num(r.tickets) },
          { key: 'revenue', label: 'Ciro', align: 'right', render: (r) => money(r.revenue) },
        ]}
        rows={chartRows}
      />

      {/* ısı haritası */}
      <Panel
        title="Haftalık yoğunluk"
        subtitle="Gün ve saate göre açılan adisyon sayısı"
      >
        <HourHeatmap grid={dataset.hourGrid} />

        {sessions && (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-steel-50 px-3.5 py-3 text-[0.78rem] leading-relaxed text-steel-800">
              <strong className="font-semibold">En yoğun:</strong>{' '}
              {GUN_ADI[sessions.peak.g]} {sessions.peak.h}:00 civarı. Personel planını buraya
              yığmak bekleme süresini düşürür.
            </div>
            {sessions.quiet && (
              <div className="rounded-lg bg-crimson-50 px-3.5 py-3 text-[0.78rem] leading-relaxed text-crimson-700">
                <strong className="font-semibold">En sakin:</strong>{' '}
                {GUN_ADI[sessions.quiet.g]} {sessions.quiet.h}:00. Bu dilime özel bir kampanya
                (ikinci kahve yarı fiyat gibi) boş kapasiteyi ciroya çevirir.
              </div>
            )}
          </div>
        )}
      </Panel>

      {/* içgörüler */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <InsightCard tone="steel" icon={Store} title="Kafe mi, online mı?">
          <p>
            Seçili dönemde kafe içi <strong className="font-semibold tnum">{money(revenue)}</strong>,
            online <strong className="font-semibold tnum">{money(online.revenue)}</strong> ciro yaptı.
            Toplam cironun <strong className="font-semibold tnum">{pct(kafePay, 1)}</strong>’i masadan
            geliyor — asıl iş burada.
          </p>
        </InsightCard>

        <InsightCard tone="crimson" icon={QrCode} title="QR menü kullanımı">
          <p>
            Siparişlerin <strong className="font-semibold tnum">{pct(dataset.qrShare, 1)}</strong>’i
            QR menüden başlıyor. Bu masalarda garson sipariş almak için beklemiyor; sipariş
            doğrudan mutfağa düşüyor.
          </p>
        </InsightCard>

        <InsightCard tone="crimson" icon={Lightbulb} title="Masa devir hızı">
          <p>
            Ortalama oturma süresi{' '}
            <strong className="font-semibold tnum">{Math.round(avgDuration)} dk</strong>. Hesabı QR
            üzerinden kapatma eklenirse bu süre 5–8 dk kısalır; yoğun saatte masa başına ek bir
            devir demek.
          </p>
        </InsightCard>
      </div>

      {/* menü, bölge, garson */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="En çok satan menü kalemleri" subtitle="Ciroya göre · tüm dönem">
          <RankedBars
            rows={dataset.menuStats.slice(0, 7).map((m) => ({
              id: m.id,
              label: m.name,
              sub: `${num(m.qty)} adet`,
              value: m.revenue,
            }))}
            kind="money"
            max={7}
          />
        </Panel>

        <Panel title="Bölge performansı" subtitle="Hangi alan daha çok kazandırıyor">
          <Donut
            rows={dataset.zoneStats.map((z) => ({ label: z.name, value: z.revenue }))}
            kind="money"
            height={168}
          />
          <ul className="mt-4 space-y-2 text-[0.78rem]">
            {dataset.zoneStats.map((z) => (
              <li key={z.id} className="flex items-center justify-between gap-3">
                <span className="text-muted">{z.name}</span>
                <span className="tnum text-steel-900">
                  ort. {money(z.avgTicket)} · {num(z.tickets)} adisyon
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Garson performansı" subtitle="Ortalama adisyon tutarına göre">
          <RankedBars
            rows={[...dataset.waiterStats]
              .sort((a, b) => b.avgTicket - a.avgTicket)
              .map((w) => ({ label: w.name, sub: `${num(w.tickets)} masa`, value: w.avgTicket }))}
            kind="money"
            max={4}
          />
          <p className="mt-4 text-[0.76rem] leading-relaxed text-muted">
            Ortalaması yüksek olan garson daha çok ek satış yapıyor demektir. Bu tablo, tatlı ve
            ikinci içecek önerisinin kime öğretileceğini gösterir.
          </p>
        </Panel>
      </div>

      {/* karşılaştırma */}
      <Panel
        title="Kanal karşılaştırması"
        subtitle="Aynı dönemde kafe içi ve online satış"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            ['Kafe içi', revenue, tickets, 'adisyon', VIZ.series[0]],
            ['Online mağaza', online.revenue, online.orders, 'sipariş', VIZ.series[1]],
          ].map(([label, rev, cnt, birim, color]) => (
            <div key={label} className="rounded-xl border border-line p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
                <p className="text-[0.8rem] font-medium text-ink-soft">{label}</p>
              </div>
              <p className="mt-2 font-display text-[1.8rem] font-semibold leading-none tnum text-steel-900">
                {money(rev)}
              </p>
              <p className="mt-1.5 text-[0.76rem] text-muted tnum">
                {num(cnt)} {birim} · ortalama {money(cnt ? rev / cnt : 0)}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${toplamCiro ? (rev / toplamCiro) * 100 : 0}%`, background: color }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 flex items-start gap-2 text-[0.78rem] leading-relaxed text-muted">
          <TrendingUp size={14} className="mt-0.5 shrink-0 text-faint" />
          İki kanal aynı panelde birleştiği için stok, müşteri ve ciro tek yerden okunuyor.
          Masada içilen kahvenin paketi online satıldığında ikisi de aynı ürün kaydına düşer.
        </p>
      </Panel>

      <p className="flex items-center justify-center gap-2 py-2 text-center text-[0.72rem] text-faint">
        <Clock size={13} />
        Kafe verileri {brand.dataNote}.
      </p>
    </div>
  )
}
