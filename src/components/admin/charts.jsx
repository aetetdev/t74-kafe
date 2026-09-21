/**
 * Panel grafikleri.
 *
 * Renk paleti dataviz doğrulayıcısıyla ölçülerek seçildi (yüzey #FFFFFF, light):
 *   kategorik 3 slot  → CVD ΔE 9.8 · normal ΔE 19.4 · kontrast ≥ 3:1  (hepsi PASS)
 *   sıralı rampa      → tek ton, monoton L, açık uç 2.24:1            (hepsi PASS)
 * Dördüncü bir kategorik ton eklenemedi (kırmızı↔kehribar CVD altında kalıyor);
 * bu yüzden 3'ten fazla kategori "Diğer" altında toplanır.
 */

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { compact, money, num, pct } from '../../lib/format'

/* --------------------------------------------------------------- palet */

export const VIZ = {
  surface: '#FFFFFF',
  grid: '#E7EAED',
  axis: '#B9C0C7',
  muted: '#7B848D',
  secondary: '#4E5A67',
  primary: '#191D21',

  /** kategorik — sabit sırada, asla döngüye sokulmaz */
  series: ['#C4122F', '#35618F', '#12857B'],
  other: '#8B939B',

  /** sıralı / ordinal — tek ton marka yeşili, açık→koyu */
  ramp: ['#F2B7C0', '#E3808E', '#CF4F63', '#B02039', '#82101F'],

  status: { good: '#0CA30C', warning: '#FAB219', serious: '#EC835A', critical: '#D03B3B' },
  goodText: '#006300',
  badText: '#9A2C2C',
}

const AXIS_TICK = { fontSize: 11, fill: VIZ.muted, fontVariantNumeric: 'tabular-nums' }

/* ------------------------------------------------------------- ipucu */

function TipShell({ label, rows }) {
  return (
    <div className="rounded-xl border border-line bg-white/97 px-3.5 py-2.5 shadow-lg backdrop-blur">
      {label && (
        <p className="mb-1.5 text-[0.68rem] font-medium uppercase tracking-wider text-muted">{label}</p>
      )}
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center gap-2.5 text-[0.8rem]">
            {r.color && (
              <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: r.color }} />
            )}
            <span className="text-ink-soft">{r.name}</span>
            <span className="ml-auto font-semibold tnum text-steel-900">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const fmtFor = (kind, v) =>
  kind === 'money' ? money(v) : kind === 'pct' ? pct(v) : num(v)

function makeTooltip(kinds, labelKey = 'label') {
  return function ChartTip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    const head = payload[0]?.payload?.[labelKey] ?? label
    return (
      <TipShell
        label={head}
        rows={payload.map((p) => ({
          key: p.dataKey,
          name: p.name,
          color: p.color || p.fill || p.stroke,
          value: fmtFor(kinds[p.dataKey] ?? 'num', p.value),
        }))}
      />
    )
  }
}

/* ------------------------------------------------------- alan grafiği */

export function AreaTrend({
  data,
  xKey = 'label',
  yKey = 'revenue',
  name = 'Ciro',
  kind = 'money',
  color = VIZ.series[0],
  height = 260,
  average,
}) {
  const gid = `grad-${yKey}-${color.slice(1)}`
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={VIZ.grid} strokeWidth={1} />
        <XAxis
          dataKey={xKey}
          tickLine={false}
          axisLine={{ stroke: VIZ.axis }}
          tick={AXIS_TICK}
          minTickGap={26}
          dy={6}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          width={48}
          tickFormatter={(v) => (kind === 'money' ? compact(v) : compact(v))}
        />
        <Tooltip
          content={makeTooltip({ [yKey]: kind }, xKey)}
          cursor={{ stroke: VIZ.axis, strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        {average != null && (
          <ReferenceLine
            y={average}
            stroke={VIZ.axis}
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: `ort. ${kind === 'money' ? compact(average) : compact(average)}`,
              position: 'right',
              fill: VIZ.muted,
              fontSize: 10,
            }}
          />
        )}
        <Area
          type="monotone"
          dataKey={yKey}
          name={name}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gid})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: VIZ.surface, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/* -------------------------------------------------- iki seri çizgi */

export function DualLine({ data, xKey = 'label', series, height = 260 }) {
  const kinds = Object.fromEntries(series.map((s) => [s.key, s.kind ?? 'num']))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
        <CartesianGrid vertical={false} stroke={VIZ.grid} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={{ stroke: VIZ.axis }} tick={AXIS_TICK} minTickGap={26} dy={6} />
        <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={48} tickFormatter={compact} />
        <Tooltip content={makeTooltip(kinds, xKey)} cursor={{ stroke: VIZ.axis, strokeDasharray: '3 3' }} />
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={VIZ.series[i]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: VIZ.surface, fill: VIZ.series[i] }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

/* ------------------------------------------------------- sütun grafiği */

export function BarTrend({
  data,
  xKey = 'label',
  yKey = 'orders',
  name = 'Sipariş',
  kind = 'num',
  color = VIZ.series[0],
  height = 260,
  highlightLast = true,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 4 }} barCategoryGap="22%">
        <CartesianGrid vertical={false} stroke={VIZ.grid} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={{ stroke: VIZ.axis }} tick={AXIS_TICK} minTickGap={16} dy={6} />
        <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} width={44} tickFormatter={compact} />
        <Tooltip
          content={makeTooltip({ [yKey]: kind }, xKey)}
          cursor={{ fill: 'rgba(14,143,114,.06)' }}
        />
        <Bar dataKey={yKey} name={name} radius={[4, 4, 0, 0]} maxBarSize={54}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={highlightLast && i === data.length - 1 ? VIZ.series[0] : color}
              fillOpacity={highlightLast && i === data.length - 1 ? 1 : 0.55}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ------------------------------------------- yatay sıralı çubuklar */

export function RankedBars({ rows, kind = 'money', valueKey = 'value', labelKey = 'label', max = 6 }) {
  const list = rows.slice(0, max)
  const top = Math.max(...list.map((r) => r[valueKey]), 1)

  return (
    <ul className="space-y-3.5">
      {list.map((r, i) => {
        const share = (r[valueKey] / top) * 100
        const color = VIZ.ramp[Math.min(i, VIZ.ramp.length - 1)]
        return (
          // etiketler tekrar edebilir (aynı ürünün farklı gramajları) — indeksle ayırıyoruz
          <li key={`${r.id ?? r[labelKey]}-${i}`}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="truncate text-[0.82rem] text-ink-soft">
                {r[labelKey]}
                {r.sub && <span className="ml-1.5 text-[0.74rem] text-faint">{r.sub}</span>}
              </span>
              <span className="shrink-0 text-[0.82rem] font-semibold tnum text-steel-900">
                {fmtFor(kind, r[valueKey])}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-mist">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{ width: `${Math.max(2, share)}%`, background: color }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/* --------------------------------------------------------------- halka */

export function Donut({ rows, height = 200, kind = 'pct' }) {
  // 3 kategorik slot + kalanı "Diğer" — palet 4. tonu güvenle taşımıyor
  const head = rows.slice(0, 3)
  const tail = rows.slice(3)
  const data = tail.length
    ? [...head, { label: 'Diğer', value: tail.reduce((s, r) => s + r.value, 0) }]
    : head
  const total = data.reduce((s, r) => s + r.value, 0) || 1

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={2}
              stroke={VIZ.surface}
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={i < 3 ? VIZ.series[i] : VIZ.other} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <TipShell
                    rows={[
                      {
                        key: 'v',
                        name: payload[0].name,
                        color: payload[0].payload.fill,
                        value: `${fmtFor(kind, payload[0].value)} · ${pct((payload[0].value / total) * 100)}`,
                      },
                    ]}
                  />
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* gösterge — kimlik asla renge tek başına bırakılmaz */}
      <ul className="min-w-0 flex-1 space-y-2">
        {data.map((r, i) => (
          <li key={r.label} className="flex items-center gap-2.5 text-[0.8rem]">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
              style={{ background: i < 3 ? VIZ.series[i] : VIZ.other }}
            />
            <span className="truncate text-ink-soft">{r.label}</span>
            <span className="ml-auto shrink-0 font-semibold tnum text-steel-900">
              {pct((r.value / total) * 100)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------------- huni */

export function Funnel({ steps }) {
  return (
    <ol className="space-y-2.5">
      {steps.map((s, i) => (
        <li key={s.step}>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[0.82rem] text-ink-soft">{s.step}</span>
            <span className="flex items-baseline gap-2.5">
              {s.dropoff != null && (
                <span className="text-[0.72rem] tnum text-muted">−{pct(s.dropoff, 0)}</span>
              )}
              <span className="text-[0.85rem] font-semibold tnum text-steel-900">{num(s.value)}</span>
            </span>
          </div>
          <div className="mt-1.5 h-7 overflow-hidden rounded-lg bg-mist">
            <div
              className="flex h-full items-center rounded-lg px-2.5 transition-[width] duration-700"
              style={{
                width: `${Math.max(6, s.share)}%`,
                background: VIZ.ramp[Math.min(i, VIZ.ramp.length - 1)],
              }}
            >
              <span className="text-[0.68rem] font-semibold text-white/95 tnum">{pct(s.share, 1)}</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

/* --------------------------------------------------------- ışıltı çizgi */

export function Spark({ data, dataKey = 'value', color = VIZ.series[0], height = 40 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`sp-${dataKey}-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.6}
          fill={`url(#sp-${dataKey}-${color.slice(1)})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
