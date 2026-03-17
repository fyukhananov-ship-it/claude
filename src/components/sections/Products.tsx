import { useScrollReveal } from '../../hooks/useScrollReveal'
import SectionHeading from '../ui/SectionHeading'
import ProductCard from '../ui/ProductCard'
import { products } from '../../data/products'

export default function Products() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section id="products" className="section-padding bg-white">
      <div ref={ref} className="max-w-[1200px] mx-auto">
        <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <SectionHeading eyebrow="Каталог" title="Наша продукция" />
          <p className="text-center font-sans text-charcoal-500 text-base max-w-[600px] mx-auto -mt-6 mb-12">
            От порционных десертов до свадебных тортов — полный ассортимент кондитерских
            изделий и выпечки для вашего заведения
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <div
              key={product.id}
              className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${150 + i * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
