import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  show: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 2500)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-[max(60px,env(safe-area-inset-top,60px))] left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'px-4 py-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] text-[13px] font-bold pointer-events-auto max-w-[calc(100vw-32px)] animate-[slideDown_0.3s_ease-out]',
              t.type === 'success' && 'bg-emerald-500 text-white',
              t.type === 'error' && 'bg-red-500 text-white',
              t.type === 'info' && 'bg-[#111] text-white'
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
