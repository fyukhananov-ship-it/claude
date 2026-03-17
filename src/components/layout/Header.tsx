import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import Button from '../ui/Button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet'

const navLinks = [
  { label: 'О компании', href: '#about' },
  { label: 'Продукция', href: '#products' },
  { label: 'Преимущества', href: '#advantages' },
  { label: 'Журнал', href: '#journal' },
  { label: 'Контакты', href: '#contacts' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (href: string) => {
    setIsMobileOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-header' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center justify-between h-[72px]">
          <div className="flex items-center gap-10">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="font-serif font-semibold text-charcoal-900 text-xl tracking-tight"
            >
              Линия Вкуса
            </a>
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollTo(link.href) }}
                  className="inline-flex h-10 items-center justify-center rounded-md px-4 py-2 font-sans text-sm font-medium text-charcoal-700 transition-colors hover:bg-warm-50 hover:text-warm-600"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <Button size="sm" onClick={() => scrollTo('#contacts')}>
            Оставить заявку
          </Button>
        </nav>

        {/* Mobile nav */}
        <div className="flex lg:hidden items-center justify-between h-[72px]">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="font-serif font-semibold text-charcoal-900 text-xl tracking-tight"
          >
            Линия Вкуса
          </a>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="inline-flex items-center justify-center rounded-md border border-charcoal-100 bg-white/80 p-2 text-charcoal-700 transition-colors hover:bg-warm-50 hover:text-charcoal-900 cursor-pointer"
                aria-label="Открыть меню"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto bg-white">
              <SheetHeader>
                <SheetTitle>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setIsMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className="font-serif font-semibold text-charcoal-900 text-xl tracking-tight"
                  >
                    Линия Вкуса
                  </a>
                </SheetTitle>
              </SheetHeader>
              <div className="my-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollTo(link.href) }}
                    className="flex items-center rounded-md px-3 py-2.5 font-sans text-base font-semibold text-charcoal-900 transition-colors hover:bg-warm-50 hover:text-warm-600"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-4 border-t border-charcoal-100 pt-6">
                  <Button size="lg" className="w-full" onClick={() => scrollTo('#contacts')}>
                    Оставить заявку
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
