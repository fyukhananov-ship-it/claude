import {
  Cookie, CakeSlice, Cake, Cherry, ChefHat, IceCreamCone,
} from 'lucide-react'
import type { CatalogProduct } from '../../data/catalog'

const categoryIconMap: Record<string, typeof Cookie> = {
  Cookie, CakeSlice, Cake, Slice: IceCreamCone, Cherry, ChefHat,
}

interface CatalogCardProps {
  product: CatalogProduct
  categoryIcon: string
}

export default function CatalogCard({ product, categoryIcon }: CatalogCardProps) {
  const Icon = categoryIconMap[categoryIcon] || Cake

  return (
    <div className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full">
      <div className="h-48 bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center relative overflow-hidden shrink-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-dot-pattern opacity-30" />
            <Icon
              className="w-16 h-16 text-warm-300 group-hover:scale-110 transition-transform duration-300"
              strokeWidth={1.2}
            />
          </>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif font-semibold text-charcoal-900 text-lg leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="font-sans text-charcoal-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-charcoal-100 mt-auto">
          <span className="font-sans text-xs text-charcoal-300 uppercase tracking-wider">
            {product.weight}
          </span>
          <button className="font-sans text-sm text-warm-500 hover:text-warm-600 font-medium transition-colors cursor-pointer">
            Подробнее
          </button>
        </div>
      </div>
    </div>
  )
}
