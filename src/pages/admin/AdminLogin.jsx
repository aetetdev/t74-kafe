import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, LockKeyhole, Sparkles } from 'lucide-react'

import { useStore } from '../../store/StoreContext'
import { useTenant } from '../../store/TenantContext'
import { Button, Emblem, Ornament } from '../../components/ui/Bits'

const DEMO_PASSWORD = 'demo1299'

const input =
  'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[0.88rem] outline-none transition placeholder:text-faint focus:border-crimson/70 focus:ring-2 focus:ring-crimson/15'

export default function AdminLogin() {
  const { login, isAdmin } = useStore()
  const { brand } = useTenant()
  const DEMO = { email: brand.demoEmail, password: DEMO_PASSWORD }
  const navigate = useNavigate()
  const location = useLocation()
  const target = location.state?.from ?? '/yonetim'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  if (isAdmin) navigate(target, { replace: true })

  const submit = (e) => {
    e.preventDefault()
    const res = login(email, password)
    if (res.ok) navigate(target, { replace: true })
    else setError(res.error)
  }

  const demoLogin = () => {
    setEmail(DEMO.email)
    setPassword(DEMO.password)
    login(DEMO.email, DEMO.password)
    navigate(target, { replace: true })
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* marka tarafı */}
      <div className="relative hidden overflow-hidden bg-steel-900 text-snow lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="grain absolute inset-0" />
        <div
          className="absolute -right-32 top-1/4 h-96 w-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(196,18,47,.20), transparent 65%)' }}
        />

        <div className="relative">
          <Emblem className="h-12 w-12" ink="#F6F7F8" />
        </div>

        <div className="relative">
          <p className="eyebrow !text-crimson-400">Yönetim paneli</p>
          <h1 className="mt-5 text-[2.6rem] leading-tight !text-snow">
            İşletmenizi
            <br />
            <span className="italic text-crimson-400">tek ekrandan yönetin</span>
          </h1>
          <Ornament className="mt-7 !justify-start" tone="light" width="w-20" />
          <p className="mt-7 max-w-md text-[0.95rem] leading-relaxed text-snow/65">
            Siparişler, stok, ciro, ziyaretçi davranışı ve en çok ilgi gören ürünler —
            hepsi gerçek zamanlı, hepsi tek yerde.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-snow/12 pt-8">
            {[
              ['Sipariş yönetimi', 'Durum güncelleme, kargo takibi'],
              ['Ürün girişi', 'Dakikalar içinde yeni ürün'],
              ['Canlı metrikler', 'Günlük, aylık, yıllık'],
            ].map(([t, s]) => (
              <div key={t}>
                <p className="text-[0.8rem] font-medium text-snow">{t}</p>
                <p className="mt-1 text-[0.7rem] leading-snug text-snow/45">{s}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[0.72rem] text-snow/35">
          {brand.name} · {brand.demoLabel}
        </p>
      </div>

      {/* form tarafı */}
      <div className="flex flex-col justify-center bg-snow px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[0.78rem] text-muted transition hover:text-steel-800"
          >
            <ArrowLeft size={14} /> Mağazaya dön
          </Link>

          <div className="mt-8 lg:hidden">
            <Emblem className="h-11 w-11" />
          </div>

          <h2 className="mt-8 text-[1.9rem]">Giriş yapın</h2>
          <p className="mt-2 text-[0.88rem] text-muted">
            Yönetim paneline erişmek için hesabınıza giriş yapın.
          </p>

          {/* demo kısayolu */}
          <button
            onClick={demoLogin}
            className="mt-7 flex w-full items-center gap-3 rounded-xl border border-dashed border-crimson/50 bg-crimson-50/60 p-4 text-left transition hover:border-crimson hover:bg-crimson-50"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-crimson/20 text-crimson-700">
              <Sparkles size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.84rem] font-semibold text-steel-900">
                Demo hesabıyla gir
              </span>
              <span className="block text-[0.74rem] text-muted">
                Örnek verilerle dolu paneli tek tıkla açın
              </span>
              <span className="mt-1 block text-[0.7rem] tnum text-crimson-700">
                {DEMO.email} · {DEMO.password}
              </span>
            </span>
            <ArrowRight size={16} className="shrink-0 text-crimson-700" />
          </button>

          <div className="my-7 flex items-center gap-3 text-[0.72rem] text-faint">
            <span className="h-px flex-1 bg-line" /> ya da <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[0.76rem] font-medium text-ink-soft">E-posta</span>
              <input
                className={input}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
                placeholder={DEMO.email}
                autoComplete="username"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[0.76rem] font-medium text-ink-soft">Parola</span>
              <input
                className={input}
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>

            {error && (
              <p className="rounded-lg bg-[#FBEAEA] px-3 py-2.5 text-[0.78rem] text-[#9A2C2C]">{error}</p>
            )}

            <Button type="submit" size="lg" className="w-full">
              <LockKeyhole size={16} /> Giriş yap
            </Button>
          </form>

          <p className="mt-6 text-center text-[0.72rem] leading-relaxed text-faint">
            Demo kimlik doğrulaması istemci tarafındadır. Gerçek sürümde oturum sunucuda,
            şifreler hash’lenerek saklanır ve iki adımlı doğrulama eklenir.
          </p>
        </div>
      </div>
    </div>
  )
}
