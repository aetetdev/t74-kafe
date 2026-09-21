import { useMemo, useState } from 'react'
import { Crown, Mail, Phone, Repeat, Search, UserPlus, Users } from 'lucide-react'

import { useStore } from '../../store/StoreContext'
import { dateShort, initials, money, num, pct } from '../../lib/format'
import { DataTable, Panel, StatCard } from '../../components/admin/AdminUI'
import { RankedBars, VIZ } from '../../components/admin/charts'

export default function Customers() {
  const { dataset } = useStore()
  const [query, setQuery] = useState('')

  const customers = dataset.customers

  const rows = useMemo(() => {
    if (!query.trim()) return customers
    const q = query.toLocaleLowerCase('tr-TR')
    return customers.filter((c) =>
      [c.name, c.email, c.city].join(' ').toLocaleLowerCase('tr-TR').includes(q)
    )
  }, [customers, query])

  const summary = useMemo(() => {
    const repeat = customers.filter((c) => c.orderCount > 1)
    const total = customers.reduce((s, c) => s + c.lifetime, 0)
    return {
      count: customers.length,
      repeat: repeat.length,
      repeatRate: customers.length ? (repeat.length / customers.length) * 100 : 0,
      avgLifetime: customers.length ? total / customers.length : 0,
      topShare: customers.length
        ? (customers.slice(0, Math.ceil(customers.length * 0.1)).reduce((s, c) => s + c.lifetime, 0) /
            total) *
          100
        : 0,
    }
  }, [customers])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Müşteri" value={num(summary.count)} icon={Users} hint="tüm dönem" />
        <StatCard
          label="Tekrar eden"
          value={num(summary.repeat)}
          icon={Repeat}
          hint={`${pct(summary.repeatRate, 1)} tekrar oranı`}
        />
        <StatCard
          label="Ortalama müşteri değeri"
          value={money(summary.avgLifetime)}
          icon={UserPlus}
          hint="yaşam boyu harcama"
        />
        <StatCard
          label="İlk %10’un payı"
          value={pct(summary.topShare, 1)}
          icon={Crown}
          hint="cironun bu kadarı en iyi müşterilerden"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel
            title="Müşteri listesi"
            subtitle={`${num(rows.length)} kayıt · yaşam boyu değere göre sıralı`}
            bodyClass="!px-0 !py-4"
            action={
              <label className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ara…"
                  className="h-9 w-44 rounded-lg border border-line bg-white pl-9 pr-3 text-[0.8rem] outline-none transition placeholder:text-faint focus:border-crimson/60"
                />
              </label>
            }
          >
            <DataTable
              rowKey={(c) => c.id}
              rows={rows.slice(0, 25)}
              empty="Eşleşen müşteri yok"
              columns={[
                {
                  key: 'name',
                  label: 'Müşteri',
                  render: (c, i) => (
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[0.7rem] font-semibold text-snow"
                        style={{ background: i < 3 ? VIZ.series[0] : '#B9B3A6' }}
                      >
                        {initials(c.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[0.85rem] font-medium text-steel-900">{c.name}</p>
                        <p className="truncate text-[0.72rem] text-muted">{c.email}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'city',
                  label: 'Şehir',
                  hideSm: true,
                  render: (c) => <span className="text-[0.8rem] text-muted">{c.city}</span>,
                },
                {
                  key: 'firstOrderAt',
                  label: 'İlk sipariş',
                  hideSm: true,
                  render: (c) => (
                    <span className="text-[0.78rem] tnum text-muted">{dateShort(c.firstOrderAt)}</span>
                  ),
                },
                {
                  key: 'orderCount',
                  label: 'Sipariş',
                  align: 'right',
                  render: (c) => (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-medium text-steel-900">{c.orderCount}</span>
                      {c.orderCount > 1 && <Repeat size={12} className="text-steel-600" />}
                    </span>
                  ),
                },
                {
                  key: 'lifetime',
                  label: 'Toplam harcama',
                  align: 'right',
                  render: (c) => <span className="font-semibold text-steel-900">{money(c.lifetime)}</span>,
                },
              ]}
            />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="En değerli müşteriler" subtitle="Yaşam boyu harcamaya göre">
            <RankedBars
              rows={customers.slice(0, 6).map((c) => ({
                label: c.name,
                sub: `${c.orderCount} sipariş`,
                value: c.lifetime,
              }))}
              kind="money"
              max={6}
            />
          </Panel>

          <Panel title="Sadakat fırsatı">
            <p className="text-[0.85rem] leading-relaxed text-ink-soft">
              Müşterilerin{' '}
              <strong className="font-semibold tnum text-steel-900">{pct(summary.repeatRate, 1)}</strong>’i
              ikinci kez sipariş veriyor. Kahve gibi tüketilip biten bir üründe bu oran{' '}
              <strong className="font-semibold">%40’ın üzerine</strong> çıkarılabilir.
            </p>
            <ul className="mt-4 space-y-2.5 text-[0.8rem] text-muted">
              {[
                'İlk siparişten 21 gün sonra “kahveniz bitiyor olmalı” e-postası',
                'Abonelik seçeneği: her ay taze kavrum, %10 indirimli',
                'Üçüncü siparişte ücretsiz lokum',
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson" />
                  {t}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="İletişim">
            <div className="space-y-2.5 text-[0.82rem]">
              <p className="flex items-center gap-2.5 text-muted">
                <Mail size={15} className="text-faint" />
                <span className="tnum font-medium text-steel-900">{num(customers.length)}</span>
                e-posta adresi toplandı
              </p>
              <p className="flex items-center gap-2.5 text-muted">
                <Phone size={15} className="text-faint" />
                <span className="tnum font-medium text-steel-900">{num(customers.length)}</span>
                telefon numarası kayıtlı
              </p>
            </div>
            <p className="mt-4 rounded-lg bg-mist/70 px-3.5 py-3 text-[0.75rem] leading-relaxed text-muted">
              Bu liste kendi mülkünüz — Instagram algoritmasına bağlı değil. E-posta ve SMS
              kampanyaları için doğrudan kullanılabilir.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  )
}
