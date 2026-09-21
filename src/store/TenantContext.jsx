import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_BRAND, brandById } from '../config/brand'
import { MODULES, PLANS, moduleForPath, planById } from '../config/modules'

const TenantContext = createContext(null)

const KEY = {
  plan: 'kk.tenant.plan.v1',
  extras: 'kk.tenant.extras.v1', // pakete ek olarak açılan modüller
  removed: 'kk.tenant.removed.v1', // paketten çıkarılan modüller
}

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
    /* sessiz geç */
  }
}

/**
 * Kiracı katmanı: hangi marka adına sunuluyor ve hangi modüller açık.
 *
 * Modül seti = paketin modülleri + tek tek eklenenler − elle kapatılanlar.
 * Böylece hem "Kafe Pro sattım" hem de "Pro'ya bir de online mağaza ekledim"
 * senaryosu aynı yerden yönetilir.
 */
/**
 * Bu depo tek markalıdır. İkinci bir işletme eklenecekse `brand.js`'e yeni
 * bir kayıt girilir ve burası o kaydı seçecek şekilde genişletilir.
 */
export function TenantProvider({ children }) {
  const brandId = DEFAULT_BRAND

  const [planId, setPlanId] = useState(() => load(KEY.plan, 'kafe-pro-max'))
  const [extras, setExtras] = useState(() => load(KEY.extras, []))
  const [removed, setRemoved] = useState(() => load(KEY.removed, []))

  useEffect(() => save(KEY.plan, planId), [planId])
  useEffect(() => save(KEY.extras, extras), [extras])
  useEffect(() => save(KEY.removed, removed), [removed])

  const brand = useMemo(() => brandById(brandId), [brandId])
  const plan = useMemo(() => planById(planId), [planId])

  /** Açık modüllerin kimlik listesi */
  const activeModules = useMemo(() => {
    const set = new Set(plan.modules)
    extras.forEach((m) => set.add(m))
    removed.forEach((m) => set.delete(m))
    return [...set]
  }, [plan, extras, removed])

  const has = useCallback((moduleId) => activeModules.includes(moduleId), [activeModules])

  /** Bir yolun açık olup olmadığı; modülsüz yollar (anasayfa, ayarlar) hep açık */
  const pathAllowed = useCallback(
    (pathname) => {
      const m = moduleForPath(pathname)
      return !m || activeModules.includes(m.id)
    },
    [activeModules]
  )

  const setPlan = useCallback((id) => {
    setPlanId(id)
    // Paket değişince elle yapılan eklemeler/çıkarmalar sıfırlanır
    setExtras([])
    setRemoved([])
  }, [])

  /** Tek modülü aç/kapat — paketin dışına çıkarak */
  const toggleModule = useCallback(
    (moduleId) => {
      const inPlan = plan.modules.includes(moduleId)
      const isOn = activeModules.includes(moduleId)
      if (isOn) {
        if (inPlan) setRemoved((r) => [...new Set([...r, moduleId])])
        else setExtras((e) => e.filter((x) => x !== moduleId))
      } else {
        if (inPlan) setRemoved((r) => r.filter((x) => x !== moduleId))
        else setExtras((e) => [...new Set([...e, moduleId])])
      }
    },
    [plan, activeModules]
  )

  const resetModules = useCallback(() => {
    setExtras([])
    setRemoved([])
  }, [])

  const value = useMemo(
    () => ({
      brand,
      brandId,
      plan,
      planId,
      setPlan,
      plans: PLANS,
      modules: MODULES,
      activeModules,
      extras,
      removed,
      has,
      pathAllowed,
      toggleModule,
      resetModules,
    }),
    [
      brand, brandId, plan, planId, setPlan, activeModules, extras, removed,
      has, pathAllowed, toggleModule, resetModules,
    ]
  )

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant, TenantProvider içinde kullanılmalı')
  return ctx
}
