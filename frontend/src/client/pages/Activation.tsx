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
    try { await api.post(`/client/${phoneHash}/activate/${offerId}`); navigate(`/client/${phoneHash}/thanks`) }
    catch {} finally { setLoading(false) }
  }

  const steps = [
    { n: '01', title: 'Оплатите через СБП', desc: 'Совершите покупку у партнёра через Систему быстрых платежей', color: 'from-sky-400 to-blue-600' },
    { n: '02', title: 'Мы найдём покупку', desc: 'Платформа автоматически атрибутирует транзакцию через данные НСПК', color: 'from-violet-400 to-purple-600' },
    { n: '03', title: 'Получите кэшбэк', desc: 'Кэшбэк зачислится на ваш счёт Билайн в течение 1\u20143 дней', color: 'from-emerald-400 to-teal-600' },
  ]

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <div className="px-4 py-3 flex items-center gap-3 glass border-b border-black/[0.04]">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center press-scale">
          <svg className="w-5 h-5 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-[15px] font-bold text-[#111]">Подключение</span>
      </div>

      <div className="flex-1 px-5 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-[#FFD500]/10 flex items-center justify-center mx-auto mb-4 shadow-[0_0_32px_rgba(255,213,0,0.15)]">
            <svg className="w-8 h-8 text-[#B8960A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-[24px] font-extrabold text-[#111] tracking-[-0.03em]">Как это работает</h1>
          <p className="text-[13px] text-[#999] mt-2 font-medium">Три шага до кэшбэка</p>
        </div>

        <div className="space-y-3 animate-stagger">
          {steps.map(s => (
            <div key={s.n} className="bg-white rounded-2xl border border-[#f0f0f0] p-4 flex gap-4 items-start">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0 shadow-lg`}>
                <span className="font-mono-cash text-[14px] font-extrabold text-white">{s.n}</span>
              </div>
              <div className="pt-0.5">
                <p className="text-[14px] font-extrabold text-[#111]">{s.title}</p>
                <p className="text-[12px] text-[#999] mt-1 leading-relaxed font-medium">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed font-medium">Оплата только через СБП. Другие способы оплаты не участвуют. Кэшбэк на счёт Билайн.</p>
        </div>
      </div>

      <div className="px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))] glass border-t border-black/[0.04]">
        <button onClick={handleActivate} disabled={loading}
          className="w-full py-4 rounded-2xl bg-[#FFD500] text-[#111] font-extrabold text-[15px] press-scale disabled:opacity-60 shadow-[0_4px_24px_rgba(255,213,0,0.35)]">
          {loading ? 'Подключаем...' : 'Подключить выгоду'}
        </button>
      </div>
    </div>
  )
}
