import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Eye, Plus, Save, X } from 'lucide-react'

import { useStore } from '../../store/StoreContext'
import { useTenant } from '../../store/TenantContext'
import { money, slugify } from '../../lib/format'
import { Panel } from '../../components/admin/AdminUI'
import { Badge, Button } from '../../components/ui/Bits'
import ProductImage, { TONES } from '../../components/ui/ProductImage'

const ARTS = [
  ['bag', 'Kahve paketi'],
  ['giftset', 'Hediye kutusu'],
  ['cups', 'Fincan seti'],
  ['cezve', 'Cezve'],
  ['lokum', 'Lokum kutusu'],
  ['kolonya', 'Kolonya şişesi'],
  ['serbet', 'Şerbet şişesi'],
  ['hamper', 'Hediye sepeti'],
]

const TONE_LABEL = {
  steel: 'Zümrüt',
  copper: 'Bakır',
  crimson: 'Altın',
  clay: 'Kiremit',
  ink: 'Koyu',
}

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
  variant: '',
  category: 'Kahve',
  collection: 'anadolu-bilgeleri',
  price: '',
  compareAt: '',
  stock: '',
  sku: '',
  short: '',
  description: '',
  badge: '',
  art: 'bag',
  tone: 'steel',
  featured: false,
  notes: [],
  attrs: {},
}

export default function ProductEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, categories, collections, saveProduct } = useStore()
  const { brand } = useTenant()

  const existing = products.find((p) => p.id === id)
  const [form, setForm] = useState(() =>
    existing
      ? {
          ...EMPTY,
          ...existing,
          compareAt: existing.compareAt ?? '',
          badge: existing.badge ?? '',
          notes: existing.notes ?? [],
          attrs: existing.attrs ?? {},
        }
      : EMPTY
  )
  const [noteDraft, setNoteDraft] = useState('')
  const [attrDraft, setAttrDraft] = useState({ k: '', v: '' })
  const [errors, setErrors] = useState({})

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((x) => ({ ...x, [k]: null }))
  }

  const preview = useMemo(
    () => ({
      ...form,
      price: Number(form.price) || 0,
      compareAt: Number(form.compareAt) || null,
      slug: form.slug || slugify(`${form.name} ${form.variant}`),
    }),
    [form]
  )

  const submit = (e) => {
    e.preventDefault()
    const err = {}
    if (!form.name.trim()) err.name = 'Ürün adı gerekli'
    if (!String(form.price).trim() || Number(form.price) <= 0) err.price = 'Geçerli bir fiyat girin'
    if (form.stock === '' || Number(form.stock) < 0) err.stock = 'Stok adedi girin'
    setErrors(err)
    if (Object.keys(err).length) return

    saveProduct({
      ...form,
      id: existing?.id,
      price: Number(form.price),
      compareAt: form.compareAt ? Number(form.compareAt) : null,
      stock: Number(form.stock),
      badge: form.badge || null,
      sku: form.sku || `${brand.orderPrefix}-${slugify(form.name).slice(0, 6).toUpperCase()}`,
      slug: form.slug || slugify(`${form.name} ${form.variant}`),
    })
    navigate('/yonetim/urunler')
  }

  const addNote = () => {
    const v = noteDraft.trim()
    if (!v) return
    setForm((f) => ({ ...f, notes: [...f.notes, v] }))
    setNoteDraft('')
  }

  const addAttr = () => {
    const { k, v } = attrDraft
    if (!k.trim() || !v.trim()) return
    setForm((f) => ({ ...f, attrs: { ...f.attrs, [k.trim()]: v.trim() } }))
    setAttrDraft({ k: '', v: '' })
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/yonetim/urunler"
          className="inline-flex items-center gap-1.5 text-[0.8rem] text-muted transition hover:text-steel-800"
        >
          <ArrowLeft size={15} /> Ürünlere dön
        </Link>
        <div className="flex gap-2.5">
          <Button as={Link} to="/yonetim/urunler" variant="outline" size="sm" type="button">
            Vazgeç
          </Button>
          <Button type="submit" size="sm">
            <Save size={15} /> {existing ? 'Değişiklikleri kaydet' : 'Ürünü yayınla'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_20rem]">
        {/* -------------------------------------------------- form */}
        <div className="space-y-5">
          <Panel title="Temel bilgiler">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Ürün adı" required className="sm:col-span-2">
                <input className={input} value={form.name} onChange={set('name')} placeholder={brand.productPlaceholder} />
                {errors.name && <span className="mt-1 block text-[0.7rem] text-[#9A2C2C]">{errors.name}</span>}
              </Field>

              <Field label="Varyant / gramaj" hint="Örn. 100 g, 200 ml, 2'li set">
                <input className={input} value={form.variant} onChange={set('variant')} placeholder="100 g" />
              </Field>

              <Field label="Stok kodu (SKU)" hint="Boş bırakılırsa otomatik üretilir">
                <input className={input} value={form.sku} onChange={set('sku')} placeholder="KH-EDB-100" />
              </Field>

              <Field label="Kategori" required>
                <select className={input} value={form.category} onChange={set('category')}>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Koleksiyon">
                <select className={input} value={form.collection} onChange={set('collection')}>
                  {collections.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Kısa açıklama" className="sm:col-span-2" hint="Vitrin kartında görünen tek cümle">
                <input
                  className={input}
                  value={form.short}
                  onChange={set('short')}
                  placeholder="Orta kavrum, %100 Arabica. Dengeli ve yumuşak."
                />
              </Field>

              <Field label="Detaylı açıklama" className="sm:col-span-2">
                <textarea
                  rows={5}
                  className={`${input} h-auto py-2.5 leading-relaxed`}
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Ürünün hikâyesi, üretim şekli, kullanım önerisi…"
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Fiyat ve stok">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Satış fiyatı (₺)" required>
                <input className={input} type="number" min="0" value={form.price} onChange={set('price')} placeholder="250" />
                {errors.price && <span className="mt-1 block text-[0.7rem] text-[#9A2C2C]">{errors.price}</span>}
              </Field>
              <Field label="Liste fiyatı (₺)" hint="İndirim göstermek için">
                <input className={input} type="number" min="0" value={form.compareAt} onChange={set('compareAt')} placeholder="350" />
              </Field>
              <Field label="Stok adedi" required>
                <input className={input} type="number" min="0" value={form.stock} onChange={set('stock')} placeholder="40" />
                {errors.stock && <span className="mt-1 block text-[0.7rem] text-[#9A2C2C]">{errors.stock}</span>}
              </Field>
            </div>

            {Number(form.compareAt) > Number(form.price) && Number(form.price) > 0 && (
              <p className="mt-4 rounded-lg bg-crimson-50 px-3.5 py-2.5 text-[0.78rem] text-crimson-700">
                Vitrinde <strong className="font-semibold">
                  %{Math.round((1 - form.price / form.compareAt) * 100)}
                </strong>{' '}
                indirim rozeti görünecek.
              </p>
            )}
          </Panel>

          <Panel title="Görsel" subtitle="Gerçek fotoğraf yüklenene kadar markaya uygun çizim kullanılır">
            <Field label="Ambalaj tipi">
              <div className="mt-1 grid grid-cols-4 gap-2.5">
                {ARTS.map(([art, label]) => (
                  <button
                    key={art}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, art }))}
                    className={`overflow-hidden rounded-lg border-2 transition ${
                      form.art === art ? 'border-steel-800' : 'border-transparent hover:border-crimson/50'
                    }`}
                    title={label}
                  >
                    <ProductImage art={art} tone={form.tone} className="aspect-square w-full" />
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Renk tonu" className="mt-5">
              <div className="mt-1 flex flex-wrap gap-2">
                {Object.keys(TONES).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, tone }))}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[0.78rem] transition ${
                      form.tone === tone
                        ? 'border-steel-800 bg-steel-50 font-medium text-steel-900'
                        : 'border-line text-ink-soft hover:border-crimson/50'
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ background: TONES[tone].base }}
                    />
                    {TONE_LABEL[tone]}
                  </button>
                ))}
              </div>
            </Field>
          </Panel>

          <Panel title="Tat notları ve özellikler">
            <Field label="Tat notları" hint="Kahveler için: kakao, fındık, turunçgil…">
              <div className="flex gap-2">
                <input
                  className={input}
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addNote()
                    }
                  }}
                  placeholder="Not ekleyip Enter’a basın"
                />
                <Button type="button" variant="outline" size="sm" onClick={addNote}>
                  <Plus size={15} />
                </Button>
              </div>
            </Field>
            {form.notes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.notes.map((n, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-[0.78rem] text-ink-soft"
                  >
                    {n}
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, notes: f.notes.filter((_, j) => j !== i) }))}
                      className="text-faint transition hover:text-[#9A2C2C]"
                      aria-label={`${n} notunu kaldır`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-line pt-5">
              <Field label="Özellik satırları" hint="Ürün sayfasında tablo olarak görünür">
                <div className="flex gap-2">
                  <input
                    className={input}
                    value={attrDraft.k}
                    onChange={(e) => setAttrDraft((d) => ({ ...d, k: e.target.value }))}
                    placeholder="Kavrum"
                  />
                  <input
                    className={input}
                    value={attrDraft.v}
                    onChange={(e) => setAttrDraft((d) => ({ ...d, v: e.target.value }))}
                    placeholder="Orta"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addAttr}>
                    <Plus size={15} />
                  </Button>
                </div>
              </Field>
              {Object.keys(form.attrs).length > 0 && (
                <dl className="mt-3 divide-y divide-line rounded-lg bg-mist/50 px-3.5">
                  {Object.entries(form.attrs).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-3 py-2.5 text-[0.82rem]">
                      <dt className="text-muted">{k}</dt>
                      <dd className="flex items-center gap-2.5 font-medium text-steel-900">
                        {v}
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => {
                              const next = { ...f.attrs }
                              delete next[k]
                              return { ...f, attrs: next }
                            })
                          }
                          className="text-faint transition hover:text-[#9A2C2C]"
                          aria-label={`${k} özelliğini kaldır`}
                        >
                          <X size={13} />
                        </button>
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </Panel>
        </div>

        {/* ----------------------------------------------- önizleme */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Panel title="Vitrin önizlemesi" subtitle="Müşterinin göreceği kart">
            <div className="overflow-hidden rounded-xl bg-mist">
              <ProductImage art={preview.art} tone={preview.tone} className="aspect-square w-full" />
            </div>
            <div className="pt-3.5">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-crimson-700">
                {preview.category}
              </p>
              <h3 className="mt-1 text-[1.05rem] leading-snug">{preview.name || 'Ürün adı'}</h3>
              <p className="text-[0.76rem] text-muted">{preview.variant || 'Varyant'}</p>
              <p className="mt-2 line-clamp-2 text-[0.79rem] leading-relaxed text-muted">
                {preview.short || 'Kısa açıklama burada görünecek.'}
              </p>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-[1.02rem] font-semibold tnum text-steel-900">
                  {money(preview.price)}
                </span>
                {preview.compareAt > preview.price && (
                  <span className="text-[0.8rem] tnum text-faint line-through">
                    {money(preview.compareAt)}
                  </span>
                )}
              </div>
            </div>
          </Panel>

          <Panel title="Yayın ayarları">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={set('featured')}
                className="mt-0.5 h-4 w-4 accent-[#2F3842]"
              />
              <span className="text-[0.82rem] text-ink-soft">
                <strong className="font-medium text-steel-900">Anasayfa vitrininde göster</strong>
                <span className="mt-0.5 block text-[0.74rem] text-muted">
                  Öne Çıkanlar bölümünde listelenir
                </span>
              </span>
            </label>

            <Field label="Rozet" className="mt-5" hint="Boş bırakılabilir">
              <select className={input} value={form.badge} onChange={set('badge')}>
                <option value="">Rozet yok</option>
                {['Yeni', 'Çok Satan', 'Hediyelik', 'El Yapımı', 'Mevsimlik', 'Avantajlı Boy', 'Kurumsal'].map(
                  (b) => (
                    <option key={b}>{b}</option>
                  )
                )}
              </select>
            </Field>

            {form.badge && (
              <div className="mt-3">
                <Badge tone={form.badge === 'Yeni' ? 'steel' : 'crimson'}>{form.badge}</Badge>
              </div>
            )}

            <div className="mt-5 rounded-lg bg-mist/60 px-3.5 py-3">
              <p className="text-[0.7rem] text-muted">URL adresi</p>
              <p className="mt-1 break-all text-[0.76rem] tnum text-steel-900">
                /urun/{preview.slug || 'urun-adi'}
              </p>
            </div>
          </Panel>

          {existing && (
            <Button
              as={Link}
              to={`/urun/${existing.slug}`}
              target="_blank"
              variant="outline"
              size="sm"
              className="w-full"
              type="button"
            >
              <Eye size={15} /> Mağazada görüntüle
            </Button>
          )}
        </aside>
      </div>

      {/* alt kaydet çubuğu (mobil) */}
      <div className="sticky bottom-0 -mx-5 flex gap-3 border-t border-line bg-white/95 px-5 py-3.5 backdrop-blur lg:hidden">
        <Button as={Link} to="/yonetim/urunler" variant="outline" className="flex-1" type="button">
          Vazgeç
        </Button>
        <Button type="submit" className="flex-1">
          <Check size={16} /> Kaydet
        </Button>
      </div>
    </form>
  )
}
