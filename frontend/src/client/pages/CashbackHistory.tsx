import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CashbackItem {
  date: string
  partner_name: string
  purchase_amount: string
  cashback_amount: string
  status: string
}

const avatarColors = [
  'bg-rose-100 text-rose-600', 'bg-sky-100 text-sky-600', 'bg-amber-100 text-amber-600',
  'bg-emerald-100 text-emerald-600', 'bg-violet-100 text-violet-600', 'bg-fuchsia-100 text-fuchsia-600',
]
function getAvatarColor(name: string) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length]
}

export default function CashbackHistory() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()
  const [items, setItems] = useState<CashbackItem[]>([])
  const [total, setTotal] = useState('0')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!phoneHash) return
    Promise.all([
      api.get<CashbackItem[]>(`/client/${phoneHash}/cashback`),
      api.get<{ total: string }>(`/client/${phoneHash}/cashback/total`),
    ])
      .then(([history, totalData]) => { setItems(history); setTotal(totalData.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [phoneHash])

  const statusMap: Record<string, { label: string; color: string }> = {
    approved: { label: 'Начислено', color: 'bg-emerald-50 text-emerald-600' },
    paid: { label: 'Выплачено', color: 'bg-emerald-50 text-emerald-600' },
    pending: { label: 'В обработке', color: 'bg-amber-50 text-amber-600' },
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="bg-gradient-to-b from-beeline-black to-[#2a2a2a] text-white px-5 pt-14 pb-6">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(`/client/${phoneHash}`)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[15px] font-semibold">Мой кэшбэк</span>
        </div>

        {/* Total card */}
        <div className="bg-gradient-to-br from-beeline-yellow via-brand-500 to-brand-700 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative z-10">
            <p className="text-[12px] font-medium text-beeline-black/60 uppercase tracking-wider">Накопленный кэшбэк</p>
            <p className="text-[36px] font-extrabold text-beeline-black leading-none mt-2">{formatCurrency(total)}</p>
            <p className="text-[12px] text-beeline-black/50 mt-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              На счёт Билайн
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="px-5 py-5 pb-28">
        <h2 className="text-[17px] font-bold text-beeline-black mb-3">История начислений</h2>

        {loading ? (
          <div className="flex flex-col items-center py-16">
            <div className="w-8 h-8 border-3 border-beeline-yellow border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[14px] text-beeline-dark font-medium">Пока нет начислений</p>
            <p className="text-[12px] text-beeline-gray mt-1">Активируйте оффер и оплатите через СБП</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item, i) => {
              const st = statusMap[item.status] || statusMap.pending
              return (
                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100/60 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-[12px] flex items-center justify-center text-[15px] font-bold shrink-0', getAvatarColor(item.partner_name))}>
                      {item.partner_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] font-semibold text-beeline-black truncate">{item.partner_name}</p>
                        <span className="text-[18px] font-bold text-emerald-600 shrink-0 ml-2">+{formatCurrency(item.cashback_amount)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[11px] text-beeline-gray">
                          {new Date(item.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })} · Покупка {formatCurrency(item.purchase_amount)}
                        </p>
                        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', st.color)}>{st.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 px-4 pb-[env(safe-area-inset-bottom,8px)] pt-2">
        <div className="flex justify-around max-w-md mx-auto">
          <button onClick={() => navigate(`/client/${phoneHash}`)} className="flex flex-col items-center py-1 px-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <span className="text-[10px] text-gray-400 mt-0.5">Офферы</span>
          </button>
          <button className="flex flex-col items-center py-1 px-3 relative">
            <svg className="w-6 h-6 text-beeline-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-semibold text-beeline-black mt-0.5">Кэшбэк</span>
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-beeline-yellow rounded-full" />
          </button>
        </div>
      </div>
    </div>
  )
}
