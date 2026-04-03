import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ className, label, error, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-beeline-dark mb-1.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-beeline-yellow focus:border-transparent transition-colors text-sm',
          error && 'border-red-300 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
