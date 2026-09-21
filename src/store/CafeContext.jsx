import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GARSONLAR, MASALAR, buildCafeDataset, masaById, menuForBrand, menuItem } from '../data/cafe'
import { useTenant } from './TenantContext'
import { slugify } from '../lib/format'

const CafeContext = createContext(null)

/** Depolama markaya göre ayrılır — bir markanın menü düzenlemesi diğerine geçmez */
const keysFor = (brandId) => ({
  pending: `kk.cafe.pending.${brandId}.v3`,
  accounts: `kk.cafe.accounts.${brandId}.v3`,
  closed: `kk.cafe.closed.${brandId}.v3`,
  seq: `kk.cafe.seq.${brandId}.v3`,
  menu: `kk.cafe.menu.${brandId}.v3`,
})

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* kota dolabilir — demo için sessizce geç */
  }
}

/**
 * Kafe akışı tek yönlüdür:
 *   sipariş (masasız) → kasa kuyruğu → masaya bağlanır → hesap → kapanış
 * Müşteri ve garson masa bilgisi girmez; masayı yalnızca kasa bilir.
 */
export function CafeProvider({ children }) {
  const { brand, brandId } = useTenant()
  const KEY = useMemo(() => keysFor(brandId), [brandId])
  const baseMenu = useMemo(() => menuForBrand(brand.menuTweaks), [brand])

  const dataset = useMemo(() => buildCafeDataset(), [])

  /** Kasada bekleyen, henüz masaya bağlanmamış siparişler */
  const [pending, setPending] = useState(() => load(KEY.pending, dataset.pendingOrders))
  /** Açık masa hesapları */
  const [accounts, setAccounts] = useState(() => load(KEY.accounts, dataset.openAccounts))
  /** Demo sırasında kapatılan hesaplar */
  const [closedInSession, setClosedInSession] = useState(() => load(KEY.closed, []))
  const [seq, setSeq] = useState(() =>
    load(KEY.seq, { order: dataset.nextOrderNo, ticket: dataset.nextTicketNo })
  )
  /** Düzenlenebilir menü — panelden fiyat/kalem değişikliği buraya yazılır */
  const [menu, setMenu] = useState(() => load(KEY.menu, baseMenu))

  useEffect(() => save(KEY.pending, pending), [KEY, pending])
  useEffect(() => save(KEY.accounts, accounts), [KEY, accounts])
  useEffect(() => save(KEY.closed, closedInSession), [KEY, closedInSession])
  useEffect(() => save(KEY.seq, seq), [KEY, seq])
  useEffect(() => save(KEY.menu, menu), [KEY, menu])

  /* ------------------------------------------------------ menü yönetimi */

  /**
   * Canlı menüden arar; bulunamazsa sabit katalog. Geçmiş siparişler silinmiş
   * bir kalemi işaret ediyor olabilir — o kayıtlar yine de doğru render olsun.
   */
  const menuById = useCallback(
    (id) => menu.find((m) => m.id === id) ?? menuItem(id),
    [menu]
  )

  /** Müşteri ve garson yalnızca satıştaki kalemleri görür */
  const activeMenu = useMemo(() => menu.filter((m) => m.available !== false), [menu])

  const saveMenuItem = useCallback((draft) => {
    const price = Number(draft.price) || 0
    if (draft.id && menu.some((m) => m.id === draft.id)) {
      setMenu((list) => list.map((m) => (m.id === draft.id ? { ...m, ...draft, price } : m)))
      return draft.id
    }
    const id = draft.id || `m-${slugify(draft.name)}-${Date.now().toString(36).slice(-4)}`
    setMenu((list) => [
      {
        prep: 4,
        options: null,
        linkedProductId: null,
        popular: false,
        available: true,
        desc: '',
        ...draft,
        id,
        price,
      },
      ...list,
    ])
    return id
  }, [menu])

  const deleteMenuItem = useCallback((id) => {
    setMenu((list) => list.filter((m) => m.id !== id))
  }, [])

  const setMenuPrice = useCallback((id, price) => {
    setMenu((list) => list.map((m) => (m.id === id ? { ...m, price: Math.max(0, Number(price) || 0) } : m)))
  }, [])

  const toggleAvailable = useCallback((id) => {
    setMenu((list) =>
      list.map((m) => (m.id === id ? { ...m, available: m.available === false } : m))
    )
  }, [])

  const togglePopular = useCallback((id) => {
    setMenu((list) => list.map((m) => (m.id === id ? { ...m, popular: !m.popular } : m)))
  }, [])

  const resetMenu = useCallback(() => setMenu(MENU), [])

  /* -------------------------------------------------- sipariş oluşturma */

  /**
   * Masasız sipariş oluşturur ve kasa kuyruğuna atar.
   * QR menü ve garson ekranı aynı kapıdan geçer.
   */
  const submitOrder = useCallback(
    ({ lines, source = 'QR Menü', waiter = null, note = null, tableHint = null }) => {
      const items = lines
        .map((l) => {
          const mi = menuById(l.menuItemId)
          if (!mi) return null
          return {
            menuItemId: l.menuItemId,
            name: mi.name,
            price: mi.price,
            qty: l.qty,
            total: mi.price * l.qty,
            note: l.note ?? null,
          }
        })
        .filter(Boolean)

      if (!items.length) return null

      const order = {
        id: `SP-${seq.order}`,
        // Müşterinin görevliye söyleyeceği kısa numara — tam kimlik iç kayıtta kalır
        shortNo: String(seq.order % 1000).padStart(3, '0'),
        source,
        waiter,
        items,
        total: items.reduce((s, it) => s + it.total, 0),
        createdAt: new Date().toISOString(),
        status: 'bekliyor',
        tableId: null,
        // Karekod hangi masadan okutulduysa ipucu olarak taşınır.
        // Müşteriye sorulmaz; kasa tek dokunuşla bağlasın diye.
        tableHint,
        note,
        isDemoOrder: true,
      }
      setSeq((s) => ({ ...s, order: s.order + 1 }))
      setPending((p) => [order, ...p])
      return order
    },
    [seq.order, menuById]
  )

  const cancelPending = useCallback((orderId) => {
    setPending((p) => p.filter((o) => o.id !== orderId))
  }, [])

  /* --------------------------------------------- masaya bağlama (kasa) */

  /**
   * Bekleyen siparişi bir masaya bağlar. Masanın açık hesabı yoksa açar,
   * varsa siparişi mevcut hesaba ekler.
   */
  const assignToTable = useCallback(
    (orderId, tableId) => {
      const order = pending.find((o) => o.id === orderId)
      const masa = masaById(tableId)
      if (!order || !masa) return null

      const assigned = { ...order, status: 'atandi', tableId }
      const mevcut = accounts.find((a) => a.tableId === tableId)

      setPending((p) => p.filter((o) => o.id !== orderId))

      // Masanın açık hesabı varsa siparişi ona ekle
      if (mevcut) {
        setAccounts((list) =>
          list.map((a) =>
            a.tableId === tableId
              ? { ...a, orders: [...a.orders, assigned], orderIds: [...a.orderIds, assigned.id] }
              : a
          )
        )
        return mevcut.id
      }

      // Yoksa yeni hesap aç
      const id = `AD-${seq.ticket}`
      setAccounts((list) => [
        ...list,
        {
          id,
          number: seq.ticket,
          tableId: masa.id,
          tableNo: masa.no,
          zone: masa.zone,
          guests: Math.min(masa.seats, 2),
          openedAt: new Date().toISOString(),
          closedAt: null,
          orderIds: [assigned.id],
          orders: [assigned],
          status: 'acik',
          payment: null,
        },
      ])
      setSeq((s) => ({ ...s, ticket: s.ticket + 1 }))
      return id
    },
    [pending, accounts, seq.ticket]
  )

  /* ------------------------------------------------------ masa hesabı */

  const accountByTable = useCallback(
    (tableId) => accounts.find((a) => a.tableId === tableId) ?? null,
    [accounts]
  )

  const accountById = useCallback((id) => accounts.find((a) => a.id === id) ?? null, [accounts])

  /** Hesabın kalemlerini birleştirir (aynı ürün + aynı not tek satırda) */
  const mergeItems = (account) => {
    const out = []
    ;(account?.orders ?? []).forEach((o) =>
      o.items.forEach((it) => {
        const k = out.find((x) => x.menuItemId === it.menuItemId && x.note === it.note)
        if (k) {
          k.qty += it.qty
          k.total += it.total
        } else out.push({ ...it })
      })
    )
    return out
  }

  const accountTotal = (account) =>
    (account?.orders ?? []).reduce((s, o) => s + o.total, 0)

  const setGuests = useCallback((accountId, guests) => {
    setAccounts((list) =>
      list.map((a) => (a.id === accountId ? { ...a, guests: Math.max(1, guests) } : a))
    )
  }, [])

  /** Kasa masaya elle kalem ekleyebilir (unutulan bir çay gibi) */
  const addItemToAccount = useCallback(
    (accountId, menuItemId, qty = 1) => {
      const mi = menuById(menuItemId)
      if (!mi) return
      const order = {
        id: `SP-${seq.order}`,
        source: 'Kasa',
        waiter: null,
        items: [{ menuItemId, name: mi.name, price: mi.price, qty, total: mi.price * qty, note: null }],
        total: mi.price * qty,
        createdAt: new Date().toISOString(),
        status: 'atandi',
        tableId: null,
        note: null,
      }
      setSeq((s) => ({ ...s, order: s.order + 1 }))
      setAccounts((list) =>
        list.map((a) =>
          a.id === accountId
            ? { ...a, orders: [...a.orders, { ...order, tableId: a.tableId }], orderIds: [...a.orderIds, order.id] }
            : a
        )
      )
    },
    [seq.order, menuById]
  )

  /** Yanlış masaya bağlanan siparişi hesaptan çıkarıp kuyruğa geri atar */
  const detachOrder = useCallback((accountId, orderId) => {
    let geri = null
    setAccounts((list) =>
      list
        .map((a) => {
          if (a.id !== accountId) return a
          const o = a.orders.find((x) => x.id === orderId)
          if (o) geri = { ...o, status: 'bekliyor', tableId: null }
          return {
            ...a,
            orders: a.orders.filter((x) => x.id !== orderId),
            orderIds: a.orderIds.filter((x) => x !== orderId),
          }
        })
        .filter((a) => a.orders.length > 0)
    )
    if (geri) setPending((p) => [geri, ...p])
  }, [])

  const closeAccount = useCallback(
    (accountId, payment = 'Nakit') => {
      let closed = null
      setAccounts((list) => {
        const a = list.find((x) => x.id === accountId)
        if (a) {
          const items = mergeItems(a)
          closed = {
            ...a,
            items,
            total: items.reduce((s, it) => s + it.total, 0),
            status: 'odendi',
            payment,
            closedAt: new Date().toISOString(),
            durationMin: Math.max(1, Math.round((Date.now() - new Date(a.openedAt).getTime()) / 60000)),
            waiter: a.orders.find((o) => o.waiter)?.waiter ?? GARSONLAR[0],
            hasQr: a.orders.some((o) => o.source === 'QR Menü'),
            isDemoTicket: true,
          }
        }
        return list.filter((x) => x.id !== accountId)
      })
      if (closed) setClosedInSession((c) => [closed, ...c])
      return closed
    },
    []
  )

  const cancelAccount = useCallback((accountId) => {
    setAccounts((list) => list.filter((a) => a.id !== accountId))
  }, [])

  /* ----------------------------------------------------- türetilenler */

  const tables = useMemo(
    () =>
      MASALAR.map((m) => {
        const account = accounts.find((a) => a.tableId === m.id)
        return {
          ...m,
          account: account ?? null,
          total: account ? accountTotal(account) : 0,
          status: account ? 'dolu' : 'bos',
        }
      }),
    [accounts]
  )

  const todayStats = useMemo(() => {
    const b = new Date()
    const key = `${b.getFullYear()}-${String(b.getMonth() + 1).padStart(2, '0')}-${String(b.getDate()).padStart(2, '0')}`
    const seed = dataset.days.find((d) => d.date === key)
    const extraRev = closedInSession.reduce((s, t) => s + t.total, 0)
    const tickets = (seed?.tickets ?? 0) + closedInSession.length
    const revenue = (seed?.revenue ?? 0) + extraRev
    return {
      tickets,
      revenue,
      avgTicket: tickets ? revenue / tickets : 0,
      openCount: accounts.length,
      openValue: accounts.reduce((s, a) => s + accountTotal(a), 0),
      pendingCount: pending.length,
      pendingValue: pending.reduce((s, o) => s + o.total, 0),
      occupancy: (accounts.length / MASALAR.length) * 100,
    }
  }, [dataset.days, closedInSession, accounts, pending])

  const allTickets = useMemo(
    () => [...closedInSession, ...dataset.tickets],
    [closedInSession, dataset.tickets]
  )

  const resetCafe = useCallback(() => {
    Object.values(KEY).forEach((k) => localStorage.removeItem(k))
    window.location.reload()
  }, [])

  const value = useMemo(
    () => ({
      dataset,
      menu,
      activeMenu,
      menuById,
      saveMenuItem,
      deleteMenuItem,
      setMenuPrice,
      toggleAvailable,
      togglePopular,
      resetMenu,
      pending,
      accounts,
      tables,
      allTickets,
      closedInSession,
      todayStats,
      submitOrder,
      cancelPending,
      assignToTable,
      accountByTable,
      accountById,
      accountItems: mergeItems,
      accountTotal,
      addItemToAccount,
      detachOrder,
      setGuests,
      closeAccount,
      cancelAccount,
      resetCafe,
    }),
    [
      dataset, menu, activeMenu, menuById, saveMenuItem, deleteMenuItem, setMenuPrice,
      toggleAvailable, togglePopular, resetMenu,
      pending, accounts, tables, allTickets, closedInSession, todayStats,
      submitOrder, cancelPending, assignToTable, accountByTable, accountById,
      addItemToAccount, detachOrder, setGuests, closeAccount, cancelAccount, resetCafe,
    ]
  )

  return <CafeContext.Provider value={value}>{children}</CafeContext.Provider>
}

export function useCafe() {
  const ctx = useContext(CafeContext)
  if (!ctx) throw new Error('useCafe, CafeProvider içinde kullanılmalı')
  return ctx
}
