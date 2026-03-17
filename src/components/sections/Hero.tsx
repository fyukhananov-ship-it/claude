import { useEffect, useState } from 'react'
import Button from '../ui/Button'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative min-h-[calc(100vh-72px)] flex items-center justify-center bg-dot-pattern overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-warm-100/30 to-transparent rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(253,235,214,0.3) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-[800px] mx-auto px-6 text-center pt-[72px]">
        <div
          className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-0.5 bg-warm-300" />
            <span className="font-sans font-medium text-warm-500 text-[13px] uppercase tracking-[0.1em]">
              Кондитерские изделия для HoReCa
            </span>
            <div className="w-8 h-0.5 bg-warm-300" />
          </div>
        </div>

        <h1
          className={`font-serif font-semibold text-charcoal-900 text-[40px] lg:text-[64px] leading-[1.1] tracking-[-0.02em] mb-6 transition-all duration-700 ease-out delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          Свежая кондитерская продукция для вашего бизнеса
        </h1>

        <p
          className={`font-sans text-charcoal-500 text-base lg:text-lg leading-relaxed max-w-[600px] mx-auto mb-8 transition-all duration-700 ease-out delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          Порционные торты, пирожные, выпечка и десерты с доставкой собственным
          рефрижераторным транспортом по Москве. Выгоднее, чем собственное производство.
        </p>

        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 transition-all duration-700 ease-out delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <Button
            size="lg"
            onClick={() => document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Смотреть каталог
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => document.querySelector('#contacts')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Связаться с нами
          </Button>
        </div>

        <p
          className={`font-sans text-charcoal-300 text-sm transition-all duration-700 ease-out delay-[400ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          Собственная доставка &middot; Свежее каждый день &middot; Индивидуальные заказы
        </p>
      </div>
    </section>
  )
}
