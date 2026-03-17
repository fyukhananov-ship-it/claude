import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Button from '../ui/Button'

const navLinks = [
  { label: 'О компании', href: '#about' },
  { label: 'Продукция', href: '#products' },
  { label: 'Преимущества', href: '#advantages' },
  { label: 'Журнал', href: '#journal' },
  { label: 'Контакты', href: '#contacts' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  const scrollTo = (href: string) => {
    setIsMobileMenuOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-header' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-[72px] lg:h-[72px]">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          className="font-serif font-semibold text-charcoal-900 text-xl tracking-tight"
        >
          Линия Вкуса
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => { e.preventDefault(); scrollTo(link.href) }}
              className="relative font-sans font-medium text-[15px] text-charcoal-700 hover:text-warm-500 transition-colors duration-200 after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-[-4px] after:w-0 after:h-0.5 after:bg-warm-500 after:transition-all after:duration-200 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button size="sm" onClick={() => scrollTo('#contacts')}>
            Оставить заявку
          </Button>
        </div>

        <button
          className="lg:hidden p-2 text-charcoal-700 hover:text-charcoal-900 transition-colors cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] bg-white z-40 lg:hidden animate-fade-in">
          <nav className="flex flex-col items-center justify-center h-full gap-8 -mt-[72px]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollTo(link.href) }}
                className="font-serif font-semibold text-2xl text-charcoal-900 hover:text-warm-500 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Button size="lg" onClick={() => scrollTo('#contacts')}>
              Оставить заявку
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
