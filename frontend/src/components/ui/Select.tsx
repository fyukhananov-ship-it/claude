import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ className, label, options, ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-beeline-dark mb-1.5">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-beeline-yellow focus:border-transparent transition-colors text-sm bg-white',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
