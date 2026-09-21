import { Link } from 'react-router-dom'
import { ArrowRight, Check, Lock } from 'lucide-react'

import { useTenant } from '../../store/TenantContext'
import { MODULE_ADDON_PRICE, MODULE_LIST } from '../../config/modules'
import { money } from '../../lib/format'
import { Button } from './Bits'

/**
 * Kapalı bir modüle girilmeye çalışıldığında görünen yükseltme ekranı.
 * Menüden kaybolmak yerine kilitli görünmesi bilinçli: müşteri neyi
 * almadığını görsün, satış konuşması kendiliğinden açılsın.
 */
export default function LockedModule({ module, inAdmin = true }) {
  const { plans, planId, activeModules } = useTenant()

  // Bu modülü içeren en ucuz paket
  const upgrade = plans.find((p) => p.modules.includes(module.id) && p.id !== planId)
  const addon = MODULE_ADDON_PRICE[module.id]

  return (
    <div className={inAdmin ? '' : 'grid min-h-screen place-items-center bg-[#F1F3F5] px-5'}>
      <div className="mx-auto max-w-lg py-10 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-mist text-muted">
          <Lock size={26} strokeWidth={1.6} />
        </span>

        <p className="eyebrow mt-6">Paketinizde yok</p>
        <h1 className="mt-3 text-[1.9rem] leading-tight">{module.name}</h1>
        <p className="mx-auto mt-3 max-w-md text-[0.9rem] leading-relaxed text-muted">
          {module.desc}
        </p>

        {upgrade && (
          <div className="mt-8 rounded-2xl border border-line bg-white p-6 text-left">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-crimson-700">
                  Bu modül şu paketle gelir
                </p>
                <p className="mt-1 font-display text-[1.5rem] font-semibold leading-none text-steel-900">
                  {upgrade.name}
                </p>
              </div>
              <p className="font-display text-[1.5rem] font-semibold tnum text-steel-900">
                {money(upgrade.monthly)}
                <span className="ml-1 font-sans text-[0.78rem] font-normal text-muted">/ay</span>
              </p>
            </div>

            <ul className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {upgrade.modules.map((mid) => {
                const m = MODULE_LIST.find((x) => x.id === mid)
                const yeni = !activeModules.includes(mid)
                return (
                  <li key={mid} className="flex items-center gap-2 text-[0.78rem]">
                    <Check size={13} className={yeni ? 'text-steel-600' : 'text-faint'} />
                    <span className={yeni ? 'font-medium text-steel-900' : 'text-muted'}>
                      {m?.name ?? mid}
                    </span>
                  </li>
                )
              })}
            </ul>

            {addon && (
              <p className="mt-4 rounded-lg bg-mist/70 px-3.5 py-2.5 text-[0.78rem] leading-relaxed text-muted">
                Paketi yükseltmek istemiyorsanız bu modül tek başına{' '}
                <strong className="font-semibold text-steel-900">{money(addon)}/ay</strong>{' '}
                karşılığında eklenebilir.
              </p>
            )}
          </div>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/yonetim/paket">
            Paketleri gör <ArrowRight size={15} />
          </Button>
          <Button as={Link} to="/yonetim" variant="outline">
            Panele dön
          </Button>
        </div>
      </div>
    </div>
  )
}
