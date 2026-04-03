import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: { value: number; positive: boolean }
  className?: string
}

export function StatCard({ title, value, subtitle, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm p-6', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-beeline-gray">{title}</p>
          <p className="text-2xl font-bold text-beeline-black mt-1">{value}</p>
          {subtitle && <p className="text-xs text-beeline-gray mt-1">{subtitle}</p>}
          {trend && (
            <p
              className={cn(
                'text-xs mt-1 font-medium',
                trend.positive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.positive ? '+' : ''}{trend.value}%
            </p>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-beeline-yellow/10 flex items-center justify-center text-brand-700">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
