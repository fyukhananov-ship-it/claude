import { Truck, Clock, BadgePercent, Palette } from 'lucide-react'
import type { Advantage } from '../../data/advantages'

const iconMap: Record<string, typeof Truck> = {
  Truck, Clock, BadgePercent, Palette,
}

interface AdvantageCardProps {
  advantage: Advantage
  delay?: number
}

export default function AdvantageCard({ advantage, delay = 0 }: AdvantageCardProps) {
  const Icon = iconMap[advantage.icon] || Truck

  return (
    <div
      className="border-l-[3px] border-warm-400 pl-6 py-1"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 rounded-full bg-warm-50 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-warm-500" strokeWidth={1.5} />
      </div>
      <h3 className="font-serif font-semibold text-charcoal-900 text-[22px] leading-tight mb-2">
        {advantage.title}
      </h3>
      <p className="font-sans text-charcoal-500 text-[15px] leading-relaxed">
        {advantage.description}
      </p>
    </div>
  )
}
