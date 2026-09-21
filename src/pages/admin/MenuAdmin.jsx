import { useMemo, useState } from 'react'
import {
  AlertTriangle, Coffee, EyeOff, Plus, RotateCcw, Search, Star, Trash2, X,
} from 'lucide-react'

import { useCafe } from '../../store/CafeContext'
import { useStore } from '../../store/StoreContext'
import { useTenant } from '../../store/TenantContext'
import { MENU_KATEGORILERI } from '../../data/cafe'
import { money, num } from '../../lib/format'
import { DataTable, Panel, Segmented } from '../../components/admin/AdminUI'
import { CafeGlyph, Sheet } from '../../components/cafe/CafeBits'
import { Button } from '../../components/ui/Bits'
import { VIZ } from '../../components/admin/charts'

const input =
  'h-10 w-full rounded-lg border border-line bg-white px-3 text-[0.85rem] outline-none transition placeholder:text-faint focus:border-crimson/70 focus:ring-2 focus:ring-crimson/12'

function Field({ label, hint, required, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-baseline gap-1 text-[0.76rem] font-medium text-ink-soft">
        {label}
        {required && <span className="text-[#9A2C2C]">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[0.7rem] leading-snug text-faint">{hint}</span>}
    </label>
  )
}

const EMPTY = {
  name: '',
  cat: MENU_KATEGORILERI[0].id,
  price: '',
  desc: '',
  prep: 4,
  options: null,
  linkedProductId: null,
  popular: false,
  available: true,
}

export default function MenuAdmin() {
  const {
    menu, saveMenuItem, deleteMenuItem, setMenuPrice, toggleAvailable, togglePopular, resetMenu,
  } = useCafe()
  const { products, toast } = useStore()
  const { brand } = useTenant()

  const [cat, setCat] = useState('hepsi')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // düzenlenen taslak
  const [optionDraft, setOptionDraft] = useState('')
  const [errors, setErrors] = useState({})
  const [confirming, setConfirming] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const rows = useMemo(() => {
    let out = menu
    if (cat !== 'hepsi') out = out.filter((m) => m.cat === cat)
    if (query.trim()) {
      const q = query.toLocaleLowerCase('tr-TR')
      out = out.filter((m) => [m.name, m.desc].join(' ').toLocaleLowerCase('tr-TR').includes(q))
    }
    return out
  }, [menu, cat, query])

  const summary = useMemo(() => {
    const kapali = menu.filter((m) => m.available === false)
    const fiyatlar = menu.map((m) => m.price)
    return {
      count: menu.length,
      avg: menu.length ? fiyatlar.reduce((s, p) => s + p, 0) / menu.length : 0,
      closed: kapali.length,
      popular: menu.filter((m) => m.popular).length,
    }
  }, [menu])

  const openNew = () => {
    setEditing({ ...EMPTY })
    setErrors({})
  }

  const openEdit = (m) => {
    setEditing({ ...EMPTY, ...m, options: m.options ?? null })
    setErrors({})
  }

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setEditing((d) => ({ ...d, [k]: v }))
    setErrors((x) => ({ ...x, [k]: null }))
  }

  const submit = (e) => {
    e.preventDefault()
    const err = {}
    if (!editing.name.trim()) err.name = 'Kalem adı gerekli'
    if (String(editing.price).trim() === '' || Number(editing.price) < 0) err.price = 'Geçerli bir fiyat girin'
    setErrors(err)
    if (Object.keys(err).length) return

    saveMenuItem({
      ...editing,
      price: Number(editing.price),
      prep: Number(editing.prep) || 4,
      options: editing.options?.length ? editing.options : null,
      linkedProductId: editing.linkedProductId || null,
    })
    toast(editing.id ? 'Menü kalemi güncellendi' : 'Menüye kalem eklendi', 'good')
    setEditing(null)
  }

  const addOption = () => {
    const v = optionDraft.trim()
    if (!v) return
    setEditing((d) => ({ ...d, options: [...(d.options ?? []), v] }))
    setOptionDraft('')
  }

  return (
    <div className="space-y-5">
      {/* özet */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Menü kalemi', num(summary.count), 'toplam'],
          ['Ortalama fiyat', money(summary.avg), 'menü geneli'],
          ['Satışta değil', num(summary.closed), 'müşteri göremez'],
          ['Öne çıkan', num(summary.popular), '“çok tercih edilen” etiketi'],
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
            placeholder="Menüde ara…"
            className="h-10 w-full rounded-xl border border-line bg-white pl-10 pr-4 text-[0.84rem] outline-none transition placeholder:text-faint focus:border-crimson/60"
          />
        </label>
        <Button variant="outline" size="sm" onClick={() => setConfirmReset(true)}>
          <RotateCcw size={15} /> Menüyü sıfırla
        </Button>
        <Button size="sm" onClick={openNew}>
          <Plus size={16} /> Yeni kalem
        </Button>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <Segmented
          options={[{ id: 'hepsi', label: 'Tümü' }, ...MENU_KATEGORILERI.map((c) => ({ id: c.id, label: c.name }))]}
          value={cat}
          onChange={setCat}
        />
      </div>

      <Panel title={`${num(rows.length)} kalem`} subtitle="Fiyatı doğrudan tablodan değiştirebilirsiniz" bodyClass="!px-0 !py-4">
        <DataTable
          rowKey={(m) => m.id}
          rows={rows}
          empty="Bu filtreye uyan kalem yok"
          columns={[
            {
              key: 'name',
              label: 'Kalem',
              render: (m) => (
                <div className="flex items-center gap-3">
                  <CafeGlyph cat={m.cat} size={40} />
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate text-[0.85rem] font-medium text-steel-900">
                      {m.name}
                      {m.available === false && (
                        <span className="shrink-0 rounded-full bg-[#FBEAEA] px-2 py-0.5 text-[0.62rem] font-semibold text-[#9A2C2C]">
                          Satışta değil
                        </span>
                      )}
                    </p>
                    <p className="truncate text-[0.72rem] text-muted">{m.desc || '—'}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'cat',
              label: 'Kategori',
              hideSm: true,
              render: (m) => (
                <span className="text-[0.8rem] text-muted">
                  {MENU_KATEGORILERI.find((c) => c.id === m.cat)?.name ?? m.cat}
                </span>
              ),
            },
            {
              key: 'price',
              label: 'Fiyat (₺)',
              align: 'right',
              render: (m) => (
                <input
                  type="number"
                  min={0}
                  value={m.price}
                  onChange={(e) => setMenuPrice(m.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-9 w-24 rounded-lg border border-line bg-white px-2.5 text-right text-[0.85rem] font-medium tnum text-steel-900 outline-none transition focus:border-crimson/70 focus:ring-2 focus:ring-crimson/12"
                />
              ),
            },
            {
              key: 'prep',
              label: 'Hazırlık',
              align: 'right',
              hideSm: true,
              render: (m) => <span className="text-[0.8rem] tnum text-muted">{m.prep} dk</span>,
            },
            {
              key: 'link',
              label: 'Eve götür',
              hideSm: true,
              render: (m) => {
                const p = products.find((x) => x.id === m.linkedProductId)
                return p ? (
                  <span className="text-[0.76rem] text-steel-700">{p.name}</span>
                ) : (
                  <span className="text-[0.76rem] text-faint">—</span>
                )
              },
            },
            {
              key: 'actions',
              label: '',
              align: 'right',
              render: (m) => (
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => togglePopular(m.id)}
                    title={m.popular ? 'Öne çıkarmayı kaldır' : 'Öne çıkar'}
                    className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                      m.popular ? 'bg-crimson-50 text-crimson-700' : 'text-faint hover:bg-mist hover:text-steel-800'
                    }`}
                  >
                    <Star size={14} fill={m.popular ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => toggleAvailable(m.id)}
                    title={m.available === false ? 'Satışa aç' : 'Satıştan kaldır'}
                    className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                      m.available === false
                        ? 'bg-[#FBEAEA] text-[#9A2C2C]'
                        : 'text-faint hover:bg-mist hover:text-steel-800'
                    }`}
                  >
                    <EyeOff size={14} />
                  </button>
                  <button
                    onClick={() => openEdit(m)}
                    title="Düzenle"
                    className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-mist hover:text-steel-800"
                  >
                    <Coffee size={14} />
                  </button>
                  <button
                    onClick={() => setConfirming(m)}
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
        <p className="px-5 pt-4 text-[0.75rem] leading-relaxed text-muted">
          Fiyat değişikliği anında QR menüye ve garson ekranına yansır.{' '}
          <strong className="font-medium text-steel-900">Açık hesaplar etkilenmez</strong> — her
          sipariş kendi fiyatını kaydeder.
        </p>
      </Panel>

      {/* ------------------------------------------------- kalem düzenleyici */}
      <Sheet
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Kalemi düzenle' : 'Yeni menü kalemi'}
        footer={
          <Button size="lg" className="w-full" onClick={submit}>
            {editing?.id ? 'Değişiklikleri kaydet' : 'Menüye ekle'}
          </Button>
        }
      >
        {editing && (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Kalem adı" required>
              <input className={input} value={editing.name} onChange={set('name')} placeholder="Türk Kahvesi" />
              {errors.name && <span className="mt-1 block text-[0.7rem] text-[#9A2C2C]">{errors.name}</span>}
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Kategori" required>
                <select className={input} value={editing.cat} onChange={set('cat')}>
                  {MENU_KATEGORILERI.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Fiyat (₺)" required>
                <input className={input} type="number" min="0" value={editing.price} onChange={set('price')} placeholder="75" />
                {errors.price && <span className="mt-1 block text-[0.7rem] text-[#9A2C2C]">{errors.price}</span>}
              </Field>
            </div>

            <Field label="Açıklama" hint="Menüde kalem adının altında görünür">
              <textarea
                rows={2}
                className={`${input} h-auto py-2.5 leading-relaxed`}
                value={editing.desc}
                onChange={set('desc')}
                placeholder={brand.menuDescPlaceholder}
              />
            </Field>

            <Field label="Ortalama hazırlık (dk)" hint="Müşteriye bilgi olarak gösterilir">
              <input className={input} type="number" min="1" value={editing.prep} onChange={set('prep')} />
            </Field>

            {/* tercih seçenekleri */}
            <Field label="Tercih seçenekleri" hint="Örn. Sade, Az şekerli, Laktozsuz">
              <div className="flex gap-2">
                <input
                  className={input}
                  value={optionDraft}
                  onChange={(e) => setOptionDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addOption()
                    }
                  }}
                  placeholder="Seçenek yazıp Enter’a basın"
                />
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus size={15} />
                </Button>
              </div>
            </Field>
            {editing.options?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {editing.options.map((o, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-[0.78rem] text-ink-soft"
                  >
                    {o}
                    <button
                      type="button"
                      onClick={() =>
                        setEditing((d) => ({ ...d, options: d.options.filter((_, j) => j !== i) }))
                      }
                      className="text-faint transition hover:text-[#9A2C2C]"
                      aria-label={`${o} seçeneğini kaldır`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* e-ticaret bağlantısı */}
            <Field
              label="Eve götür bağlantısı"
              hint="Seçilirse menüde “Bunu eve götürün” kartı çıkar ve müşteri online mağazaya gider"
            >
              <select
                className={input}
                value={editing.linkedProductId ?? ''}
                onChange={(e) => setEditing((d) => ({ ...d, linkedProductId: e.target.value || null }))}
              >
                <option value="">Bağlantı yok</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.variant} — {money(p.price)}
                  </option>
                ))}
              </select>
            </Field>

            <div className="space-y-3 rounded-xl bg-mist/60 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={editing.popular}
                  onChange={set('popular')}
                  className="mt-0.5 h-4 w-4 accent-[#2F3842]"
                />
                <span className="text-[0.82rem] text-ink-soft">
                  <strong className="font-medium text-steel-900">Öne çıkar</strong>
                  <span className="mt-0.5 block text-[0.74rem] text-muted">
                    Menüde “Çok tercih edilen” etiketi görünür
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={editing.available !== false}
                  onChange={(e) => setEditing((d) => ({ ...d, available: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 accent-[#2F3842]"
                />
                <span className="text-[0.82rem] text-ink-soft">
                  <strong className="font-medium text-steel-900">Satışta</strong>
                  <span className="mt-0.5 block text-[0.74rem] text-muted">
                    Kapatılırsa QR menüde ve garson ekranında görünmez
                  </span>
                </span>
              </label>
            </div>
          </form>
        )}
      </Sheet>

      {/* silme onayı */}
      {confirming && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-6">
          <div className="animate-scrim absolute inset-0 bg-steel-950/45" onClick={() => setConfirming(null)} />
          <div className="animate-rise relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#FBEAEA] text-[#9A2C2C]">
              <Trash2 size={18} />
            </span>
            <h3 className="mt-4 text-[1.2rem]">“{confirming.name}” silinsin mi?</h3>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">
              Menüden tamamen kalkar. Geçici olarak kaldırmak istiyorsanız silmek yerine{' '}
              <strong className="font-medium text-steel-900">satıştan kaldırın</strong> — geçmiş
              raporlar her iki durumda da korunur.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirming(null)}>
                Vazgeç
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  deleteMenuItem(confirming.id)
                  toast('Menü kalemi silindi')
                  setConfirming(null)
                }}
              >
                Sil
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* sıfırlama onayı */}
      {confirmReset && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-6">
          <div className="animate-scrim absolute inset-0 bg-steel-950/45" onClick={() => setConfirmReset(false)} />
          <div className="animate-rise relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-crimson-50" style={{ color: VIZ.status.warning }}>
              <AlertTriangle size={18} />
            </span>
            <h3 className="mt-4 text-[1.2rem]">Menü sıfırlansın mı?</h3>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">
              Tüm fiyat değişiklikleri, eklenen ve silinen kalemler geri alınır; menü demo
              başlangıcındaki hâline döner.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmReset(false)}>
                Vazgeç
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  resetMenu()
                  toast('Menü sıfırlandı', 'good')
                  setConfirmReset(false)
                }}
              >
                Sıfırla
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
