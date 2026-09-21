import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import SiteLayout from './components/site/SiteLayout'
import Home from './pages/Home'
import { useStore } from './store/StoreContext'
import { useTenant } from './store/TenantContext'
import { moduleForPath } from './config/modules'
import LockedModule from './components/ui/LockedModule'

/**
 * Mağaza tarafı hızlı açılsın diye yönetim paneli ayrı parçaya bölündü.
 * Grafik kütüphanesi (recharts) yalnızca panele girildiğinde indirilir.
 */
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderConfirmed = lazy(() => import('./pages/OrderConfirmed'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))

const QrMenu = lazy(() => import('./pages/cafe/QrMenu'))
const CafeShell = lazy(() => import('./components/cafe/CafeShell'))
const Kasa = lazy(() => import('./pages/cafe/Kasa'))
const Garson = lazy(() => import('./pages/cafe/Garson'))

const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const CafeAnalytics = lazy(() => import('./pages/admin/CafeAnalytics'))
const QrCodes = lazy(() => import('./pages/admin/QrCodes'))
const Modules = lazy(() => import('./pages/admin/Modules'))
const MenuAdmin = lazy(() => import('./pages/admin/MenuAdmin'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Orders = lazy(() => import('./pages/admin/Orders'))
const ProductsAdmin = lazy(() => import('./pages/admin/ProductsAdmin'))
const ProductEditor = lazy(() => import('./pages/admin/ProductEditor'))
const Analytics = lazy(() => import('./pages/admin/Analytics'))
const Customers = lazy(() => import('./pages/admin/Customers'))
const Settings = lazy(() => import('./pages/admin/Settings'))

/* ------------------------------------------------------- sayfa başlığı */

const TITLES = [
  [/^\/magaza/, 'Mağaza'],
  [/^\/urun\//, 'Ürün'],
  [/^\/odeme/, 'Ödeme'],
  [/^\/siparis\//, 'Siparişiniz alındı'],
  [/^\/hikayemiz/, 'Hikâyemiz'],
  [/^\/iletisim/, 'İletişim'],
  [/^\/menu/, 'Menü'],
  [/^\/kasa/, 'Kasa · Servis Ekranı'],
  [/^\/garson/, 'Garson · Servis Ekranı'],
  [/^\/yonetim\/giris/, 'Giriş · Yönetim Paneli'],
  [/^\/yonetim\/kafe/, 'Kafe · Yönetim Paneli'],
  [/^\/yonetim\/menu/, 'Menü · Yönetim Paneli'],
  [/^\/yonetim\/karekod/, 'Karekodlar · Yönetim Paneli'],
  [/^\/yonetim\/paket/, 'Paket ve Modüller · Yönetim Paneli'],
  [/^\/yonetim\/siparisler/, 'Siparişler · Yönetim Paneli'],
  [/^\/yonetim\/urunler/, 'Ürünler · Yönetim Paneli'],
  [/^\/yonetim\/analitik/, 'Analitik · Yönetim Paneli'],
  [/^\/yonetim\/musteriler/, 'Müşteriler · Yönetim Paneli'],
  [/^\/yonetim\/ayarlar/, 'Ayarlar · Yönetim Paneli'],
  [/^\/yonetim/, 'Genel Bakış · Yönetim Paneli'],
]

function RouteEffects() {
  const { pathname } = useLocation()
  const { brand } = useTenant()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
    if (pathname === '/') {
      document.title = `${brand.name} — ${brand.tagline}`
      return
    }
    const match = TITLES.find(([re]) => re.test(pathname))
    document.title = match
      ? `${match[1]} · ${brand.shortName}`
      : `Sayfa bulunamadı · ${brand.shortName}`
  }, [pathname, brand])

  return null
}

/* ------------------------------------------------------------- yükleme */

function PageFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-4">
        <span className="relative grid h-12 w-12 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-crimson/25" />
          <span className="relative h-3 w-3 rounded-full bg-crimson" />
        </span>
        <p className="text-[0.8rem] tracking-wide text-muted">Demleniyor…</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- koruma */

/**
 * Modül koruması: kapalı bir modülün yolu açılırsa yükseltme ekranı gösterilir.
 * Yönlendirme yapılmaz — müşteri neyi almadığını görsün.
 */
function RequireModule({ children }) {
  const { pathname } = useLocation()
  const { pathAllowed } = useTenant()
  if (pathAllowed(pathname)) return children
  const m = moduleForPath(pathname)
  return <LockedModule module={m} inAdmin={pathname.startsWith('/yonetim')} />
}

function RequireAdmin({ children }) {
  const { isAdmin } = useStore()
  const location = useLocation()
  if (!isAdmin) return <Navigate to="/yonetim/giris" state={{ from: location.pathname }} replace />
  return children
}

/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <>
      <RouteEffects />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* ---------------------------------------------- vitrin */}
          <Route element={<SiteLayout />}>
            <Route index element={<Home />} />
            <Route path="magaza" element={<RequireModule><Shop /></RequireModule>} />
            <Route path="urun/:slug" element={<RequireModule><ProductDetail /></RequireModule>} />
            <Route path="odeme" element={<RequireModule><Checkout /></RequireModule>} />
            <Route path="siparis/:id" element={<RequireModule><OrderConfirmed /></RequireModule>} />
            <Route path="hikayemiz" element={<About />} />
            <Route path="iletisim" element={<Contact />} />
          </Route>

          {/* ------------------------------------------------- kafe */}
          {/* QR menü herkese açık — müşteri masadaki karekodu okutup girer */}
          <Route path="menu" element={<RequireModule><QrMenu /></RequireModule>} />

          {/* Servis ekranları personele ait, aynı demo oturumuyla korunur */}
          <Route
            element={
              <RequireAdmin>
                <CafeShell />
              </RequireAdmin>
            }
          >
            <Route path="kasa" element={<RequireModule><Kasa /></RequireModule>} />
            <Route path="garson" element={<RequireModule><Garson /></RequireModule>} />
          </Route>

          {/* ---------------------------------------------- yönetim */}
          <Route path="yonetim/giris" element={<AdminLogin />} />
          <Route
            path="yonetim"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="siparisler" element={<RequireModule><Orders /></RequireModule>} />
            <Route path="urunler" element={<RequireModule><ProductsAdmin /></RequireModule>} />
            <Route path="urunler/yeni" element={<RequireModule><ProductEditor /></RequireModule>} />
            <Route path="urunler/:id" element={<RequireModule><ProductEditor /></RequireModule>} />
            <Route path="analitik" element={<RequireModule><Analytics /></RequireModule>} />
            <Route path="kafe" element={<RequireModule><CafeAnalytics /></RequireModule>} />
            <Route path="menu" element={<RequireModule><MenuAdmin /></RequireModule>} />
            <Route path="karekod" element={<RequireModule><QrCodes /></RequireModule>} />
            <Route path="paket" element={<Modules />} />
            <Route path="musteriler" element={<RequireModule><Customers /></RequireModule>} />
            <Route path="ayarlar" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}
