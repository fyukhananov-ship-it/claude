import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'

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
    } catch { /* */ } finally { setLoading(false) }
  }

  const steps = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: 'Оплатите через СБП',
      desc: 'Совершите покупку у партнёра и оплатите через Систему быстрых платежей',
      color: 'bg-sky-50 text-sky-600',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Мы найдём покупку',
      desc: 'Платформа автоматически атрибутирует транзакцию через данные НСПК',
      color: 'bg-violet-50 text-violet-600',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Получите кэшбэк',
      desc: 'Кэшбэк автоматически зачислится на ваш счёт Билайн в течение 1-3 дней',
      color: 'bg-emerald-50 text-emerald-600',
    },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100/50">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-beeline-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[15px] font-semibold">Подключение</span>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-beeline-yellow/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-[22px] font-bold text-beeline-black">Как это работает</h1>
          <p className="text-[13px] text-beeline-gray mt-1.5">Три простых шага до кэшбэка</p>
        </div>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 items-start bg-[#f9f9fb] rounded-2xl p-4">
              <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center shrink-0`}>
                {step.icon}
              </div>
              <div className="pt-0.5">
                <p className="text-[14px] font-semibold text-beeline-black">{step.title}</p>
                <p className="text-[12px] text-beeline-gray mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-amber-50 rounded-2xl p-4 flex gap-3 items-start">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-[12px] text-amber-700 leading-relaxed">
            Оплата только через СБП. Другие способы оплаты не участвуют в акции. Кэшбэк на счёт Билайн.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))] bg-white border-t border-gray-100/50">
        <button
          onClick={handleActivate}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-beeline-yellow text-beeline-black font-bold text-[15px] hover:bg-brand-600 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-yellow-400/25"
        >
          {loading ? 'Подключаем...' : 'Подключить выгоду'}
        </button>
      </div>
    </div>
  )
}
