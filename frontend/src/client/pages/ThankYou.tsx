import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function ThankYou() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Animated checkmark */}
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-beeline-black text-center">
        Выгода подключена!
      </h1>

      <p className="text-beeline-gray text-center mt-3 max-w-xs leading-relaxed">
        Оплачивайте покупки через СБП у партнёра. Кэшбэк автоматически поступит на ваш счёт Билайн.
      </p>

      <div className="bg-beeline-yellow/10 rounded-2xl p-4 mt-6 max-w-xs w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-beeline-yellow rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-beeline-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-beeline-dark">
            Начисление обычно происходит в течение 1-3 дней после покупки
          </p>
        </div>
      </div>

      <Button
        size="lg"
        className="w-full max-w-xs mt-8"
        onClick={() => navigate(`/client/${phoneHash}`)}
      >
        Вернуться к офферам
      </Button>
    </div>
  )
}
