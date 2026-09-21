import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3, Bell, Blocks, ChevronsLeft, Coffee, LayoutDashboard, Lock, LogOut, Menu,
  Package, QrCode, RotateCcw, Settings as SettingsIcon, ShoppingCart, Store, Users,
  UtensilsCrossed, X,
} from 'lucide-react'

import { useStore } from '../../store/StoreContext'
import { useTenant } from '../../store/TenantContext'
import { Emblem } from '../ui/Bits'
import { initials, relative } from '../../lib/format'

const NAV = [
  { to: '/yonetim', label: 'Genel Bakış', icon: LayoutDashboard, end: true },
  { to: '/yonetim/menu', label: 'Menü', icon: UtensilsCrossed, module: 'menuManager' },
  { to: '/yonetim/karekod', label: 'Karekodlar', icon: QrCode, module: 'qrCodes' },
  { to: '/yonetim/kafe', label: 'Kafe Raporları', icon: Coffee, module: 'cafeReports' },
  { to: '/yonetim/siparisler', label: 'Siparişler', icon: ShoppingCart, module: 'storefront' },
  { to: '/yonetim/urunler', label: 'Ürünler', icon: Package, module: 'storefront' },
  { to: '/yonetim/analitik', label: 'Analitik', icon: BarChart3, module: 'webAnalytics' },
  { to: '/yonetim/musteriler', label: 'Müşteriler', icon: Users, module: 'customers' },
  { to: '/yonetim/paket', label: 'Paket ve Modüller', icon: Blocks },
  { to: '/yonetim/ayarlar', label: 'Ayarlar', icon: SettingsIcon },
]

const TITLES = {
  '/yonetim': ['Genel Bakış', 'İşletmenin bugünkü durumu'],
  '/yonetim/siparisler': ['Siparişler', 'Tüm siparişleri görüntüleyin ve durumlarını güncelleyin'],
  '/yonetim/urunler': ['Ürünler', 'Katalog yönetimi, stok ve fiyatlandırma'],
  '/yonetim/analitik': ['Analitik', 'Ziyaret, ilgi ve dönüşüm metrikleri'],
  '/yonetim/kafe': ['Kafe', 'Masa cirosu, doluluk ve menü performansı'],
  '/yonetim/menu': ['Menü', 'Kafe menüsü — fiyat, kalem ve satış durumu'],
  '/yonetim/karekod': ['Karekodlar', 'Masa kartları — tasarla, yazdır, indir'],
  '/yonetim/paket': ['Paket ve Modüller', 'Hangi modüller açık, hangi paket satıldı'],
  '/yonetim/musteriler': ['Müşteriler', 'Alışveriş geçmişi ve müşteri değeri'],
  '/yonetim/ayarlar': ['Ayarlar', 'Mağaza, kargo ve ödeme yapılandırması'],
}

function NotificationBell() {
  const { orders } = useStore()
  const [open, setOpen] = useState(false)
  const recent = orders.filter((o) => o.status === 'yeni').slice(0, 5)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-mist hover:text-steel-800"
        aria-label={`${recent.length} yeni sipariş`}
      >
        <Bell size={17} strokeWidth={1.7} />
        {recent.length > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-crimson ring-2 ring-white" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-20 w-80 rounded-xl border border-line bg-white shadow-xl">
            <div className="border-b border-line px-4 py-3">
              <p className="text-[0.86rem] font-semibold text-steel-900">Yeni siparişler</p>
              <p className="text-[0.72rem] text-muted">{recent.length} sipariş işlem bekliyor</p>
            </div>
            <ul className="max-h-72 divide-y divide-line overflow-y-auto">
              {recent.length === 0 && (
                <li className="px-4 py-8 text-center text-[0.8rem] text-muted">Bekleyen sipariş yok</li>
              )}
              {recent.map((o) => (
                <li key={o.id}>
                  <Link
                    to="/yonetim/siparisler"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 transition hover:bg-mist/60"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[0.82rem] font-medium text-steel-900">{o.customer.name}</span>
                      <span className="shrink-0 text-[0.7rem] text-faint">{relative(o.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 text-[0.74rem] text-muted">
                      {o.id} · {o.items.length} ürün · {o.customer.city}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/yonetim/siparisler"
              onClick={() => setOpen(false)}
              className="block border-t border-line px-4 py-2.5 text-center text-[0.78rem] font-medium text-steel-800 transition hover:bg-mist/60"
            >
              Tüm siparişleri gör
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminLayout() {
  const { logout, resetDemo } = useStore()
  const { has, brand } = useTenant()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileNav, setMobileNav] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => setMobileNav(false), [location.pathname])

  const [title, subtitle] = TITLES[location.pathname] ?? [
    location.pathname.includes('/urunler/') ? 'Ürün Düzenle' : 'Yönetim',
    '',
  ]

  const sidebar = (
    <div className="flex h-full flex-col bg-steel-900 text-snow">
      <div className={`flex h-16 items-center gap-3 border-b border-snow/10 ${collapsed ? 'justify-center px-3' : 'px-5'}`}>
        <Emblem className="h-8 w-8 shrink-0" ink="#F6F7F8" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-[1.05rem] font-semibold leading-none">
              {brand.shortName}
            </p>
            <p className="mt-1 text-[0.56rem] font-semibold uppercase tracking-[0.22em] text-crimson-400">
              Yönetim paneli
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((n) => {
          // Kapalı modül menüden kaybolmaz, kilitli görünür — satış konuşması açsın
          const kilitli = n.module && !has(n.module)
          return (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              title={collapsed ? `${n.label}${kilitli ? ' (paketinizde yok)' : ''}` : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.84rem] transition ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-snow/12 font-medium text-snow'
                    : kilitli
                      ? 'text-snow/30 hover:bg-snow/6 hover:text-snow/50'
                      : 'text-snow/60 hover:bg-snow/6 hover:text-snow'
                }`
              }
            >
              <n.icon size={17} strokeWidth={1.7} className="shrink-0" />
              {!collapsed && <span className="flex-1">{n.label}</span>}
              {!collapsed && kilitli && <Lock size={13} className="shrink-0 text-snow/30" />}
            </NavLink>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-snow/10 p-3">
        <Link
          to="/kasa"
          title={collapsed ? 'Kasa ekranı' : undefined}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.84rem] text-snow/60 transition hover:bg-snow/6 hover:text-snow ${collapsed ? 'justify-center' : ''}`}
        >
          <UtensilsCrossed size={17} strokeWidth={1.7} className="shrink-0" />
          {!collapsed && 'Kasa ekranı'}
        </Link>
        <Link
          to="/"
          title={collapsed ? 'Mağazayı gör' : undefined}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.84rem] text-snow/60 transition hover:bg-snow/6 hover:text-snow ${collapsed ? 'justify-center' : ''}`}
        >
          <Store size={17} strokeWidth={1.7} className="shrink-0" />
          {!collapsed && 'Mağazayı gör'}
        </Link>
        <button
          onClick={resetDemo}
          title={collapsed ? 'Demoyu sıfırla' : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[0.84rem] text-snow/60 transition hover:bg-snow/6 hover:text-snow ${collapsed ? 'justify-center' : ''}`}
        >
          <RotateCcw size={17} strokeWidth={1.7} className="shrink-0" />
          {!collapsed && 'Demoyu sıfırla'}
        </button>
        <button
          onClick={() => {
            logout()
            navigate('/')
          }}
          title={collapsed ? 'Çıkış yap' : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[0.84rem] text-snow/60 transition hover:bg-snow/6 hover:text-snow ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={17} strokeWidth={1.7} className="shrink-0" />
          {!collapsed && 'Çıkış yap'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F1F3F5]">
      {/* masaüstü kenar çubuğu */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-300 lg:block ${
          collapsed ? 'w-[4.75rem]' : 'w-64'
        }`}
      >
        {sidebar}
      </aside>

      {/* mobil kenar çubuğu */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-steel-950/50" onClick={() => setMobileNav(false)} />
          <aside className="animate-drawer absolute inset-y-0 left-0 w-64">{sidebar}</aside>
          <button
            onClick={() => setMobileNav(false)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-snow text-steel-900"
            aria-label="Menüyü kapat"
          >
            <X size={19} />
          </button>
        </div>
      )}

      <div className={`transition-[padding] duration-300 ${collapsed ? 'lg:pl-[4.75rem]' : 'lg:pl-64'}`}>
        {/* üst çubuk */}
        <header className="sticky top-0 z-20 border-b border-line bg-[#F1F3F5]/85 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-4 px-5 lg:px-8">
            <button
              onClick={() => setMobileNav(true)}
              className="grid h-9 w-9 place-items-center rounded-lg text-steel-800 transition hover:bg-mist lg:hidden"
              aria-label="Menü"
            >
              <Menu size={19} />
            </button>
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="hidden h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-mist hover:text-steel-800 lg:grid"
              aria-label="Kenar çubuğunu daralt"
            >
              <ChevronsLeft size={17} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[1.15rem] leading-tight">{title}</h1>
              {subtitle && <p className="truncate text-[0.74rem] text-muted">{subtitle}</p>}
            </div>

            <NotificationBell />

            <div className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-steel-800 text-[0.72rem] font-semibold text-snow">
                {initials(brand.ownerShort)}
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-[0.78rem] font-medium text-steel-900">{brand.ownerShort}</span>
                <span className="block text-[0.68rem] text-muted">İşletme sahibi</span>
              </span>
            </div>
          </div>
        </header>

        <main className="px-5 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
