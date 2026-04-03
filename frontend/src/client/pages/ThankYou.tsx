import { useParams, useNavigate } from 'react-router-dom'

export default function ThankYou() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-100/50 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-xs">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-emerald-400/30 animate-[bounce_1s_ease-in-out]">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-[24px] font-bold text-beeline-black">Выгода подключена!</h1>
        <p className="text-[14px] text-beeline-gray mt-3 leading-relaxed">
          Оплачивайте покупки через СБП у партнёра. Кэшбэк автоматически поступит на ваш счёт Билайн.
        </p>

        {/* Info card */}
        <div className="bg-[#f5f5f7] rounded-2xl p-4 mt-6 text-left">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-beeline-yellow/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-medium text-beeline-dark">Начисление 1-3 дня</p>
              <p className="text-[11px] text-beeline-gray mt-0.5">После обработки реестра НСПК кэшбэк поступит на счёт</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3 w-full">
          <button
            onClick={() => navigate(`/client/${phoneHash}`)}
            className="w-full py-4 rounded-2xl bg-beeline-yellow text-beeline-black font-bold text-[15px] hover:bg-brand-600 active:scale-[0.98] transition-all shadow-lg shadow-yellow-400/25"
          >
            Смотреть другие офферы
          </button>
          <button
            onClick={() => navigate(`/client/${phoneHash}/cashback`)}
            className="w-full py-3.5 rounded-2xl bg-gray-100 text-beeline-dark font-medium text-[14px] hover:bg-gray-200 active:scale-[0.98] transition-all"
          >
            Мой кэшбэк
          </button>
        </div>
      </div>
    </div>
  )
}
