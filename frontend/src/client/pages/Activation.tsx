import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'

const steps = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Оплатите через СБП',
    desc: 'Совершите покупку у партнёра и оплатите через Систему быстрых платежей',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Мы найдём покупку',
    desc: 'Платформа автоматически найдёт вашу транзакцию в реестре НСПК',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Получите кэшбэк',
    desc: 'Кэшбэк автоматически поступит на ваш счёт Билайн',
  },
]

export default function Activation() {
  const { phoneHash, offerId } = useParams<{ phoneHash: string; offerId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleActivate = async () => {
    if (!phoneHash || !offerId) return
    setLoading(true)
    try {
      await api.post(`/client/${phoneHash}/activate/${offerId}`)
      navigate(`/client/${phoneHash}/thanks`)
    } catch {
      // Handle error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-center border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="ml-2 font-medium text-sm">Подключение выгоды</span>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-beeline-black text-center mb-2">
          Как это работает
        </h1>
        <p className="text-beeline-gray text-center text-sm mb-8">
          Три простых шага до кэшбэка
        </p>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-14 h-14 rounded-2xl bg-beeline-yellow/10 flex items-center justify-center text-brand-700 shrink-0">
                {step.icon}
              </div>
              <div>
                <p className="font-semibold text-beeline-black">{step.title}</p>
                <p className="text-sm text-beeline-gray mt-1">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-beeline-gray text-center">
            Оплата только через СБП. Кэшбэк начисляется на счёт Билайн после обработки реестра (обычно 1-3 дня).
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 py-4 border-t border-gray-100">
        <Button
          size="lg"
          className="w-full"
          onClick={handleActivate}
          disabled={loading}
        >
          {loading ? 'Подключаем...' : 'Подключить выгоду'}
        </Button>
      </div>
    </div>
  )
}
