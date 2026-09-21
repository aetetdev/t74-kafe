import { useMemo, useRef, useState } from 'react'
import { Download, ExternalLink, Info, Printer, QrCode as QrIcon } from 'lucide-react'

import { useTenant } from '../../store/TenantContext'
import { BOLGELER, MASALAR, zoneName } from '../../data/cafe'
import { Panel, Segmented } from '../../components/admin/AdminUI'
import QrArt, { QR_STYLES, QR_THEMES, downloadPng, downloadSvg } from '../../components/ui/QrArt'
import { Button } from '../../components/ui/Bits'

/* ------------------------------------------------------------- kart */

function TableCard({ table, url, theme, style, brand, cardRef }) {
  const t = QR_THEMES[theme]
  return (
    <article
      ref={cardRef}
      className="qr-card flex flex-col items-center rounded-2xl border px-5 py-6 text-center"
      style={{ background: t.bg, borderColor: `${t.fg}22` }}
    >
      <p
        className="text-[0.58rem] font-semibold uppercase tracking-[0.28em]"
        style={{ color: t.accent }}
      >
        {brand.name}
      </p>

      <p
        className="mt-1 font-display text-[2.6rem] font-semibold leading-none"
        style={{ color: t.fg }}
      >
        {table.no}
      </p>
      <p className="text-[0.6rem] uppercase tracking-[0.22em]" style={{ color: `${t.fg}99` }}>
        {zoneName(table.zone)}
      </p>

      <div className="mt-4 w-full max-w-[11rem]">
        <QrArt
          value={url}
          theme={theme}
          style={style}
          emblemText={brand.emblemText}
          className="h-auto w-full"
        />
      </div>

      <p className="mt-4 text-[0.78rem] font-medium leading-snug" style={{ color: t.fg }}>
        Menü için karekodu okutun
      </p>
      <p className="mt-1 text-[0.65rem] leading-snug" style={{ color: `${t.fg}88` }}>
        Siparişinizi telefondan verebilirsiniz
      </p>

      <span
        className="mt-4 h-px w-12"
        style={{ background: t.accent }}
        aria-hidden="true"
      />
      <p className="mt-3 text-[0.6rem] tracking-wide" style={{ color: `${t.fg}77` }}>
        {brand.instagram}
      </p>
    </article>
  )
}

/* ------------------------------------------------------------------ */

export default function QrCodes() {
  const { brand } = useTenant()

  const [theme, setTheme] = useState('celik')
  const [style, setStyle] = useState('nokta')
  const [zone, setZone] = useState('hepsi')
  const [withHint, setWithHint] = useState(true)
  const [baseUrl, setBaseUrl] = useState(() =>
    typeof window !== 'undefined' ? window.location.origin : ''
  )

  const refs = useRef({})

  const tables = useMemo(
    () => (zone === 'hepsi' ? MASALAR : MASALAR.filter((m) => m.zone === zone)),
    [zone]
  )

  const urlFor = (t) => `${baseUrl.replace(/\/$/, '')}/menu${withHint ? `?m=${t.id}` : ''}`

  const sample = tables[0] ?? MASALAR[0]

  return (
    <div className="space-y-5">
      {/* ---------------------------------------------- ayarlar (baskıda gizli) */}
      <div className="qr-controls space-y-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_20rem]">
          <Panel title="Karekod tasarımı" subtitle="Kartlar markanızın renkleriyle üretilir">
            <div className="space-y-5">
              <div>
                <p className="eyebrow">Renk teması</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {Object.values(QR_THEMES).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2 text-[0.82rem] transition ${
                        theme === t.id ? 'border-steel-800' : 'border-line hover:border-crimson/50'
                      }`}
                    >
                      <span
                        className="grid h-7 w-7 place-items-center rounded-md"
                        style={{ background: t.bg, boxShadow: `inset 0 0 0 1px ${t.fg}33` }}
                      >
                        <span className="h-3 w-3 rounded-sm" style={{ background: t.fg }} />
                      </span>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow">Modül biçimi</p>
                <div className="mt-2.5">
                  <Segmented options={QR_STYLES.map((s) => ({ id: s.id, label: s.name }))} value={style} onChange={setStyle} />
                </div>
              </div>

              <div>
                <p className="eyebrow">Menü adresi</p>
                <input
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://kafeniz.com"
                  className="mt-2 h-10 w-full rounded-lg border border-line bg-white px-3 text-[0.85rem] outline-none transition focus:border-crimson/70"
                />
                <p className="mt-1.5 flex items-center gap-1.5 text-[0.72rem] text-faint">
                  <ExternalLink size={12} />
                  Karekod şuraya gider: <span className="tnum">{urlFor(sample)}</span>
                </p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-mist/60 p-4">
                <input
                  type="checkbox"
                  checked={withHint}
                  onChange={(e) => setWithHint(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#2F3842]"
                />
                <span className="text-[0.82rem] text-ink-soft">
                  <strong className="font-medium text-steel-900">Masa ipucu taşısın</strong>
                  <span className="mt-0.5 block text-[0.74rem] leading-snug text-muted">
                    Karekod hangi masadan okutulduysa kasada <strong className="font-medium">tek
                    dokunuşla bağla</strong> düğmesi çıkar. Müşteriye hiçbir şey sorulmaz; kasa
                    isterse başka masa seçebilir.
                  </span>
                </span>
              </label>
            </div>
          </Panel>

          {/* önizleme */}
          <Panel title="Önizleme" subtitle={`Masa ${sample.no}`}>
            <div className="mx-auto max-w-[15rem]">
              <TableCard table={sample} url={urlFor(sample)} theme={theme} style={style} brand={brand} />
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => downloadSvg(refs.current[sample.id]?.querySelector('svg'), `masa-${sample.no}.svg`)}
              >
                <Download size={14} /> SVG
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => downloadPng(refs.current[sample.id]?.querySelector('svg'), `masa-${sample.no}.png`)}
              >
                <Download size={14} /> PNG
              </Button>
            </div>
          </Panel>
        </div>

        {/* araç çubuğu */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
            <Segmented
              options={[{ id: 'hepsi', label: 'Tüm masalar' }, ...BOLGELER.map((z) => ({ id: z.id, label: z.name }))]}
              value={zone}
              onChange={setZone}
            />
          </div>
          <Button onClick={() => window.print()}>
            <Printer size={16} /> {tables.length} kartı yazdır
          </Button>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl bg-crimson-50 px-4 py-3 text-[0.78rem] leading-relaxed text-crimson-700">
          <Info size={15} className="mt-0.5 shrink-0" />
          <span>
            Yazdır dediğinizde yalnızca kartlar basılır — A4 sayfaya altı kart sığar. Kesip masa
            standına koyabilir ya da laminasyon yaptırabilirsiniz. Tek tek indirmek isterseniz her
            kartın altındaki <strong className="font-semibold">SVG</strong> (baskı için) veya{' '}
            <strong className="font-semibold">PNG</strong> (paylaşım için) düğmesini kullanın.
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------ kart ızgarası */}
      <div className="qr-print-area grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((t) => (
          <div key={t.id} className="qr-card-wrap">
            <TableCard
              table={t}
              url={urlFor(t)}
              theme={theme}
              style={style}
              brand={brand}
              cardRef={(el) => {
                refs.current[t.id] = el
              }}
            />
            <div className="qr-actions mt-2 flex gap-2">
              <button
                onClick={() => downloadSvg(refs.current[t.id]?.querySelector('svg'), `masa-${t.no}.svg`)}
                className="flex-1 rounded-lg border border-line bg-white py-2 text-[0.74rem] font-medium text-ink-soft transition hover:border-crimson hover:text-steel-800"
              >
                SVG
              </button>
              <button
                onClick={() => downloadPng(refs.current[t.id]?.querySelector('svg'), `masa-${t.no}.png`)}
                className="flex-1 rounded-lg border border-line bg-white py-2 text-[0.74rem] font-medium text-ink-soft transition hover:border-crimson hover:text-steel-800"
              >
                PNG
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="qr-controls flex items-center justify-center gap-2 py-2 text-center text-[0.72rem] text-faint">
        <QrIcon size={13} />
        Karekodlar hata düzeltme seviyesi H ile üretilir — ortadaki mühür okumayı engellemez.
      </p>
    </div>
  )
}
