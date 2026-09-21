import { useState } from 'react'
import {
  Banknote, Building2, CreditCard, Info, Instagram, Mail, Phone, RotateCcw, Save, Truck,
} from 'lucide-react'

import { useStore } from '../../store/StoreContext'
import { useTenant } from '../../store/TenantContext'
import { money } from '../../lib/format'
import { KARGO_UCRETI, UCRETSIZ_KARGO_ESIGI } from '../../data/generate'
import { Panel } from '../../components/admin/AdminUI'
import { Button } from '../../components/ui/Bits'

const input =
  'h-10 w-full rounded-lg border border-line bg-white px-3 text-[0.85rem] outline-none transition placeholder:text-faint focus:border-crimson/70 focus:ring-2 focus:ring-crimson/12'

function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[0.76rem] font-medium text-ink-soft">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[0.7rem] leading-snug text-faint">{hint}</span>}
    </label>
  )
}

function Toggle({ checked, onChange, label, blurb }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3.5">
      <span className="min-w-0">
        <span className="block text-[0.85rem] font-medium text-steel-900">{label}</span>
        {blurb && <span className="mt-0.5 block text-[0.76rem] leading-snug text-muted">{blurb}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
          checked ? 'bg-steel-700' : 'bg-silver'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? 'left-[1.4rem]' : 'left-0.5'
          }`}
        />
      </button>
    </label>
  )
}

export default function Settings() {
  const { toast, resetDemo } = useStore()
  const { brand } = useTenant()

  const [shop, setShop] = useState({
    name: brand.name,
    email: brand.email,
    phone: brand.phone,
    instagram: brand.instagram,
    address: brand.address,
  })

  const [shipping, setShipping] = useState({
    fee: KARGO_UCRETI,
    threshold: UCRETSIZ_KARGO_ESIGI,
    cod: 29,
  })

  const [flags, setFlags] = useState({
    guestCheckout: true,
    giftWrap: true,
    cod: true,
    installments: false,
    lowStockAlert: true,
    orderEmail: true,
  })

  const save = (e) => {
    e.preventDefault()
    toast('Ayarlar kaydedildi', 'good')
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex justify-end">
        <Button type="submit" size="sm">
          <Save size={15} /> Kaydet
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Mağaza bilgileri" subtitle="Site alt bilgisinde ve faturalarda görünür">
          <div className="space-y-4">
            <Field label="İşletme adı">
              <input className={input} value={shop.name} onChange={(e) => setShop({ ...shop, name: e.target.value })} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="E-posta">
                <input className={input} value={shop.email} onChange={(e) => setShop({ ...shop, email: e.target.value })} />
              </Field>
              <Field label="Telefon">
                <input className={input} value={shop.phone} onChange={(e) => setShop({ ...shop, phone: e.target.value })} />
              </Field>
            </div>
            <Field label="Instagram">
              <input
                className={input}
                value={shop.instagram}
                onChange={(e) => setShop({ ...shop, instagram: e.target.value })}
              />
            </Field>
            <Field label="Adres">
              <textarea
                rows={3}
                className={`${input} h-auto py-2.5 leading-relaxed`}
                value={shop.address}
                onChange={(e) => setShop({ ...shop, address: e.target.value })}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Kargo" subtitle="Sepette ve ödeme adımında uygulanır">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Kargo ücreti (₺)">
              <input
                className={input}
                type="number"
                value={shipping.fee}
                onChange={(e) => setShipping({ ...shipping, fee: Number(e.target.value) })}
              />
            </Field>
            <Field label="Ücretsiz kargo eşiği (₺)">
              <input
                className={input}
                type="number"
                value={shipping.threshold}
                onChange={(e) => setShipping({ ...shipping, threshold: Number(e.target.value) })}
              />
            </Field>
            <Field label="Kapıda ödeme bedeli (₺)" className="sm:col-span-2">
              <input
                className={input}
                type="number"
                value={shipping.cod}
                onChange={(e) => setShipping({ ...shipping, cod: Number(e.target.value) })}
              />
            </Field>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-steel-50 px-3.5 py-3 text-[0.78rem] leading-relaxed text-steel-800">
            <Truck size={15} className="mt-0.5 shrink-0" />
            <span>
              Sepette şu an <strong className="font-semibold">{money(shipping.threshold)}</strong> üzeri
              kargo bedava görünüyor. Ortalama sepetiniz bu eşiğin altındaysa eşiği düşürmek
              dönüşümü artırır.
            </span>
          </div>
        </Panel>

        <Panel title="Ödeme yöntemleri" subtitle="Gerçek sürümde sağlayıcı entegrasyonu bağlanır">
          <ul className="divide-y divide-line">
            {[
              [CreditCard, 'iyzico — Kredi kartı', 'Bağlı değil (demo)', false],
              [Banknote, 'Havale / EFT', 'Aktif', true],
              [Truck, 'Kapıda ödeme', flags.cod ? 'Aktif' : 'Kapalı', flags.cod],
            ].map(([Icon, name, status, on]) => (
              <li key={name} className="flex items-center gap-3.5 py-3.5">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                    on ? 'bg-steel-50 text-steel-700' : 'bg-mist text-faint'
                  }`}
                >
                  <Icon size={16} strokeWidth={1.7} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.85rem] font-medium text-steel-900">{name}</span>
                  <span className="block text-[0.74rem] text-muted">{status}</span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${
                    on ? 'bg-[#EAF6EA] text-[#136B13]' : 'bg-mist text-muted'
                  }`}
                >
                  {on ? 'Açık' : 'Kapalı'}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-crimson-50 px-3.5 py-3 text-[0.78rem] leading-relaxed text-crimson-700">
            <Info size={15} className="mt-0.5 shrink-0" />
            <span>
              Canlıya geçişte iyzico veya PayTR sanal POS başvurusu gerekir. Onay süreci genelde
              3–7 iş günü sürer; şirket/şahıs firması ve vergi levhası istenir.
            </span>
          </div>
        </Panel>

        <Panel title="Mağaza davranışı">
          <div className="divide-y divide-line">
            <Toggle
              checked={flags.guestCheckout}
              onChange={(v) => setFlags({ ...flags, guestCheckout: v })}
              label="Üyeliksiz alışveriş"
              blurb="Müşteri hesap açmadan sipariş verebilir — dönüşümü belirgin artırır"
            />
            <Toggle
              checked={flags.giftWrap}
              onChange={(v) => setFlags({ ...flags, giftWrap: v })}
              label="Ücretsiz hediye paketi"
              blurb="Ödeme adımında seçenek olarak sunulur"
            />
            <Toggle
              checked={flags.cod}
              onChange={(v) => setFlags({ ...flags, cod: v })}
              label="Kapıda ödeme"
              blurb="Ek hizmet bedeliyle birlikte"
            />
            <Toggle
              checked={flags.installments}
              onChange={(v) => setFlags({ ...flags, installments: v })}
              label="Taksit seçeneği"
              blurb="Sanal POS bağlandıktan sonra kullanılabilir"
            />
            <Toggle
              checked={flags.lowStockAlert}
              onChange={(v) => setFlags({ ...flags, lowStockAlert: v })}
              label="Düşük stok uyarısı"
              blurb="20 adedin altına düşen ürünler panelde işaretlenir"
            />
            <Toggle
              checked={flags.orderEmail}
              onChange={(v) => setFlags({ ...flags, orderEmail: v })}
              label="Sipariş bildirim e-postası"
              blurb="Her yeni siparişte işletme adresine bildirim gider"
            />
          </div>
        </Panel>
      </div>

      {/* iletişim özeti */}
      <Panel title="Bağlı kanallar">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Instagram, 'Instagram', shop.instagram, brand.followers + ' takipçi'],
            [Mail, 'E-posta', shop.email, 'Sipariş bildirimleri'],
            [Phone, 'Telefon', shop.phone, 'Kurumsal siparişler'],
            [Building2, 'Fiziksel dükkân', brand.city, 'Haftanın 7 günü açık'],
          ].map(([Icon, label, value, hint]) => (
            <div key={label} className="rounded-xl border border-line bg-mist/40 p-4">
              <Icon size={17} className="text-crimson-700" />
              <p className="mt-3 text-[0.72rem] font-medium uppercase tracking-[0.1em] text-muted">
                {label}
              </p>
              <p className="mt-1 truncate text-[0.85rem] font-medium text-steel-900">{value}</p>
              <p className="mt-0.5 text-[0.72rem] text-faint">{hint}</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* tehlikeli bölge */}
      <Panel title="Demo verisi" subtitle="Sunum sırasında yaptığınız değişiklikleri geri alın">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-lg text-[0.83rem] leading-relaxed text-muted">
            Eklediğiniz ürünler, verdiğiniz demo siparişleri ve değiştirdiğiniz stoklar tarayıcıda
            saklanır. Sıfırlama, her şeyi ilk hâline döndürür.
          </p>
          <Button type="button" variant="outline" onClick={resetDemo}>
            <RotateCcw size={15} /> Demoyu sıfırla
          </Button>
        </div>
      </Panel>
    </form>
  )
}
