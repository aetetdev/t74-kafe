import { useMemo, useState } from 'react'
import { Check, Minus, Plus, Search, Send, Trash2, UserRound } from 'lucide-react'

import { useCafe } from '../../store/CafeContext'
import { GARSONLAR, MENU_KATEGORILERI } from '../../data/cafe'
import { money } from '../../lib/format'
import { CafeGlyph, Sheet } from '../../components/cafe/CafeBits'
import { Button } from '../../components/ui/Bits'

/**
 * Garson ekranı — telefonda kullanılır.
 * Masa sorulmaz: sipariş kasaya düşer, masayı kasa eşleştirir.
 */
export default function Garson() {
  const { submitOrder, todayStats, activeMenu, menuById } = useCafe()

  const [waiter, setWaiter] = useState(GARSONLAR[0])
  const [cat, setCat] = useState(MENU_KATEGORILERI[0].id)
  const [query, setQuery] = useState('')
  const [lines, setLines] = useState([])
  const [reviewOpen, setReviewOpen] = useState(false)
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(null)

  const list = useMemo(() => {
    if (query.trim()) {
      const q = query.toLocaleLowerCase('tr-TR')
      return activeMenu.filter((m) => [m.name, m.desc].join(' ').toLocaleLowerCase('tr-TR').includes(q))
    }
    return activeMenu.filter((m) => m.cat === cat)
  }, [cat, query, activeMenu])

  const total = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const count = lines.reduce((s, l) => s + l.qty, 0)

  const add = (mi) => {
    setLines((c) => {
      const idx = c.findIndex((l) => l.menuItemId === mi.id)
      if (idx >= 0) return c.map((l, i) => (i === idx ? { ...l, qty: l.qty + 1 } : l))
      return [...c, { menuItemId: mi.id, name: mi.name, price: mi.price, qty: 1 }]
    })
  }

  const bump = (i, d) =>
    setLines((c) => c.map((l, j) => (j === i ? { ...l, qty: l.qty + d } : l)).filter((l) => l.qty > 0))

  const send = () => {
    if (!lines.length) return
    const order = submitOrder({
      lines: lines.map((l) => ({ menuItemId: l.menuItemId, qty: l.qty })),
      source: 'Garson',
      waiter,
      note: note.trim() || null,
    })
    if (!order) return
    setLines([])
    setNote('')
    setReviewOpen(false)
    setSent(order)
    setTimeout(() => setSent(null), 4500)
  }

  return (
    <div className="pb-28">
      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        {/* garson seçimi */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-[0.78rem] text-muted">
            <UserRound size={15} /> Sipariş alan
          </span>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {GARSONLAR.map((g) => (
              <button
                key={g}
                onClick={() => setWaiter(g)}
                className={`h-10 shrink-0 rounded-xl px-4 text-[0.83rem] transition ${
                  waiter === g
                    ? 'bg-steel-800 font-medium text-snow'
                    : 'bg-white text-ink-soft ring-1 ring-line'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <span className="ml-auto hidden text-[0.76rem] text-muted sm:block">
            Kasada bekleyen: <strong className="font-semibold text-steel-900">{todayStats.pendingCount}</strong>
          </span>
        </div>

        {/* arama */}
        <label className="relative mt-4 block">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Menüde ara…"
            className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-4 text-[0.86rem] outline-none transition placeholder:text-faint focus:border-crimson/60"
          />
        </label>

        {/* kategoriler */}
        {!query && (
          <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
            {MENU_KATEGORILERI.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`shrink-0 rounded-lg px-3.5 py-2.5 text-[0.8rem] font-medium transition ${
                  cat === c.id ? 'bg-steel-800 text-snow' : 'bg-white text-ink-soft ring-1 ring-line'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* kalemler */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((mi) => {
            const secili = lines.find((l) => l.menuItemId === mi.id)
            return (
              <button
                key={mi.id}
                onClick={() => add(mi)}
                className={`relative flex items-center gap-3 rounded-xl border p-3 text-left transition active:scale-[0.97] ${
                  secili ? 'border-steel-800 bg-steel-50' : 'border-line bg-white hover:border-crimson/50'
                }`}
              >
                <CafeGlyph cat={mi.cat} size={42} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.88rem] font-medium text-steel-900">
                    {mi.name}
                  </span>
                  <span className="block text-[0.8rem] tnum text-muted">{money(mi.price)}</span>
                </span>
                {secili && (
                  <span className="grid h-7 min-w-7 shrink-0 place-items-center rounded-full bg-steel-800 px-1.5 text-[0.75rem] font-bold tnum text-snow">
                    {secili.qty}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {list.length === 0 && (
          <p className="py-14 text-center text-[0.88rem] text-muted">Aramanıza uyan kalem yok.</p>
        )}
      </div>

      {/* alt çubuk */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-[#F1F3F5]/95 px-4 py-3 backdrop-blur-lg sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5">
          {lines.length > 0 && (
            <button
              onClick={() => setLines([])}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-muted ring-1 ring-line transition hover:text-clay"
              aria-label="Siparişi temizle"
            >
              <Trash2 size={17} />
            </button>
          )}
          <button
            onClick={() => setReviewOpen(true)}
            disabled={count === 0}
            className="flex h-12 flex-1 items-center justify-between gap-3 rounded-xl bg-steel-800 px-5 text-snow transition disabled:opacity-40 active:scale-[0.98]"
          >
            <span className="text-[0.86rem] font-medium">
              {count > 0 ? `${count} kalem` : 'Kalem seçin'}
            </span>
            <span className="text-[0.95rem] font-semibold tnum">{money(total)}</span>
          </button>
        </div>
      </div>

      {/* gönderildi bildirimi */}
      {sent && (
        <div className="fixed inset-x-0 bottom-24 z-40 px-4">
          <div className="animate-rise mx-auto flex max-w-3xl items-center gap-3 rounded-2xl bg-steel-900 px-5 py-4 text-snow shadow-xl">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-crimson text-steel-900">
              <Check size={18} strokeWidth={2.4} />
            </span>
            <span className="text-[0.86rem] leading-snug">
              <strong className="font-semibold">Sipariş {sent.shortNo} kasaya gönderildi.</strong>
              <br />
              <span className="text-snow/70">
                {money(sent.total)} · masayı kasa eşleştirecek
              </span>
            </span>
          </div>
        </div>
      )}

      {/* özet ve gönderme */}
      <Sheet
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Siparişi gönder"
        footer={
          <>
            <div className="mb-3 flex items-center justify-between text-[1rem]">
              <span className="font-medium text-ink-soft">Toplam</span>
              <span className="font-semibold tnum text-steel-900">{money(total)}</span>
            </div>
            <Button size="lg" className="w-full" onClick={send} disabled={lines.length === 0}>
              <Send size={16} /> Kasaya gönder
            </Button>
            <p className="mt-2.5 text-center text-[0.68rem] leading-relaxed text-faint">
              Masa numarası sorulmaz — siparişi kasa masaya bağlar.
            </p>
          </>
        }
      >
        <ul className="divide-y divide-line">
          {lines.map((l, i) => (
            <li key={l.menuItemId} className="flex items-center gap-3 py-3">
              <CafeGlyph cat={menuById(l.menuItemId)?.cat} size={40} />
              <span className="min-w-0 flex-1 text-[0.88rem] font-medium text-steel-900">{l.name}</span>
              <span className="flex shrink-0 items-center gap-2.5">
                <button
                  onClick={() => bump(i, -1)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-mist text-muted"
                  aria-label="Azalt"
                >
                  <Minus size={14} />
                </button>
                <span className="w-4 text-center text-[0.86rem] font-semibold tnum">{l.qty}</span>
                <button
                  onClick={() => bump(i, 1)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-mist text-muted"
                  aria-label="Artır"
                >
                  <Plus size={14} />
                </button>
                <span className="w-16 text-right text-[0.88rem] font-semibold tnum text-steel-900">
                  {money(l.price * l.qty)}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-[0.76rem] font-medium text-ink-soft">
            Kasaya not (isteğe bağlı)
          </span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Örn. pencere kenarı, 4 kişilik"
            className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[0.86rem] outline-none transition placeholder:text-faint focus:border-crimson/60"
          />
          <span className="mt-1 block text-[0.7rem] text-faint">
            Masayı bulmasını kolaylaştırmak için kısa bir tarif yazabilirsiniz.
          </span>
        </label>
      </Sheet>
    </div>
  )
}
