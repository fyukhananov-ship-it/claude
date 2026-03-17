import { useState } from 'react'
import {
  Cookie, CakeSlice, Cake, IceCreamCone, Cherry, ChefHat,
} from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import SectionHeading from '../ui/SectionHeading'
import CatalogCard from '../ui/CatalogCard'
import { catalog } from '../../data/catalog'

const categoryIconComponents: Record<string, typeof Cookie> = {
  Cookie, CakeSlice, Cake, Slice: IceCreamCone, Cherry, ChefHat,
}

export default function Products() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.02, rootMargin: '200px' })
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const displayedCategories = activeCategory
    ? catalog.filter(c => c.id === activeCategory)
    : catalog

  return (
    <section id="products" className="section-padding bg-white">
      <div ref={ref} className="max-w-[1200px] mx-auto">
        <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <SectionHeading eyebrow="Каталог" title="Наша продукция" />
          <p className="text-center font-sans text-charcoal-500 text-base max-w-[600px] mx-auto -mt-6 mb-10">
            Полный ассортимент кондитерских изделий и выпечки для HoReCa — от мини-пирожных до пластовых тортов
          </p>
        </div>

        {/* Category tabs */}
        <div className={`flex flex-wrap justify-center gap-2 mb-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '150ms' }}>
          <button
            onClick={() => setActiveCategory(null)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-sans text-sm font-medium transition-all duration-200 ${
              activeCategory === null
                ? 'bg-warm-500 text-white shadow-md'
                : 'bg-warm-50 text-charcoal-700 hover:bg-warm-100'
            }`}
          >
            Все категории
          </button>
          {catalog.map(category => {
            const Icon = categoryIconComponents[category.icon] || Cake
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-sans text-sm font-medium transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-warm-500 text-white shadow-md'
                    : 'bg-warm-50 text-charcoal-700 hover:bg-warm-100'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">{category.name.split(',')[0]}</span>
              </button>
            )
          })}
        </div>

        {/* Product grid by category */}
        {displayedCategories.map((category, catIdx) => (
          <div key={category.id} className={catIdx > 0 ? 'mt-14' : ''}>
            {!activeCategory && (
              <div className={`flex items-center gap-3 mb-6 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: `${200 + catIdx * 100}ms` }}>
                <div className="w-10 h-10 rounded-xl bg-warm-50 flex items-center justify-center">
                  {(() => {
                    const Icon = categoryIconComponents[category.icon] || Cake
                    return <Icon className="w-5 h-5 text-warm-400" strokeWidth={1.5} />
                  })()}
                </div>
                <h3 className="font-serif text-2xl font-semibold text-charcoal-900">
                  {category.name}
                </h3>
                <div className="flex-1 h-px bg-charcoal-100 ml-4" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.products.map((product, i) => (
                <div
                  key={product.id}
                  className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                  style={{ transitionDelay: `${250 + catIdx * 100 + i * 80}ms` }}
                >
                  <CatalogCard product={product} categoryIcon={category.icon} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
