import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus, Table2 } from 'lucide-react'
import { signedPct } from '../../lib/format'
import { VIZ } from './charts'
import { SIPARIS_DURUMLARI } from '../../data/generate'

/* --------------------------------------------------------------- panel */

export function Panel({ title, subtitle, action, children, className = '', bodyClass = '' }) {
  return (
    <section className={`rounded-2xl border border-line bg-white ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-[1.02rem] leading-tight">{title}</h2>}
            {subtitle && <p className="mt-1 text-[0.76rem] leading-snug text-muted">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={`px-5 py-5 ${bodyClass}`}>{children}</div>
    </section>
  )
}

/* ------------------------------------------------------------ metrik */

export function StatCard({ label, value, delta, hint, icon: Icon, chart, invertDelta = false }) {
  const positive = delta != null && (invertDelta ? delta < 0 : delta > 0)
  const negative = delta != null && (invertDelta ? delta > 0 : delta < 0)
  const DeltaIcon = delta == null ? Minus : delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.74rem] font-medium uppercase tracking-[0.1em] text-muted">{label}</p>
        {Icon && (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-steel-50 text-steel-700">
            <Icon size={15} strokeWidth={1.7} />
          </span>
        )}
      </div>

      <p className="mt-3 font-display text-[1.95rem] font-semibold leading-none tnum text-steel-900">
        {value}
      </p>

      <div className="mt-2.5 flex items-center gap-2">
        {delta != null ? (
          <span
            className="inline-flex items-center gap-0.5 text-[0.76rem] font-semibold tnum"
            style={{ color: positive ? VIZ.goodText : negative ? VIZ.badText : VIZ.muted }}
          >
            <DeltaIcon size={13} strokeWidth={2.2} />
            {signedPct(delta)}
          </span>
        ) : (
          <span className="text-[0.74rem] text-faint">karşılaştırma yok</span>
        )}
        {hint && <span className="truncate text-[0.72rem] text-faint">{hint}</span>}
      </div>

      {chart && <div className="-mx-1 mt-3">{chart}</div>}
    </div>
  )
}

/* ----------------------------------------------------------- durum eti */

const STATUS_STYLE = {
  yeni: { bg: '#FEF6E3', fg: '#8A6100', dot: VIZ.status.warning },
  hazirlaniyor: { bg: '#FDF0E9', fg: '#8C4A28', dot: VIZ.status.serious },
  kargoda: { bg: '#E9F5F0', fg: '#0B6048', dot: VIZ.series[0] },
  teslim: { bg: '#EAF6EA', fg: '#136B13', dot: VIZ.status.good },
  iptal: { bg: '#FBEAEA', fg: '#9A2C2C', dot: VIZ.status.critical },
  iade: { bg: '#FBEAEA', fg: '#9A2C2C', dot: VIZ.status.critical },
}

export function StatusPill({ status }) {
  const meta = SIPARIS_DURUMLARI[status] ?? { label: status }
  const s = STATUS_STYLE[status] ?? { bg: '#F1EFE9', fg: '#57544D', dot: VIZ.muted }
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.7rem] font-semibold"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
      {meta.label}
    </span>
  )
}

/* ------------------------------------------------- grafik / tablo geçişi */

export function ChartWithTable({ title, subtitle, action, chart, columns, rows }) {
  const [showTable, setShowTable] = useState(false)

  return (
    <Panel
      title={title}
      subtitle={subtitle}
      action={
        <div className="flex items-center gap-2">
          {action}
          <button
            onClick={() => setShowTable((v) => !v)}
            className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
              showTable
                ? 'border-steel-800 bg-steel-50 text-steel-800'
                : 'border-line text-muted hover:border-crimson/50 hover:text-steel-800'
            }`}
            title={showTable ? 'Grafiği göster' : 'Tabloyu göster'}
            aria-pressed={showTable}
          >
            <Table2 size={15} />
          </button>
        </div>
      }
    >
      {showTable ? (
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-[0.8rem]">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-line text-left">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={`pb-2 pt-1 font-medium text-muted ${c.align === 'right' ? 'text-right' : ''}`}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`py-2 ${c.align === 'right' ? 'text-right tnum font-medium text-steel-900' : 'text-ink-soft'}`}
                    >
                      {c.render ? c.render(r) : r[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        chart
      )}
    </Panel>
  )
}

/* -------------------------------------------------------- segment seçici */

export function Segmented({ options, value, onChange, size = 'md' }) {
  const h = size === 'sm' ? 'h-8' : 'h-9'
  return (
    <div className={`inline-flex ${h} items-center gap-0.5 rounded-lg bg-mist p-0.5`}>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`h-full rounded-[7px] px-3 text-[0.76rem] font-medium transition ${
            value === o.id
              ? 'bg-white text-steel-900 shadow-sm'
              : 'text-muted hover:text-steel-800'
          }`}
          aria-pressed={value === o.id}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------- içgörü */

export function InsightCard({ tone = 'crimson', icon: Icon, title, children, action }) {
  const tones = {
    crimson: 'from-crimson-50 to-white ring-crimson/25 text-crimson-700',
    steel: 'from-steel-50 to-white ring-steel-600/20 text-steel-700',
    clay: 'from-[#FBEAEA] to-white ring-[#D03B3B]/20 text-[#9A2C2C]',
  }
  return (
    <div className={`rounded-2xl bg-gradient-to-br p-5 ring-1 ${tones[tone]}`}>
      <div className="flex items-start gap-3.5">
        {Icon && (
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/80">
            <Icon size={17} strokeWidth={1.7} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em]">{title}</p>
          <div className="mt-2 text-[0.86rem] leading-relaxed text-ink-soft">{children}</div>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- tablo */

export function DataTable({ columns, rows, empty = 'Kayıt yok', onRowClick, rowKey = (r, i) => i }) {
  if (!rows.length) {
    return (
      <div className="grid place-items-center rounded-xl border border-dashed border-line py-14 text-[0.85rem] text-muted">
        {empty}
      </div>
    )
  }
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[44rem] text-[0.83rem]">
        <thead>
          <tr className="border-b border-line text-left">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-5 pb-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-muted ${
                  c.align === 'right' ? 'text-right' : ''
                } ${c.hideSm ? 'hidden md:table-cell' : ''}`}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r, i) => (
            <tr
              key={rowKey(r, i)}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              className={`transition ${onRowClick ? 'cursor-pointer hover:bg-mist/60' : ''}`}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-5 py-3 align-middle ${
                    c.align === 'right' ? 'text-right tnum' : ''
                  } ${c.hideSm ? 'hidden md:table-cell' : ''}`}
                >
                  {c.render ? c.render(r, i) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
