import { useParams, useNavigate } from 'react-router-dom'

export default function ThankYou() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-200/30 rounded-full blur-[80px]" />

      <div className="relative z-10 text-center max-w-xs">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_rgba(16,185,129,0.3)]">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>

        <h1 className="text-[26px] font-extrabold text-[#111] tracking-[-0.03em]">Выгода подключена!</h1>
        <p className="text-[14px] text-[#999] mt-3 leading-relaxed font-medium">
          Оплачивайте покупки через СБП у партнёра. Кэшбэк автоматически поступит на ваш счёт Билайн.
        </p>

        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-4 mt-6 text-left flex gap-3 items-start">
          <div className="w-10 h-10 rounded-xl bg-[#FFD500]/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#B8960A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#111]">Начисление 1&#8211;3 дня</p>
            <p className="text-[11px] text-[#999] mt-0.5 font-medium">После обработки реестра НСПК</p>
          </div>
        </div>

        <div className="mt-8 space-y-3 w-full">
          <button onClick={() => navigate(`/client/${phoneHash}`)}
            className="w-full py-4 rounded-2xl bg-[#FFD500] text-[#111] font-extrabold text-[15px] press-scale shadow-[0_4px_24px_rgba(255,213,0,0.35)]">
            Смотреть другие офферы
          </button>
          <button onClick={() => navigate(`/client/${phoneHash}/cashback`)}
            className="w-full py-3.5 rounded-2xl bg-[#f0f0f0] text-[#333] font-bold text-[14px] press-scale">
            Мой кэшбэк
          </button>
        </div>
      </div>
    </div>
  )
}
