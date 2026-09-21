import { useMemo, useState } from 'react'
import {
  Check, Clock, Inbox, Link2, Minus, Plus, QrCode, Receipt,
  Unlink, UserRound, Users, X,
} from 'lucide-react'

import { useCafe } from '../../store/CafeContext'
import { BOLGELER, MENU_KATEGORILERI, ODEME_TIPLERI, zoneName } from '../../data/cafe'
import { money, num, time } from '../../lib/format'
import { CafeGlyph, Elapsed, Sheet } from '../../components/cafe/CafeBits'
import { Button } from '../../components/ui/Bits'

function StatTile({ label, value, hint, accent }) {
  return (
    <div className="rounded-xl border border-line bg-white px-4 py-3">
      <p className="text-[0.66rem] font-medium uppercase tracking-[0.1em] text-muted">{label}</p>
      <p
        className="mt-1 font-display text-[1.45rem] font-semibold leading-none tnum"
        style={{ color: accent ?? '#232930' }}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-[0.68rem] text-faint">{hint}</p>}
    </div>
  )
}

function SourceBadge({ source, waiter }) {
  const qr = source === 'QR Menü'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.66rem] font-semibold ${
        qr ? 'bg-crimson-50 text-crimson-700' : 'bg-steel-50 text-steel-700'
      }`}
    >
      {qr ? <QrCode size={11} /> : <UserRound size={11} />}
      {qr ? 'QR menü' : waiter ? `Garson · ${waiter}` : 'Garson'}
    </span>
  )
}

export default function Kasa() {
  const {
    pending, tables, accounts, todayStats, activeMenu,
    assignToTable, cancelPending, accountItems, accountTotal,
    addItemToAccount, detachOrder, setGuests, closeAccount, cancelAccount,
  } = useCafe()

  const [tab, setTab] = useState('gelen') // mobilde sekme
  const [assigning, setAssigning] = useState(null) // masaya bağlanacak sipariş
  const [openAccountId, setOpenAccountId] = useState(null)
  const [payOpen, setPayOpen] = useState(false)
  const [payment, setPayment] = useState(ODEME_TIPLERI[1])
  const [addOpen, setAddOpen] = useState(false)
  const [addCat, setAddCat] = useState(MENU_KATEGORILERI[0].id)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [zoneFilter, setZoneFilter] = useState('hepsi')

  const account = accounts.find((a) => a.id === openAccountId) ?? null
  const items = useMemo(() => (account ? accountItems(account) : []), [account, accountItems])
  const total = account ? accountTotal(account) : 0

  const visibleTables = useMemo(
    () => (zoneFilter === 'hepsi' ? tables : tables.filter((t) => t.zone === zoneFilter)),
    [tables, zoneFilter]
  )

  const dolu = tables.filter((t) => t.status === 'dolu').length

  const doAssign = (tableId) => {
    if (!assigning) return
    assignToTable(assigning.id, tableId)
    setAssigning(null)
  }

  const doClose = () => {
    if (!account) return
    closeAccount(account.id, payment)
    setPayOpen(false)
    setOpenAccountId(null)
  }

  /* --------------------------------------------------------- panolar */

  const GelenPano = (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[1.1rem]">Gelen siparişler</h2>
        <span className="text-[0.76rem] text-muted">
          {num(pending.length)} bekliyor · {money(todayStats.pendingValue)}
        </span>
      </div>

      {pending.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-white/60 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-steel-50 text-steel-600">
            <Inbox size={22} strokeWidth={1.5} />
          </span>
          <p className="mt-4 text-[1rem] font-medium text-steel-900">Bekleyen sipariş yok</p>
          <p className="mt-1 text-[0.82rem] text-muted">
            QR menüden ya da garsondan gelen siparişler burada belirir.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {pending.map((o) => (
            <li key={o.id} className="rounded-2xl border border-crimson/40 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-[1.3rem] font-semibold leading-none tnum text-steel-900">
                    #{o.shortNo ?? o.id.replace('SP-', '')}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <SourceBadge source={o.source} waiter={o.waiter} />
                    <span className="flex items-center gap-1 text-[0.72rem] text-muted">
                      <Clock size={11} /> <Elapsed from={o.createdAt} /> ({time(o.createdAt)})
                    </span>
                  </div>
                </div>
                <span className="font-display text-[1.35rem] font-semibold tnum text-steel-900">
                  {money(o.total)}
                </span>
              </div>

              <ul className="mt-3 space-y-1.5">
                {o.items.map((it, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-[0.84rem]">
                    <span className="w-6 shrink-0 text-right font-semibold tnum text-steel-700">
                      {it.qty}×
                    </span>
                    <span className="min-w-0 flex-1 truncate text-ink-soft">
                      {it.name}
                      {it.note && <span className="ml-1.5 text-[0.74rem] text-muted">({it.note})</span>}
                    </span>
                    <span className="shrink-0 tnum text-muted">{money(it.total)}</span>
                  </li>
                ))}
              </ul>

              {o.note && (
                <p className="mt-3 rounded-lg bg-crimson-50 px-3 py-2 text-[0.78rem] text-crimson-700">
                  Not: {o.note}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {/* Karekodun taşıdığı masa ipucu — tek dokunuşla bağla */}
                {o.tableHint && tables.some((t) => t.id === o.tableHint) && (
                  <Button
                    size="sm"
                    variant="crimson"
                    className="flex-1"
                    onClick={() => assignToTable(o.id, o.tableHint)}
                    title="Karekod bu masadan okutulmuş"
                  >
                    <QrCode size={15} /> Masa {tables.find((t) => t.id === o.tableHint)?.no}
                  </Button>
                )}
                <Button size="sm" className="flex-1" onClick={() => setAssigning(o)}>
                  <Link2 size={15} /> {o.tableHint ? 'Başka masa' : 'Masaya bağla'}
                </Button>
                <button
                  onClick={() => cancelPending(o.id)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-faint transition hover:bg-[#FBEAEA] hover:text-[#9A2C2C]"
                  aria-label="Siparişi iptal et"
                  title="İptal et"
                >
                  <X size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )

  const MasaPano = (
    <section>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-[1.1rem]">Masalar</h2>
        <span className="text-[0.76rem] text-muted">
          {dolu}/{tables.length} dolu · açık hesap {money(todayStats.openValue)}
        </span>
      </div>

      <div className="no-scrollbar -mx-1 mb-3 flex gap-2 overflow-x-auto px-1">
        {[{ id: 'hepsi', name: 'Tümü' }, ...BOLGELER].map((z) => (
          <button
            key={z.id}
            onClick={() => setZoneFilter(z.id)}
            className={`h-9 shrink-0 rounded-lg px-3.5 text-[0.8rem] font-medium transition ${
              zoneFilter === z.id ? 'bg-steel-800 text-snow' : 'bg-white text-ink-soft ring-1 ring-line'
            }`}
          >
            {z.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
        {visibleTables.map((t) => (
          <button
            key={t.id}
            onClick={() => t.account && setOpenAccountId(t.account.id)}
            disabled={!t.account}
            className={`flex min-h-[6.5rem] flex-col rounded-xl border p-3 text-left transition ${
              t.account
                ? 'border-steel-600/35 bg-white active:scale-[0.98] hover:border-steel-800'
                : 'cursor-default border-dashed border-line bg-white/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="font-display text-[1.35rem] font-semibold leading-none text-steel-900">
                {t.no}
              </span>
              <span className="flex items-center gap-1 text-[0.68rem] text-faint">
                <Users size={11} />
                {t.account?.guests ?? t.seats}
              </span>
            </div>

            {t.account ? (
              <>
                <span className="mt-1.5 flex items-center gap-1 text-[0.68rem] text-muted">
                  <Clock size={10} /> <Elapsed from={t.account.openedAt} />
                </span>
                <span className="mt-auto pt-2">
                  <span className="block text-[0.68rem] text-faint">
                    {t.account.orders.length} sipariş
                  </span>
                  <span className="block text-[1rem] font-semibold tnum text-steel-900">
                    {money(t.total)}
                  </span>
                </span>
              </>
            ) : (
              <span className="mt-auto pt-2 text-[0.74rem] text-faint">Boş</span>
            )}
          </button>
        ))}
      </div>
    </section>
  )

  /* ------------------------------------------------------------------ */

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
      {/* özet */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <StatTile
          label="Bekleyen sipariş"
          value={num(todayStats.pendingCount)}
          hint={money(todayStats.pendingValue)}
          accent={todayStats.pendingCount > 0 ? '#8A6100' : undefined}
        />
        <StatTile label="Dolu masa" value={`${dolu}/${tables.length}`} hint={money(todayStats.openValue)} />
        <StatTile label="Bugün ciro" value={money(todayStats.revenue)} hint={`${num(todayStats.tickets)} hesap`} />
        <StatTile label="Ortalama hesap" value={money(todayStats.avgTicket)} hint="masa başına" />
      </div>

      {/* mobil sekmeler */}
      <div className="mt-5 flex gap-2 lg:hidden">
        {[
          ['gelen', 'Gelen siparişler', pending.length],
          ['masalar', 'Masalar', dolu],
        ].map(([id, label, n]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-[0.84rem] font-medium transition ${
              tab === id ? 'bg-steel-800 text-snow' : 'bg-white text-ink-soft ring-1 ring-line'
            }`}
          >
            {label}
            <span
              className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.66rem] font-bold tnum ${
                tab === id ? 'bg-snow/20' : 'bg-mist text-muted'
              }`}
            >
              {n}
            </span>
          </button>
        ))}
      </div>

      {/* panolar */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={tab === 'gelen' ? '' : 'hidden lg:block'}>{GelenPano}</div>
        <div className={tab === 'masalar' ? '' : 'hidden lg:block'}>{MasaPano}</div>
      </div>

      {/* ------------------------------------------ masaya bağlama */}
      <Sheet
        open={Boolean(assigning)}
        onClose={() => setAssigning(null)}
        title={assigning ? `${'#' + (assigning.shortNo ?? assigning.id.replace('SP-', ''))} hangi masaya?` : ''}
      >
        {assigning && (
          <>
            <div className="rounded-xl bg-mist/70 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <SourceBadge source={assigning.source} waiter={assigning.waiter} />
                <span className="font-semibold tnum text-steel-900">{money(assigning.total)}</span>
              </div>
              <p className="mt-2 text-[0.8rem] text-muted">
                {assigning.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
              </p>
              {assigning.note && (
                <p className="mt-2 text-[0.78rem] font-medium text-crimson-700">Not: {assigning.note}</p>
              )}
            </div>

            <p className="eyebrow mt-6">Masa seçin</p>
            <p className="mt-1 text-[0.76rem] text-muted">
              Dolu masaya bağlarsanız sipariş o masanın hesabına eklenir.
            </p>

            <div className="mt-4 space-y-5">
              {BOLGELER.map((z) => (
                <div key={z.id}>
                  <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
                    {z.name}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {tables
                      .filter((t) => t.zone === z.id)
                      .map((t) => (
                        <button
                          key={t.id}
                          onClick={() => doAssign(t.id)}
                          className={`flex min-h-[3.75rem] flex-col items-center justify-center rounded-xl px-1 py-2 transition active:scale-95 ${
                            t.account
                              ? 'bg-steel-50 ring-1 ring-steel-600/35 hover:ring-steel-800'
                              : 'bg-white ring-1 ring-line hover:ring-crimson'
                          }`}
                        >
                          <span className="text-[1rem] font-semibold leading-none text-steel-900">
                            {t.no}
                          </span>
                          <span className="mt-1 text-[0.62rem] tnum text-muted">
                            {t.account ? money(t.total) : 'boş'}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Sheet>

      {/* ------------------------------------------- masa hesap özeti */}
      <Sheet
        open={Boolean(account) && !payOpen && !addOpen}
        onClose={() => setOpenAccountId(null)}
        title={account ? `Masa ${account.tableNo} · hesap özeti` : ''}
        footer={
          account && (
            <>
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-[0.9rem] font-medium text-ink-soft">Toplam</span>
                <span className="font-display text-[1.7rem] font-semibold tnum text-steel-900">
                  {money(total)}
                </span>
              </div>
              <div className="flex gap-2.5">
                <Button variant="outline" className="flex-1" onClick={() => setAddOpen(true)}>
                  <Plus size={15} /> Kalem ekle
                </Button>
                <Button className="flex-[1.4]" onClick={() => setPayOpen(true)}>
                  <Receipt size={16} /> Hesabı kapat
                </Button>
              </div>
              <button
                onClick={() => setConfirmCancel(true)}
                className="mt-2 w-full py-2 text-[0.76rem] text-muted transition hover:text-clay"
              >
                Masayı iptal et
              </button>
            </>
          )
        }
      >
        {account && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[0.78rem] text-muted">
                <span>{zoneName(account.zone)}</span>
                <span className="text-faint">·</span>
                <Clock size={12} /> <Elapsed from={account.openedAt} />
                <span className="text-faint">·</span>
                <span className="tnum">{account.id}</span>
              </p>
              <div className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-line">
                <Users size={14} className="text-muted" />
                <button
                  onClick={() => setGuests(account.id, account.guests - 1)}
                  className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-mist"
                  aria-label="Kişi azalt"
                >
                  <Minus size={13} />
                </button>
                <span className="w-4 text-center text-[0.88rem] font-semibold tnum text-steel-900">
                  {account.guests}
                </span>
                <button
                  onClick={() => setGuests(account.id, account.guests + 1)}
                  className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-mist"
                  aria-label="Kişi artır"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* birleşik kalemler */}
            <p className="eyebrow mt-5">Hesap</p>
            <ul className="mt-2 divide-y divide-line rounded-xl bg-white ring-1 ring-line">
              {items.map((it, i) => (
                <li key={i} className="flex items-center gap-3 px-3.5 py-2.5">
                  <span className="w-7 shrink-0 text-right text-[0.86rem] font-semibold tnum text-steel-700">
                    {it.qty}×
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.86rem] text-ink-soft">{it.name}</span>
                    {it.note && <span className="block text-[0.72rem] text-muted">{it.note}</span>}
                  </span>
                  <span className="shrink-0 text-[0.86rem] font-semibold tnum text-steel-900">
                    {money(it.total)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-baseline justify-between rounded-xl bg-mist/70 px-3.5 py-3">
              <span className="text-[0.84rem] text-ink-soft">
                {account.guests} kişi · kişi başı
              </span>
              <span className="font-semibold tnum text-steel-900">
                {money(total / Math.max(1, account.guests))}
              </span>
            </div>

            {/* siparişler */}
            <p className="eyebrow mt-6">Bu masaya bağlanan siparişler</p>
            <ul className="mt-2 space-y-2">
              {account.orders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-line"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[0.82rem] font-semibold tnum text-steel-900">
                        #{o.shortNo ?? o.id.replace('SP-', '')}
                      </span>
                      <SourceBadge source={o.source} waiter={o.waiter} />
                    </span>
                    <span className="mt-1 block text-[0.74rem] text-muted">
                      {time(o.createdAt)} · {o.items.reduce((s, i) => s + i.qty, 0)} kalem
                    </span>
                  </span>
                  <span className="shrink-0 text-[0.84rem] font-semibold tnum text-steel-900">
                    {money(o.total)}
                  </span>
                  <button
                    onClick={() => detachOrder(account.id, o.id)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-faint transition hover:bg-[#FBEAEA] hover:text-[#9A2C2C]"
                    title="Yanlış masaya bağlandı — kuyruğa geri gönder"
                    aria-label="Siparişi masadan ayır"
                  >
                    <Unlink size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[0.7rem] leading-relaxed text-faint">
              Yanlış masaya bağladıysanız zincir simgesine dokunun — sipariş kuyruğa geri döner.
            </p>
          </>
        )}
      </Sheet>

      {/* ------------------------------------------------- kalem ekle */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Hesaba kalem ekle">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {MENU_KATEGORILERI.map((c) => (
            <button
              key={c.id}
              onClick={() => setAddCat(c.id)}
              className={`shrink-0 rounded-lg px-3.5 py-2 text-[0.8rem] font-medium transition ${
                addCat === c.id ? 'bg-steel-800 text-snow' : 'bg-white text-ink-soft ring-1 ring-line'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {activeMenu.filter((m) => m.cat === addCat).map((mi) => (
            <button
              key={mi.id}
              onClick={() => {
                if (account) addItemToAccount(account.id, mi.id, 1)
              }}
              className="flex items-center gap-2.5 rounded-xl border border-line bg-white p-2.5 text-left transition active:scale-[0.97] hover:border-steel-600/40"
            >
              <CafeGlyph cat={mi.cat} size={38} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.84rem] font-medium text-steel-900">
                  {mi.name}
                </span>
                <span className="block text-[0.78rem] tnum text-muted">{money(mi.price)}</span>
              </span>
              <Plus size={15} className="shrink-0 text-steel-600" />
            </button>
          ))}
        </div>

        <Button variant="outline" className="mt-5 w-full" onClick={() => setAddOpen(false)}>
          Hesaba dön
        </Button>
      </Sheet>

      {/* ----------------------------------------------------- ödeme */}
      <Sheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title={account ? `Masa ${account.tableNo} · ödeme` : ''}
        footer={
          <Button size="lg" className="w-full" onClick={doClose}>
            <Check size={16} /> {money(total)} tahsil edildi, hesabı kapat
          </Button>
        }
      >
        {account && (
          <>
            <div className="rounded-xl bg-mist/70 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[0.86rem] text-ink-soft">Toplam</span>
                <span className="font-display text-[1.6rem] font-semibold tnum text-steel-900">
                  {money(total)}
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between text-[0.76rem] text-muted">
                <span>{account.guests} kişi</span>
                <span className="tnum">
                  kişi başı {money(total / Math.max(1, account.guests))}
                </span>
              </div>
            </div>

            <p className="eyebrow mt-6">Ödeme tipi</p>
            <div className="mt-2.5 space-y-2">
              {ODEME_TIPLERI.map((p) => (
                <button
                  key={p}
                  onClick={() => setPayment(p)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-[0.88rem] transition ${
                    payment === p
                      ? 'bg-steel-800 font-medium text-snow'
                      : 'bg-white text-ink-soft ring-1 ring-line'
                  }`}
                >
                  {p}
                  {payment === p && <Check size={16} />}
                </button>
              ))}
            </div>

            <p className="mt-5 rounded-xl bg-crimson-50 p-3.5 text-[0.76rem] leading-relaxed text-crimson-700">
              Bu ekran hesabı kapatır ve raporlara işler.{' '}
              <strong className="font-semibold">Mali fiş mevcut yazarkasanızdan kesilir</strong> —
              sistem yazarkasanın yerine geçmez, yanında çalışır.
            </p>
          </>
        )}
      </Sheet>

      {/* iptal onayı */}
      {confirmCancel && account && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-6">
          <div className="animate-scrim absolute inset-0 bg-steel-950/50" onClick={() => setConfirmCancel(false)} />
          <div className="animate-rise relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#FBEAEA] text-[#9A2C2C]">
              <X size={18} />
            </span>
            <h3 className="mt-4 text-[1.2rem]">Masa {account.tableNo} iptal edilsin mi?</h3>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">
              Hesap silinir ve ciroya işlenmez. Ürünler hazırlandıysa iptal yerine hesabı kapatın.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmCancel(false)}>
                Vazgeç
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  cancelAccount(account.id)
                  setConfirmCancel(false)
                  setOpenAccountId(null)
                }}
              >
                İptal et
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
