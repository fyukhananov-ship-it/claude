import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: 'Как получить кэшбэк?',
    a: 'Выберите интересный оффер в каталоге, нажмите «Активировать». Затем совершите покупку у партнёра, оплатив через СБП. Кэшбэк автоматически зачислится на ваш счёт Билайн в течение 1–3 дней.',
  },
  {
    q: 'Обязательно ли платить через СБП?',
    a: 'Да, оплата через Систему быстрых платежей (СБП) обязательна. Другие способы оплаты (картой, наличными) не участвуют в кэшбэке — так работает система.',
  },
  {
    q: 'Когда начислится кэшбэк?',
    a: 'Обычно кэшбэк зачисляется в течение 1–3 рабочих дней после покупки. Иногда может занимать до 7 дней, если партнёр обрабатывает транзакцию дольше.',
  },
  {
    q: 'Есть ли лимит по кэшбэку?',
    a: 'Да, у каждого оффера есть максимальный кэшбэк за одну покупку (указано на карточке оффера). Также есть общий лимит на клиента в месяц.',
  },
  {
    q: 'Что делать, если кэшбэк не начислился?',
    a: 'Проверьте: оффер был активирован до покупки, оплата прошла через СБП, покупка была у правильного партнёра. Если всё верно — напишите в поддержку Билайн.',
  },
  {
    q: 'Как работает барабан удачи?',
    a: 'Крутите барабан — получите персональный оффер с повышенным кэшбэком до 30%. Можно крутить раз в сутки бесплатно.',
  },
  {
    q: 'Можно ли вернуть кэшбэк реальными деньгами?',
    a: 'Кэшбэк зачисляется на ваш счёт Билайн. Его можно потратить на связь, интернет или другие услуги Билайн.',
  },
]

export default function Help() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <div className="sticky top-0 z-20 glass px-4 pt-[max(12px,env(safe-area-inset-top,12px))] pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center press-scale">
          <svg className="w-5 h-5 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[15px] font-bold text-[#111]">Помощь</span>
      </div>

      <div className="px-5 py-5 pb-8">
        <h1 className="text-[24px] font-extrabold text-[#111] tracking-[-0.03em] mb-2">Частые вопросы</h1>
        <p className="text-[13px] text-[#999] font-medium mb-6">Всё, что нужно знать о кэшбэке</p>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <button
              key={i}
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full bg-white rounded-2xl shadow-card p-4 text-left press-scale"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[14px] font-bold text-[#111] leading-tight flex-1">{faq.q}</p>
                <svg className={cn('w-5 h-5 text-[#bbb] shrink-0 transition-transform', openIdx === i && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {openIdx === i && (
                <p className="text-[13px] text-[#666] leading-[1.6] mt-3 font-medium">{faq.a}</p>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 bg-[#FFD500]/10 border border-[#FFD500]/30 rounded-2xl p-4 flex gap-3 items-start">
          <div className="w-10 h-10 rounded-xl bg-[#FFD500]/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#B8960A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#111]">Не нашли ответ?</p>
            <p className="text-[12px] text-[#666] mt-1 font-medium leading-relaxed">
              Напишите в чат поддержки Билайн — ответим в течение 15 минут.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/client/${phoneHash}`)}
          className="w-full mt-6 py-4 rounded-2xl bg-[#FFD500] text-[#111] font-extrabold text-[15px] press-scale shadow-[0_4px_24px_rgba(255,213,0,0.35)]"
        >
          Смотреть офферы
        </button>
      </div>
    </div>
  )
}
