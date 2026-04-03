import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { CATEGORIES } from '@/api/mockData'
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

const statusMap: Record<string, { label: string; variant: 'info' | 'success' | 'warning' }> = {
  new: { label: 'Новый', variant: 'info' },
  activated: { label: 'Активирован', variant: 'success' },
  cashback_received: { label: 'Кэшбэк получен', variant: 'warning' },
}

const allCategories = ['Все', ...CATEGORIES] as const

export default function OfferCatalog() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()
  const [offers, setOffers] = useState<OfferItem[]>([])
  const [category, setCategory] = useState('Все')
  const [search, setSearch] = useState('')
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

  const filtered = useMemo(() => {
    let result = offers

    // Filter by category
    if (category !== 'Все') {
      result = result.filter((o) => o.category === category)
    }

    // Search by partner name or offer name
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(
        (o) =>
          o.partner_name.toLowerCase().includes(q) ||
          o.name.toLowerCase().includes(q)
      )
    }

    return result
  }, [offers, category, search])

  // Count offers per category for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Все': offers.length }
    for (const o of offers) {
      if (o.category) {
        counts[o.category] = (counts[o.category] || 0) + 1
      }
    }
    return counts
  }, [offers])

  const formatRate = (o: OfferItem) =>
    o.cashback_type === 'percent'
      ? `до ${(parseFloat(o.cashback_rate) * 100).toFixed(0)}%`
      : `${parseFloat(o.cashback_rate).toFixed(0)} ₽`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-beeline-black text-white px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-beeline-yellow rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-beeline-black">CLO</span>
          </div>
          <span className="text-sm text-gray-400">Билайн</span>
        </div>
        <h1 className="text-2xl font-bold mt-2">Подарки и акции</h1>
        <p className="text-gray-400 text-sm mt-1">Кэшбэк за покупки через СБП</p>

        {/* Search */}
        <div className="relative mt-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по партнёру или офферу..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/10 text-white placeholder-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-beeline-yellow border border-white/10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Categories — horizontal scroll */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {allCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5',
                category === c
                  ? 'bg-beeline-yellow text-beeline-black'
                  : 'bg-white text-beeline-gray border border-gray-200'
              )}
            >
              {c}
              {categoryCounts[c] ? (
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full',
                  category === c ? 'bg-beeline-black/10' : 'bg-gray-100'
                )}>
                  {categoryCounts[c]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Sort + count */}
      <div className="px-4 flex items-center justify-between mb-2">
        <span className="text-xs text-beeline-gray">{filtered.length} офферов</span>
        <div className="flex gap-2">
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
      </div>

      {/* Offers */}
      <div className="px-4 space-y-3 pb-24">
        {loading ? (
          <div className="text-center py-12 text-beeline-gray">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-beeline-gray">
              {search ? `Ничего не найдено по «${search}»` : 'Нет офферов в этой категории'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="text-sm text-blue-600 mt-2">
                Сбросить поиск
              </button>
            )}
          </div>
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
                    <span className="text-lg font-bold text-beeline-gray">
                      {offer.partner_name[0]}
                    </span>
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
                      {offer.category && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-auto">
                          {offer.category}
                        </span>
                      )}
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
