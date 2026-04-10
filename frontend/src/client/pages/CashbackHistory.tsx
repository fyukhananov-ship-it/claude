import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { formatCurrency, cn } from '@/lib/utils'
import { formatOfferDate } from '@/client/lib/format'
import TabBar from '@/client/components/TabBar'

interface CashbackItem { date: string; partner_name: string; purchase_amount: string; cashback_amount: string; status: string }

const gradients = ['from-amber-400 to-orange-500','from-rose-400 to-pink-600','from-violet-400 to-purple-600','from-sky-400 to-blue-600','from-emerald-400 to-teal-600','from-fuchsia-400 to-pink-600']
function getGrad(s: string) { return gradients[s.charCodeAt(0) % gradients.length] }

export default function CashbackHistory() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()
  const [items, setItems] = useState<CashbackItem[]>([])
  const [total, setTotal] = useState('0')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = () => {
    if (!phoneHash) return
    setLoading(true)
    setError(false)
    Promise.all([
      api.get<CashbackItem[]>(`/client/${phoneHash}/cashback`),
      api.get<{ total: string }>(`/client/${phoneHash}/cashback/total`),
    ])
      .then(([h, t]) => { setItems(h); setTotal(t.total) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(fetchData, [phoneHash])

  const statusStyles: Record<string, { label: string; cls: string }> = {
    approved: { label: 'Начислено', cls: 'bg-emerald-50 text-emerald-600' },
    paid: { label: 'Выплачено', cls: 'bg-emerald-50 text-emerald-600' },
    pending: { label: 'В обработке', cls: 'bg-amber-50 text-amber-600' },
    rejected: { label: 'Отклонено', cls: 'bg-red-50 text-red-600' },
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-[#111] noise-bg relative text-white px-5 pt-[max(52px,env(safe-area-inset-top,52px))] pb-6">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => navigate(`/client/${phoneHash}`)} className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.06] flex items-center justify-center press-scale" aria-label="Назад">
              <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-[15px] font-bold">Мой кэшбэк</span>
          </div>

          {/* Total card */}
          <div className="bg-gradient-to-br from-[#FFD500] via-[#F59E0B] to-[#D97706] rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-6 w-24 h-24 rounded-full bg-black/5" />
            <div className="relative z-10">
              <p className="text-[11px] font-bold text-black/40 uppercase tracking-[0.15em]">Накопленный кэшбэк</p>
              <p className="font-mono-cash text-[40px] font-extrabold text-[#111] leading-none mt-2">{formatCurrency(total)}</p>
              <p className="text-[12px] text-black/40 mt-2 font-medium flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                На счёт Билайн
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="px-5 py-5 pb-28">
        <h2 className="text-[20px] font-extrabold text-[#111] mb-4 tracking-[-0.03em]">История</h2>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="w-8 h-8 border-[3px] border-[#FFD500] border-t-transparent rounded-full animate-spin" />
            <p className="text-[12px] text-[#999] font-medium">Загружаем историю…</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-[14px] text-[#333] font-bold">Не удалось загрузить</p>
            <p className="text-[12px] text-[#999] mt-1 font-medium">Проверьте интернет-соединение</p>
            <button onClick={fetchData} className="mt-4 px-5 py-2.5 rounded-2xl bg-[#111] text-white font-bold text-[13px] press-scale">Повторить</button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-[14px] text-[#333] font-bold">Пока нет начислений</p>
            <p className="text-[12px] text-[#999] mt-1 font-medium max-w-xs mx-auto">Активируйте оффер и оплатите через СБП — кэшбэк появится здесь</p>
            <button
              onClick={() => navigate(`/client/${phoneHash}`)}
              className="mt-5 px-6 py-3 rounded-2xl bg-[#FFD500] text-[#111] font-extrabold text-[14px] press-scale shadow-[0_4px_24px_rgba(255,213,0,0.35)]"
            >
              Активировать первый оффер
            </button>
          </div>
        ) : (
          <div className="space-y-2 animate-stagger">
            {items.map((item, i) => {
              const st = statusStyles[item.status] || statusStyles.pending
              const isRejected = item.status === 'rejected'
              return (
                <div key={i} className="bg-white rounded-2xl border border-[#f0f0f0] p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[14px] font-extrabold shrink-0 shadow-lg', getGrad(item.partner_name))}>
                      {item.partner_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] font-bold text-[#111] truncate">{item.partner_name}</p>
                        <span className={cn('font-mono-cash text-[17px] font-extrabold shrink-0 ml-2', isRejected ? 'text-red-500 line-through' : 'text-emerald-600')}>
                          {isRejected ? '' : '+'}{formatCurrency(item.cashback_amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 gap-2">
                        <p className="text-[12px] text-[#999] font-medium truncate">
                          {formatOfferDate(item.date)} · Покупка {formatCurrency(item.purchase_amount)}
                        </p>
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap', st.cls)}>{st.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <TabBar active="cashback" />
    </div>
  )
}
