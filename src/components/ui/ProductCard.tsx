import {
  CakeSlice, Cake, Cookie, Croissant, Cherry, Heart, Award, ChefHat,
} from 'lucide-react'
import type { Product } from '../../data/products'

const iconMap: Record<string, typeof CakeSlice> = {
  CakeSlice, Cake, Cookie, Croissant, Cherry, Heart, Award, ChefHat,
}

interface ProductCardProps {
  product: Product
  delay?: number
}

export default function ProductCard({ product, delay = 0 }: ProductCardProps) {
  const Icon = iconMap[product.icon] || Cake

  return (
    <div
      className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="h-44 bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center">
        <Icon className="w-12 h-12 text-warm-300" strokeWidth={1.5} />
      </div>
      <div className="p-5">
        <h3 className="font-serif font-semibold text-charcoal-900 text-xl leading-tight mb-2">
          {product.name}
        </h3>
        <p className="font-sans text-charcoal-500 text-sm leading-relaxed line-clamp-2">
          {product.description}
        </p>
      </div>
    </div>
  )
}
