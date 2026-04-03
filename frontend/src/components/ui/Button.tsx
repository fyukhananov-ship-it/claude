import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        {
          'bg-beeline-yellow text-beeline-black hover:bg-brand-600 focus:ring-beeline-yellow':
            variant === 'primary',
          'bg-gray-100 text-beeline-dark hover:bg-gray-200 focus:ring-gray-300':
            variant === 'secondary',
          'border border-gray-300 bg-white text-beeline-dark hover:bg-gray-50 focus:ring-gray-300':
            variant === 'outline',
          'text-beeline-dark hover:bg-gray-100 focus:ring-gray-300':
            variant === 'ghost',
          'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500':
            variant === 'destructive',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2.5 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    />
  )
}
