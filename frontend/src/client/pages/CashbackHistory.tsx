import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'

interface CashbackItem {
  date: string
  partner_name: string
  purchase_amount: string
  cashback_amount: string
  status: string
}

interface TotalData {
  total: string
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
      api.get<TotalData>(`/client/${phoneHash}/cashback/total`),
    ])
      .then(([history, totalData]) => {
        setItems(history)
        setTotal(totalData.total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [phoneHash])

  const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'default' }> = {
    approved: { label: 'Начислено', variant: 'success' },
    paid: { label: 'Начислено', variant: 'success' },
    pending: { label: 'В обработке', variant: 'warning' },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-beeline-black text-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate(`/client/${phoneHash}`)} className="p-1 -ml-1 rounded hover:bg-white/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-medium">Мой кэшбэк</span>
        </div>

        {/* Total card */}
        <div className="bg-gradient-to-r from-beeline-yellow to-brand-600 rounded-2xl p-5">
          <p className="text-sm text-beeline-black/70 font-medium">Накопленный кэшбэк</p>
          <p className="text-3xl font-bold text-beeline-black mt-1">
            {formatCurrency(total)}
          </p>
          <p className="text-xs text-beeline-black/50 mt-1">На счёт Билайн</p>
        </div>
      </div>

      {/* History */}
      <div className="px-4 py-4 pb-24">
        <h2 className="font-semibold text-beeline-black mb-3">История начислений</h2>

        {loading ? (
          <p className="text-center text-beeline-gray py-8">Загрузка...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-beeline-gray text-sm">Пока нет начислений</p>
            <p className="text-xs text-gray-400 mt-1">Активируйте оффер и совершите покупку через СБП</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => {
              const st = statusMap[item.status] || statusMap.pending
              return (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-beeline-black text-sm">{item.partner_name}</p>
                      <p className="text-xs text-beeline-gray mt-0.5">
                        {new Date(item.date).toLocaleDateString('ru', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                    <div>
                      <span className="text-xs text-beeline-gray">Покупка: </span>
                      <span className="text-sm text-beeline-dark">{formatCurrency(item.purchase_amount)}</span>
                    </div>
                    <div>
                      <span className="text-lg font-bold text-green-600">
                        +{formatCurrency(item.cashback_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around">
        <button
          onClick={() => navigate(`/client/${phoneHash}`)}
          className="flex flex-col items-center text-beeline-gray"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <span className="text-xs mt-1">Офферы</span>
        </button>
        <button className="flex flex-col items-center text-beeline-black">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-medium mt-1">Кэшбэк</span>
        </button>
      </div>
    </div>
  )
}
