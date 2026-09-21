import { Link } from 'react-router-dom'
import { ArrowRight, Home } from 'lucide-react'
import { Button, Emblem, Ornament } from '../components/ui/Bits'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-steel-900 px-6 text-center text-snow">
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="relative">
        <Emblem className="mx-auto h-16 w-16" ink="#F6F7F8" />
        <p className="eyebrow mt-8 !text-crimson-400">404</p>
        <h1 className="mt-4 text-[2.6rem] leading-tight !text-snow sm:text-[3.4rem]">
          Bu sayfa
          <br />
          <span className="italic text-crimson-400">demlenmemiş</span>
        </h1>
        <Ornament className="mt-6" tone="light" width="w-20" />
        <p className="mx-auto mt-5 max-w-sm text-[0.92rem] text-snow/65">
          Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir. Buyurun, ocağın başına dönelim.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/" variant="crimson">
            <Home size={16} /> Anasayfa
          </Button>
          <Button as={Link} to="/magaza" variant="outlineLight">
            Mağaza <ArrowRight size={15} />
          </Button>
        </div>
      </div>
    </div>
  )
}
