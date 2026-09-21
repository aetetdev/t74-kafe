import { useMemo, useState } from 'react'
import {
  Building2, Check, Lock, Package, RotateCcw, Sparkles, Unlock, Zap,
} from 'lucide-react'

import { useTenant } from '../../store/TenantContext'
import { useStore } from '../../store/StoreContext'
import { MODULE_ADDON_PRICE, MODULE_LIST } from '../../config/modules'
import { money, num } from '../../lib/format'
import { Panel } from '../../components/admin/AdminUI'
import { Button } from '../../components/ui/Bits'

export default function Modules() {
  const {
    brand, plan, planId, setPlan, plans,
    activeModules, extras, removed, toggleModule, resetModules,
  } = useTenant()
  const { toast } = useStore()

  const aylikToplam = useMemo(() => {
    const ek = extras.reduce((s, m) => s + (MODULE_ADDON_PRICE[m] ?? 0), 0)
    return plan.monthly + ek
  }, [plan, extras])

  const kapali = MODULE_LIST.filter((m) => !activeModules.includes(m.id))

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------- marka */}
      <Panel title="Sunum markası" subtitle="Bu dağıtımın kimliği">
        <div className="flex items-start gap-3.5 rounded-xl border-2 border-steel-800 bg-steel-50 p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-steel-800 font-display text-[0.85rem] font-bold text-crimson-400">
            {brand.emblemText}
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-[0.92rem] font-semibold text-steel-900">{brand.name}</span>
            <span className="mt-1 block text-[0.78rem] leading-snug text-muted">
              {brand.city} · {brand.tagline}
            </span>
          </span>
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-lg bg-mist/60 px-3.5 py-3 text-[0.76rem] leading-relaxed text-muted">
          <Building2 size={14} className="mt-0.5 shrink-0" />
          <span>
            Ürün kataloğu, kafe menüsü ve tüm site metinleri{' '}
            <code className="tnum">src/config/brand.js</code> dosyasından gelir. Yeni bir müşteriye
            aynı sistemi sunmak için oraya ikinci bir kayıt ve kendi katalog dosyası eklenir.
          </span>
        </p>
      </Panel>

      {/* ------------------------------------------------------ paketler */}
      <div>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[1.15rem]">Paketler</h2>
          <p className="text-[0.78rem] text-muted">
            Şu anki aylık: <strong className="font-semibold tnum text-steel-900">{money(aylikToplam)}</strong>
            {extras.length > 0 && <span className="text-faint"> ({extras.length} ek modül dahil)</span>}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => {
            const aktif = p.id === planId
            return (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-2xl border-2 p-5 transition ${
                  aktif ? 'border-steel-800 bg-steel-50/50' : 'border-line bg-white'
                }`}
              >
                {p.popular && !aktif && (
                  <span className="absolute -top-2.5 left-5 rounded-full bg-crimson px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-steel-900">
                    En çok tercih edilen
                  </span>
                )}
                {aktif && (
                  <span className="absolute -top-2.5 left-5 rounded-full bg-steel-800 px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-snow">
                    Aktif paket
                  </span>
                )}

                <h3 className="text-[1.3rem] leading-none">{p.name}</h3>
                <p className="mt-1.5 text-[0.76rem] text-muted">{p.tagline}</p>

                <p className="mt-4 font-display text-[1.9rem] font-semibold leading-none tnum text-steel-900">
                  {money(p.monthly)}
                  <span className="ml-1 font-sans text-[0.8rem] font-normal text-muted">/ay</span>
                </p>
                <p className="mt-1 text-[0.74rem] text-faint tnum">
                  + {money(p.setup)} kurulum
                </p>

                <ul className="mt-4 flex-1 space-y-1.5">
                  {p.modules.map((mid) => {
                    const m = MODULE_LIST.find((x) => x.id === mid)
                    return (
                      <li key={mid} className="flex items-start gap-2 text-[0.78rem] text-ink-soft">
                        <Check size={13} className="mt-0.5 shrink-0 text-steel-600" />
                        {m?.name}
                      </li>
                    )
                  })}
                </ul>

                <p className="mt-4 border-t border-line pt-3 text-[0.72rem] leading-snug text-muted">
                  {p.best}
                </p>

                <Button
                  variant={aktif ? 'outline' : 'primary'}
                  size="sm"
                  className="mt-4 w-full"
                  disabled={aktif}
                  onClick={() => {
                    setPlan(p.id)
                    toast(`${p.name} paketine geçildi`, 'good')
                  }}
                >
                  {aktif ? 'Şu an bu pakettesiniz' : 'Bu pakete geç'}
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ------------------------------------------------------ modüller */}
      <Panel
        title="Modüller"
        subtitle="Paketin dışında tek tek açıp kapatabilirsiniz — sonradan ek modül satmak için"
        action={
          (extras.length > 0 || removed.length > 0) && (
            <button
              onClick={() => {
                resetModules()
                toast('Modüller paket varsayılanına döndü')
              }}
              className="inline-flex items-center gap-1.5 text-[0.76rem] font-medium text-steel-800 transition hover:text-crimson-700"
            >
              <RotateCcw size={13} /> Pakete dön
            </button>
          )
        }
      >
        <ul className="divide-y divide-line">
          {MODULE_LIST.map((m) => {
            const acik = activeModules.includes(m.id)
            const pakette = plan.modules.includes(m.id)
            const ekstra = extras.includes(m.id)
            const cikarilmis = removed.includes(m.id)

            return (
              <li key={m.id} className="flex items-start gap-3.5 py-3.5">
                <span
                  className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                    acik ? 'bg-steel-50 text-steel-700' : 'bg-mist text-faint'
                  }`}
                >
                  {acik ? <Unlock size={16} /> : <Lock size={16} />}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[0.88rem] font-medium text-steel-900">{m.name}</p>
                    {pakette && !cikarilmis && (
                      <span className="rounded-full bg-steel-50 px-2 py-0.5 text-[0.62rem] font-semibold text-steel-700">
                        Pakette
                      </span>
                    )}
                    {ekstra && (
                      <span className="rounded-full bg-crimson-50 px-2 py-0.5 text-[0.62rem] font-semibold text-crimson-700">
                        Ek modül · {money(MODULE_ADDON_PRICE[m.id])}/ay
                      </span>
                    )}
                    {cikarilmis && (
                      <span className="rounded-full bg-[#FBEAEA] px-2 py-0.5 text-[0.62rem] font-semibold text-[#9A2C2C]">
                        Kapatıldı
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[0.78rem] leading-snug text-muted">{m.desc}</p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={acik}
                  aria-label={`${m.name} modülünü ${acik ? 'kapat' : 'aç'}`}
                  onClick={() => toggleModule(m.id)}
                  className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition ${
                    acik ? 'bg-steel-700' : 'bg-silver'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      acik ? 'left-[1.4rem]' : 'left-0.5'
                    }`}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </Panel>

      {/* ---------------------------------------------------- satış özeti */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Aktif kurulum">
          <dl className="space-y-2.5 text-[0.84rem]">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Marka</dt>
              <dd className="font-medium text-steel-900">{brand.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Paket</dt>
              <dd className="font-medium text-steel-900">{plan.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Açık modül</dt>
              <dd className="font-medium tnum text-steel-900">
                {num(activeModules.length)} / {num(MODULE_LIST.length)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-line pt-2.5 text-[1rem]">
              <dt className="font-medium text-ink-soft">Aylık</dt>
              <dd className="font-semibold tnum text-steel-900">{money(aylikToplam)}</dd>
            </div>
          </dl>
        </Panel>

        <Panel title="Kapalı modüller" subtitle={`${kapali.length} modül satılabilir durumda`}>
          {kapali.length === 0 ? (
            <p className="py-6 text-center text-[0.84rem] text-muted">
              Tüm modüller açık — müşteri en üst pakette.
            </p>
          ) : (
            <ul className="space-y-2">
              {kapali.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 text-[0.8rem]">
                  <span className="flex items-center gap-2 text-ink-soft">
                    <Lock size={12} className="text-faint" />
                    {m.name}
                  </span>
                  <span className="shrink-0 tnum text-muted">
                    +{money(MODULE_ADDON_PRICE[m.id])}/ay
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Sunum ipucu">
          <div className="space-y-3 text-[0.82rem] leading-relaxed text-ink-soft">
            <p className="flex gap-2.5">
              <Sparkles size={15} className="mt-0.5 shrink-0 text-crimson" />
              Müşterinin karşısında paketi <strong className="font-medium">canlı değiştirin</strong>.
              Menüden ekranların kilitlenip açıldığını görmek, fiyat listesi göstermekten çok daha
              ikna edici.
            </p>
            <p className="flex gap-2.5">
              <Zap size={15} className="mt-0.5 shrink-0 text-crimson" />
              Kilitli bir menüye tıklayın — müşteri neyi almadığını görsün. Yükseltme ekranı o
              modülün ne yaptığını anlatır.
            </p>
          </div>
        </Panel>
      </div>

    </div>
  )
}
