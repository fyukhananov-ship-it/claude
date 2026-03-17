import { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CatalogProduct } from '../../data/catalog'
import CatalogCard from './CatalogCard'

interface CategoryCarouselProps {
  products: CatalogProduct[]
  categoryIcon: string
}

export default function CategoryCarousel({ products, categoryIcon }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      ro.disconnect()
    }
  }, [checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.querySelector<HTMLElement>('[data-card]')?.offsetWidth ?? 340
    const gap = 24
    const distance = (cardWidth + gap) * (direction === 'left' ? -1 : 1)
    el.scrollBy({ left: distance, behavior: 'smooth' })
  }

  return (
    <div className="relative group/carousel">
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-2 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-card
            className="w-[300px] sm:w-[340px] lg:w-[calc((100%-48px)/3)] shrink-0 snap-start"
          >
            <CatalogCard product={product} categoryIcon={categoryIcon} />
          </div>
        ))}
      </div>

      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 rounded-full bg-white shadow-card-hover flex items-center justify-center text-charcoal-700 hover:text-warm-500 hover:shadow-elevated transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
          aria-label="Назад"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 rounded-full bg-white shadow-card-hover flex items-center justify-center text-charcoal-700 hover:text-warm-500 hover:shadow-elevated transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
          aria-label="Вперёд"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
