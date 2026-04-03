import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { formatCurrency, cn } from '@/lib/utils'

interface CashbackItem { date: string; partner_name: string; purchase_amount: string; cashback_amount: string; status: string }

const gradients = ['from-amber-400 to-orange-500','from-rose-400 to-pink-600','from-violet-400 to-purple-600','from-sky-400 to-blue-600','from-emerald-400 to-teal-600','from-fuchsia-400 to-pink-600']
function getGrad(s: string) { return gradients[s.charCodeAt(0) % gradients.length] }

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
    ]).then(([h, t]) => { setItems(h); setTotal(t.total) }).catch(() => {}).finally(() => setLoading(false))
  }, [phoneHash])

  const statusStyles: Record<string, { label: string; cls: string }> = {
    approved: { label: 'Начислено', cls: 'bg-emerald-50 text-emerald-600' },
    paid: { label: 'Выплачено', cls: 'bg-emerald-50 text-emerald-600' },
    pending: { label: 'В обработке', cls: 'bg-amber-50 text-amber-600' },
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-[#111] noise-bg relative text-white px-5 pt-[max(52px,env(safe-area-inset-top,52px))] pb-6">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => navigate(`/client/${phoneHash}`)} className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.06] flex items-center justify-center press-scale">
              <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-[15px] font-bold">Мой кэшбэк</span>
          </div>

          {/* Total card */}
          <div className="bg-gradient-to-br from-[#FFD500] via-[#F59E0B] to-[#D97706] rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-6 w-24 h-24 rounded-full bg-black/5" />
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.15em]">Накопленный кэшбэк</p>
              <p className="font-mono-cash text-[40px] font-extrabold text-[#111] leading-none mt-2">{formatCurrency(total)}</p>
              <p className="text-[11px] text-black/40 mt-2 font-medium flex items-center gap-1.5">
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
          <div className="flex flex-col items-center py-20">
            <div className="w-8 h-8 border-[3px] border-[#FFD500] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-[14px] text-[#333] font-bold">Пока нет начислений</p>
            <p className="text-[12px] text-[#999] mt-1 font-medium">Активируйте оффер и оплатите через СБП</p>
          </div>
        ) : (
          <div className="space-y-2 animate-stagger">
            {items.map((item, i) => {
              const st = statusStyles[item.status] || statusStyles.pending
              return (
                <div key={i} className="bg-white rounded-2xl border border-[#f0f0f0] p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[14px] font-extrabold shrink-0 shadow-lg', getGrad(item.partner_name))}>
                      {item.partner_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] font-bold text-[#111] truncate">{item.partner_name}</p>
                        <span className="font-mono-cash text-[17px] font-extrabold text-emerald-600 shrink-0 ml-2">+{formatCurrency(item.cashback_amount)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[11px] text-[#999] font-medium">
                          {new Date(item.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })} &middot; Покупка {formatCurrency(item.purchase_amount)}
                        </p>
                        <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full', st.cls)}>{st.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-black/[0.04] px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
        <div className="flex justify-around max-w-md mx-auto">
          <button onClick={() => navigate(`/client/${phoneHash}`)} className="flex flex-col items-center py-1 px-4">
            <svg className="w-6 h-6 text-[#bbb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
            <span className="text-[10px] text-[#bbb] mt-0.5 font-medium">Офферы</span>
          </button>
          <button className="flex flex-col items-center py-1 px-4 relative">
            <svg className="w-6 h-6 text-[#111]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-[10px] font-bold text-[#111] mt-0.5">Кэшбэк</span>
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-[#FFD500] rounded-full" />
          </button>
        </div>
      </div>
    </div>
  )
}
