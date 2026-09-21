import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { catalogFor } from '../data/catalog'
import { useTenant } from './TenantContext'
import { buildDataset, KARGO_UCRETI, UCRETSIZ_KARGO_ESIGI } from '../data/generate'
import { slugify } from '../lib/format'

const StoreContext = createContext(null)

/* ------------------------------------------------- kalıcılık yardımcıları */

/**
 * Depolama anahtarları markaya göre ayrılır: bir markanın ürünleri, sepeti ve
 * siparişleri diğerine sızmaz. Oturum (auth) markadan bağımsızdır.
 */
const keysFor = (brandId) => ({
  cart: `kk.cart.${brandId}.v2`,
  products: `kk.products.${brandId}.v2`,
  orders: `kk.orders.${brandId}.v2`,
  status: `kk.status.${brandId}.v2`,
  auth: 'kk.auth.v1',
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
    /* kota dolu olabilir — demo için sessizce geç */
  }
}

/* ----------------------------------------------------------- sağlayıcı */

export function StoreProvider({ children }) {
  const { brand, brandId } = useTenant()
  /** Aktif markanın kataloğu — marka değişince ürünler de değişir */
  const catalog = useMemo(() => catalogFor(), [])
  const KEY = useMemo(() => keysFor(brandId), [brandId])
  // Demo geçmişi de aktif katalogdan üretilir — T74 sitesinde Kuruluş ürünü çıkmaz
  const dataset = useMemo(
    () => buildDataset(catalog.products, brandId, {
      orderPrefix: brand.orderPrefix,
      cityWeights: brand.cityWeights,
    }),
    [catalog, brandId, brand],
  )

  const [products, setProducts] = useState(() => load(KEY.products, catalog.products))
  const [cart, setCart] = useState(() => load(KEY.cart, []))
  const [placedOrders, setPlacedOrders] = useState(() => load(KEY.orders, []))
  const [statusOverrides, setStatusOverrides] = useState(() => load(KEY.status, {}))
  const [isAdmin, setIsAdmin] = useState(() => load(KEY.auth, false))

  const [cartOpen, setCartOpen] = useState(false)
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)

  useEffect(() => save(KEY.products, products), [products])
  useEffect(() => save(KEY.cart, cart), [cart])
  useEffect(() => save(KEY.orders, placedOrders), [placedOrders])
  useEffect(() => save(KEY.status, statusOverrides), [statusOverrides])
  useEffect(() => save(KEY.auth, isAdmin), [isAdmin])

  /* ------------------------------------------------------------ bildirim */

  const toast = useCallback((message, tone = 'default') => {
    const id = (toastId.current += 1)
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  /* ---------------------------------------------------------------- sepet */

  const addToCart = useCallback(
    (product, qty = 1, { silent = false, open = true } = {}) => {
      setCart((c) => {
        const found = c.find((l) => l.productId === product.id)
        if (found) {
          return c.map((l) => (l.productId === product.id ? { ...l, qty: Math.min(99, l.qty + qty) } : l))
        }
        return [...c, { productId: product.id, qty }]
      })
      if (!silent) toast(`${product.name} sepete eklendi`, 'good')
      if (open) setCartOpen(true)
    },
    [toast]
  )

  const setQty = useCallback((productId, qty) => {
    setCart((c) =>
      qty <= 0
        ? c.filter((l) => l.productId !== productId)
        : c.map((l) => (l.productId === productId ? { ...l, qty: Math.min(99, qty) } : l))
    )
  }, [])

  const removeFromCart = useCallback((productId) => {
    setCart((c) => c.filter((l) => l.productId !== productId))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartLines = useMemo(
    () =>
      cart
        .map((line) => {
          const product = products.find((p) => p.id === line.productId)
          return product ? { ...line, product, total: product.price * line.qty } : null
        })
        .filter(Boolean),
    [cart, products]
  )

  const cartTotals = useMemo(() => {
    const subtotal = cartLines.reduce((s, l) => s + l.total, 0)
    const shipping = subtotal === 0 || subtotal >= UCRETSIZ_KARGO_ESIGI ? 0 : KARGO_UCRETI
    return {
      count: cartLines.reduce((s, l) => s + l.qty, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      freeShippingGap: Math.max(0, UCRETSIZ_KARGO_ESIGI - subtotal),
    }
  }, [cartLines])

  /* ------------------------------------------------------------ siparişler */

  const orders = useMemo(() => {
    const merged = [...placedOrders, ...dataset.orders]
    if (!Object.keys(statusOverrides).length) return merged
    return merged.map((o) => (statusOverrides[o.id] ? { ...o, status: statusOverrides[o.id] } : o))
  }, [placedOrders, dataset.orders, statusOverrides])

  const placeOrder = useCallback(
    (form) => {
      const items = cartLines.map((l) => ({
        productId: l.product.id,
        name: l.product.name,
        variant: l.product.variant,
        sku: l.product.sku,
        art: l.product.art,
        tone: l.product.tone,
        price: l.product.price,
        qty: l.qty,
        total: l.total,
      }))
      const subtotal = cartTotals.subtotal
      const shipping = cartTotals.shipping
      const order = {
        id: `${brand.orderPrefix}-${dataset.orders[0] ? dataset.orders[0].number + placedOrders.length + 1 : 9000}`,
        number: (dataset.orders[0]?.number ?? 9000) + placedOrders.length + 1,
        createdAt: new Date().toISOString(),
        customer: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          city: form.city,
        },
        address: `${form.address}, ${form.district}/${form.city}`,
        items,
        subtotal,
        shipping,
        discount: 0,
        total: subtotal + shipping,
        status: 'yeni',
        payment: form.payment,
        channel: 'Doğrudan',
        carrier: 'Yurtiçi Kargo',
        tracking: `${Math.floor(Math.random() * 900000000 + 100000000)}`,
        note: form.note || null,
        isDemoOrder: true,
      }
      setPlacedOrders((o) => [order, ...o])
      setCart([])
      return order
    },
    [cartLines, cartTotals, dataset.orders, placedOrders.length]
  )

  const updateOrderStatus = useCallback(
    (orderId, status) => {
      setStatusOverrides((s) => ({ ...s, [orderId]: status }))
      toast('Sipariş durumu güncellendi', 'good')
    },
    [toast]
  )

  /* -------------------------------------------------------------- ürünler */

  const saveProduct = useCallback(
    (draft) => {
      const exists = products.some((p) => p.id === draft.id)
      if (exists) {
        setProducts((ps) => ps.map((p) => (p.id === draft.id ? { ...p, ...draft } : p)))
        toast('Ürün güncellendi', 'good')
        return draft.id
      }
      const id = draft.id || `p-${slugify(draft.name)}-${Date.now().toString(36)}`
      const created = {
        art: 'bag',
        tone: 'steel',
        notes: [],
        attrs: {},
        featured: false,
        badge: null,
        compareAt: null,
        collection: 'anadolu-bilgeleri',
        createdAt: new Date().toISOString().slice(0, 10),
        ...draft,
        id,
        slug: draft.slug || slugify(`${draft.name} ${draft.variant ?? ''}`),
      }
      setProducts((ps) => [created, ...ps])
      toast('Ürün eklendi', 'good')
      return id
    },
    [products, toast]
  )

  const deleteProduct = useCallback(
    (id) => {
      setProducts((ps) => ps.filter((p) => p.id !== id))
      setCart((c) => c.filter((l) => l.productId !== id))
      toast('Ürün silindi')
    },
    [toast]
  )

  const toggleFeatured = useCallback((id) => {
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)))
  }, [])

  const adjustStock = useCallback((id, stock) => {
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, stock: Math.max(0, stock) } : p)))
  }, [])

  /* --------------------------------------------------------------- oturum */

  const login = useCallback(
    (email, password) => {
      // Demo kimlik doğrulaması — gerçek sürümde sunucu tarafında olacak
      if (email.trim().length > 3 && password.length >= 4) {
        setIsAdmin(true)
        return { ok: true }
      }
      return { ok: false, error: 'E-posta veya parola hatalı.' }
    },
    []
  )

  const logout = useCallback(() => setIsAdmin(false), [])

  /* ----------------------------------------------------------- sıfırlama */

  const resetDemo = useCallback(() => {
    Object.values(KEY).forEach((k) => localStorage.removeItem(k))
    window.location.reload()
  }, [])

  const value = useMemo(
    () => ({
      dataset: dataset,
      products,
      categories: catalog.categories,
      collections: catalog.collections,
      orders,
      placedOrders,
      cart,
      cartLines,
      cartTotals,
      cartOpen,
      setCartOpen,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      placeOrder,
      updateOrderStatus,
      saveProduct,
      deleteProduct,
      toggleFeatured,
      adjustStock,
      isAdmin,
      login,
      logout,
      toast,
      toasts,
      resetDemo,
    }),
    [
      dataset, catalog, products, orders, placedOrders, cart, cartLines, cartTotals, cartOpen,
      addToCart, setQty, removeFromCart, clearCart, placeOrder, updateOrderStatus,
      saveProduct, deleteProduct, toggleFeatured, adjustStock, isAdmin, login, logout,
      toast, toasts, resetDemo,
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore, StoreProvider içinde kullanılmalı')
  return ctx
}
