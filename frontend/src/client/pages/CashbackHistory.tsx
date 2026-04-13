import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { formatCurrency, cn } from '@/lib/utils'
import { formatOfferDate } from '@/client/lib/format'
import TabBar from '@/client/components/TabBar'

interface CashbackItem { date: string; partner_name: string; purchase_amount: string; cashback_amount: string; status: string }

const tints = [
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#FEE2E2', text: '#991B1B' },
  { bg: '#EDE9FE', text: '#5B21B6' },
  { bg: '#DBEAFE', text: '#1E40AF' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#FCE7F3', text: '#9F1239' },
]
function tint(s: string) { return tints[s.charCodeAt(0) % tints.length] }

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
    <div className="min-h-screen bg-[#F5F6F8]">
      <div className="bg-white px-5 pt-[max(52px,env(safe-area-inset-top,52px))] pb-4 border-b border-[#F0F0F0]">
        <h1 className="text-[24px] font-extrabold text-[#1C1917] tracking-[-0.03em]">Кэшбэк</h1>
        <p className="text-[13px] text-[#9CA3AF] mt-0.5">История начислений</p>
      </div>

      <div className="px-5 py-5 pb-28">
        {/* Total card */}
        <div className="rounded-[20px] p-5 mb-5"
          style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 50%, #C4B5FD 100%)' }}>
          <p className="text-[11px] font-semibold text-[#7C3AED] uppercase tracking-[0.1em]">Накопленный кэшбэк</p>
          <p className="font-mono-cash text-[36px] font-extrabold text-[#5B21B6] leading-none mt-2">{formatCurrency(total)}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-[14px] text-[#1C1917] font-bold">Не удалось загрузить</p>
            <p className="text-[13px] text-[#9CA3AF] mt-1">Проверьте интернет</p>
            <button onClick={fetchData} className="mt-4 px-5 py-2.5 rounded-full bg-[#1C1917] text-white font-bold text-[13px] press-scale">Повторить</button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[15px] font-bold text-[#1C1917]">Пока нет начислений</p>
            <p className="text-[13px] text-[#9CA3AF] mt-1">Активируйте оффер и оплатите через СБП</p>
            <button onClick={() => navigate(`/client/${phoneHash}`)}
              className="mt-4 px-5 py-2.5 rounded-full bg-[#1C1917] text-white font-bold text-[13px] press-scale">
              К офферам
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item, i) => {
              const st = statusStyles[item.status] || statusStyles.pending
              const isRejected = item.status === 'rejected'
              const t = tint(item.partner_name)
              return (
                <div key={i} className="bg-white rounded-[16px] p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.bg }}>
                    <span className="text-[16px] font-extrabold" style={{ color: t.text }}>{item.partner_name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[14px] font-bold text-[#1C1917] truncate">{item.partner_name}</p>
                      <span className={cn('font-mono-cash text-[16px] font-extrabold shrink-0 ml-2', isRejected ? 'text-red-500 line-through' : 'text-emerald-600')}>
                        {isRejected ? '' : '+'}{formatCurrency(item.cashback_amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[11px] text-[#9CA3AF] truncate">
                        {formatOfferDate(item.date)} · {formatCurrency(item.purchase_amount)}
                      </p>
                      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0', st.cls)}>{st.label}</span>
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
