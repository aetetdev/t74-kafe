import { Link, NavLink, Outlet } from 'react-router-dom'
import { Monitor, QrCode, Store, UserRound } from 'lucide-react'

import { useCafe } from '../../store/CafeContext'
import { useTenant } from '../../store/TenantContext'
import { money } from '../../lib/format'
import { Emblem } from '../ui/Bits'

const NAV = [
  { to: '/kasa', label: 'Kasa', icon: Monitor },
  { to: '/garson', label: 'Garson', icon: UserRound },
]

/**
 * Personel ekranlarının (kasa + garson) ortak kabuğu.
 * Kasa tablette, garson telefonda kullanılacağı için dokunma hedefleri büyük.
 */
export default function CafeShell() {
  const { todayStats } = useCafe()
  const { brand } = useTenant()

  return (
    <div className="flex min-h-screen flex-col bg-[#F1F3F5]">
      <header className="sticky top-0 z-30 bg-steel-900 text-snow">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <Emblem className="h-9 w-9 shrink-0" ink="#F6F7F8" />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate font-display text-[1.05rem] font-semibold leading-none">
              {brand.shortName}
            </p>
            <p className="mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-crimson-400">
              Servis ekranı
            </p>
          </div>

          <nav className="flex gap-1 sm:ml-3">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `relative flex h-10 items-center gap-2 rounded-lg px-3 text-[0.83rem] transition ${
                    isActive ? 'bg-snow/15 font-medium text-snow' : 'text-snow/60 hover:bg-snow/8'
                  }`
                }
              >
                <n.icon size={17} strokeWidth={1.8} />
                {n.label}
                {n.to === '/kasa' && todayStats.pendingCount > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-crimson px-1 text-[0.62rem] font-bold text-steel-900">
                    {todayStats.pendingCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-[0.58rem] uppercase tracking-[0.16em] text-snow/50">Bugün</p>
              <p className="text-[0.95rem] font-semibold leading-tight tnum text-crimson-400">
                {money(todayStats.revenue)}
              </p>
            </div>

            <Link
              to="/menu"
              title="QR menüyü aç"
              className="grid h-10 w-10 place-items-center rounded-lg text-snow/60 transition hover:bg-snow/10 hover:text-snow"
            >
              <QrCode size={18} strokeWidth={1.8} />
            </Link>
            <Link
              to="/yonetim"
              title="Yönetim paneli"
              className="grid h-10 w-10 place-items-center rounded-lg text-snow/60 transition hover:bg-snow/10 hover:text-snow"
            >
              <Store size={18} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
