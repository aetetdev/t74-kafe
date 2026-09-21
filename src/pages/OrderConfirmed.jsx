import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Check, Instagram, Mail, Package, Truck } from 'lucide-react'

import { useStore } from '../store/StoreContext'
import { useTenant } from '../store/TenantContext'
import { dateLong, money } from '../lib/format'
import ProductImage from '../components/ui/ProductImage'
import { Button, Empty, Ornament } from '../components/ui/Bits'

export default function OrderConfirmed() {
  const { id } = useParams()
  const { orders } = useStore()
  const { brand } = useTenant()
  const order = orders.find((o) => o.id === id)

  if (!order) {
    return (
      <div className="shell py-24">
        <Empty
          icon={Package}
          title="Sipariş bulunamadı"
          blurb="Bu sipariş numarasına ait bir kayıt yok."
          action={
            <Button as={Link} to="/magaza">
              Mağazaya git
            </Button>
          }
        />
      </div>
    )
  }

  const eta = new Date(new Date(order.createdAt).getTime() + 3 * 86400000)

  return (
    <section className="shell max-w-3xl py-16 lg:py-24">
      <div className="text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-steel-50 text-steel-700 ring-1 ring-steel-100">
          <Check size={34} strokeWidth={1.6} />
        </span>
        <p className="eyebrow mt-7">Teşekkür ederiz</p>
        <h1 className="mt-4 text-[2.3rem] leading-tight sm:text-[2.9rem]">Siparişiniz alındı</h1>
        <Ornament className="mt-6" width="w-20" />
        <p className="mx-auto mt-5 max-w-md text-[0.93rem] leading-relaxed text-muted">
          Sipariş numaranız{' '}
          <strong className="font-semibold tnum text-steel-900">{order.id}</strong>. Onay
          e-postasını{' '}
          <strong className="font-medium text-steel-900">{order.customer.email}</strong> adresine
          gönderdik.
        </p>
      </div>

      {/* zaman çizgisi */}
      <div className="mt-12 rounded-2xl border border-line bg-white p-6">
        <ol className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            [Check, 'Sipariş alındı', dateLong(order.createdAt), true],
            [Package, 'Kavrum ve paketleme', 'Salı ve Cuma kavrum günü', false],
            [Truck, 'Kargoya teslim', `Tahmini ${dateLong(eta)}`, false],
          ].map(([Icon, title, sub, done], i) => (
            <li key={i} className="flex gap-3">
              <span
                className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                  done ? 'bg-steel-700 text-snow' : 'bg-silver text-muted'
                }`}
              >
                <Icon size={16} strokeWidth={1.7} />
              </span>
              <div>
                <p className="text-[0.85rem] font-medium text-steel-900">{title}</p>
                <p className="mt-0.5 text-[0.76rem] leading-snug text-muted">{sub}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* özet */}
      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Sipariş özeti</p>
            <p className="mt-2 text-[0.84rem] text-muted">{dateLong(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-[0.72rem] text-muted">Ödeme</p>
            <p className="text-[0.86rem] font-medium text-steel-900">{order.payment}</p>
          </div>
        </div>

        <ul className="mt-5 divide-y divide-line">
          {order.items.map((it) => (
            <li key={it.productId} className="flex items-center gap-3.5 py-3.5">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-mist">
                <ProductImage art={it.art} tone={it.tone} className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.87rem] font-medium text-steel-900">{it.name}</p>
                <p className="text-[0.76rem] text-muted">
                  {it.variant} · {it.qty} adet
                </p>
              </div>
              <span className="text-[0.87rem] font-semibold tnum text-steel-900">{money(it.total)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[0.85rem]">
          <div className="flex justify-between text-muted">
            <dt>Ara toplam</dt>
            <dd className="tnum">{money(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Kargo</dt>
            <dd className="tnum">
              {order.shipping === 0 ? <span className="text-steel-700">Bedava</span> : money(order.shipping)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-[1.1rem] font-semibold text-steel-900">
            <dt>Toplam</dt>
            <dd className="tnum">{money(order.total)}</dd>
          </div>
        </dl>

        <div className="mt-5 rounded-xl bg-mist/70 p-4 text-[0.82rem] leading-relaxed text-ink-soft">
          <p className="font-medium text-steel-900">Teslimat adresi</p>
          <p className="mt-1 text-muted">
            {order.customer.name} · {order.customer.phone}
            <br />
            {order.address}
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button as={Link} to="/magaza" variant="outline">
          Alışverişe devam et <ArrowRight size={15} />
        </Button>
        <Button
          as="a"
          href={brand.instagramUrl}
          target="_blank"
          rel="noreferrer"
          variant="ghost"
        >
          <Instagram size={15} /> Bizi takip edin
        </Button>
      </div>

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-[0.72rem] text-faint">
        <Mail size={13} />
        Demo siparişi — bu kayıt yönetim panelinde “Yeni” olarak görünür.
      </p>
    </section>
  )
}
