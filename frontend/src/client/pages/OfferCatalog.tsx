import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface OfferItem {
  id: string
  partner_name: string
  partner_logo: string | null
  name: string
  description: string
  image_url: string | null
  cashback_type: string
  cashback_rate: string
  min_check: string
  max_cashback_per_tx: string
  start_date: string
  end_date: string
  status: string
  category: string | null
}

const categories = ['Все', 'Продукты', 'Рестораны', 'Одежда']
const statusMap: Record<string, { label: string; variant: 'info' | 'success' | 'warning' }> = {
  new: { label: 'Новый', variant: 'info' },
  activated: { label: 'Активирован', variant: 'success' },
  cashback_received: { label: 'Кэшбэк получен', variant: 'warning' },
}

export default function OfferCatalog() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()
  const [offers, setOffers] = useState<OfferItem[]>([])
  const [category, setCategory] = useState('Все')
  const [sort, setSort] = useState<'cashback' | 'new'>('cashback')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!phoneHash) return
    setLoading(true)
    api
      .get<OfferItem[]>(`/client/${phoneHash}/offers`, { sort })
      .then(setOffers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [phoneHash, sort])

  const filtered =
    category === 'Все'
      ? offers
      : offers.filter((o) => o.category === category)

  const formatRate = (o: OfferItem) =>
    o.cashback_type === 'percent'
      ? `до ${(parseFloat(o.cashback_rate) * 100).toFixed(0)}%`
      : `${parseFloat(o.cashback_rate).toFixed(0)} ₽`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-beeline-black text-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-beeline-yellow rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-beeline-black">CLO</span>
          </div>
          <span className="text-sm text-gray-400">Билайн</span>
        </div>
        <h1 className="text-2xl font-bold mt-2">Подарки и акции</h1>
        <p className="text-gray-400 text-sm mt-1">Кэшбэк за покупки через СБП</p>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              category === c
                ? 'bg-beeline-yellow text-beeline-black'
                : 'bg-white text-beeline-gray border border-gray-200'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="px-4 flex gap-2 mb-3">
        <button
          onClick={() => setSort('cashback')}
          className={cn('text-xs', sort === 'cashback' ? 'font-bold text-beeline-black' : 'text-beeline-gray')}
        >
          По кэшбэку
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => setSort('new')}
          className={cn('text-xs', sort === 'new' ? 'font-bold text-beeline-black' : 'text-beeline-gray')}
        >
          По новизне
        </button>
      </div>

      {/* Offers */}
      <div className="px-4 space-y-3 pb-24">
        {loading ? (
          <div className="text-center py-12 text-beeline-gray">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-beeline-gray">Нет доступных офферов</div>
        ) : (
          filtered.map((offer) => {
            const st = statusMap[offer.status] || statusMap.new
            return (
              <button
                key={offer.id}
                onClick={() => navigate(`/client/${phoneHash}/offer/${offer.id}`)}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    {offer.partner_logo ? (
                      <img src={offer.partner_logo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-beeline-gray">
                        {offer.partner_name[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-beeline-black text-sm">{offer.name}</p>
                        <p className="text-xs text-beeline-gray mt-0.5">{offer.partner_name}</p>
                      </div>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-lg font-bold text-brand-800">
                        {formatRate(offer)}
                      </span>
                      <span className="text-xs text-beeline-gray">
                        от {parseFloat(offer.min_check).toFixed(0)} ₽
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around">
        <button className="flex flex-col items-center text-beeline-black">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <span className="text-xs font-medium mt-1">Офферы</span>
        </button>
        <button
          onClick={() => navigate(`/client/${phoneHash}/cashback`)}
          className="flex flex-col items-center text-beeline-gray"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs mt-1">Кэшбэк</span>
        </button>
      </div>
    </div>
  )
}
