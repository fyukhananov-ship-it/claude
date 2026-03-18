import { useState, type FormEvent } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import Button from './Button'

const inputClass =
  'w-full bg-white border border-charcoal-100 rounded-xl px-4 py-3 font-sans text-charcoal-900 placeholder:text-charcoal-300 focus:outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all'

interface RequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function RequestModal({ open, onOpenChange }: RequestModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => {
      onOpenChange(false)
      // Reset after close animation
      setTimeout(() => setIsSubmitted(false), 300)
    }, 1500)
  }

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value)
    if (!value) {
      setTimeout(() => setIsSubmitted(false), 300)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-200">
          <Dialog.Close className="absolute right-4 top-4 rounded-full p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-50 transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </Dialog.Close>

          {isSubmitted ? (
            <div className="text-center py-8">
              <h3 className="font-serif font-semibold text-charcoal-900 text-2xl mb-2">
                Спасибо за заявку!
              </h3>
              <p className="font-sans text-charcoal-500">
                Наш менеджер свяжется с вами в ближайшее время
              </p>
            </div>
          ) : (
            <>
              <Dialog.Title className="font-serif font-semibold text-charcoal-900 text-[24px] mb-1">
                Оставить заявку
              </Dialog.Title>
              <Dialog.Description className="font-sans text-charcoal-500 text-sm mb-6">
                Оставьте контакты и мы свяжемся с вами в течение рабочего дня
              </Dialog.Description>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Ваше имя" required className={inputClass} />
                <input type="text" placeholder="Название заведения" className={inputClass} />
                <input type="tel" placeholder="Телефон" required className={inputClass} />
                <input type="email" placeholder="Email" className={inputClass} />
                <textarea
                  placeholder="Комментарий"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
                <Button type="submit" size="lg" className="w-full">
                  Отправить заявку
                </Button>
                <p className="font-sans text-charcoal-300 text-[13px] text-center">
                  Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных
                </p>
              </form>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
