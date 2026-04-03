import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { CATEGORIES } from '@/api/mockData'
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

// Category icons (emoji-style for clean mobile look)
const categoryIcons: Record<string, string> = {
  'Продуктовые сети': '🛒',
  'Товары для дома / DIY': '🔨',
  'Одежда / обувь': '👚',
  'Косметика / уход': '✨',
  'Спорт / outdoor': '⚽',
  'QSR / фастфуд': '🍔',
  'Кофейни': '☕',
  'Casual / fine dining': '🍽',
  'Доставка еды': '🛵',
  'Электроника / техника': '📱',
  'Товары для детей': '🧸',
  'Книги / хобби / подписки': '📚',
  'АЗС / топливо': '⛽',
  'Отели / авиабилеты': '✈',
  'Кино / развлечения / фитнес': '🎬',
  'Локальные сети / франшизы': '🏪',
  'Сервисы': '🔧',
  'Онлайн-сервисы / SaaS': '💻',
}

// Partner avatar colors based on first letter
const avatarColors = [
  'bg-rose-100 text-rose-600',
  'bg-sky-100 text-sky-600',
  'bg-amber-100 text-amber-600',
  'bg-emerald-100 text-emerald-600',
  'bg-violet-100 text-violet-600',
  'bg-fuchsia-100 text-fuchsia-600',
  'bg-cyan-100 text-cyan-600',
  'bg-orange-100 text-orange-600',
]
function getAvatarColor(name: string) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length]
}

export default function OfferCatalog() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()
  const [offers, setOffers] = useState<OfferItem[]>([])
  const [category, setCategory] = useState('Все')
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [sort, setSort] = useState<'cashback' | 'new'>('cashback')
  const [loading, setLoading] = useState(true)
  const [showAllCategories, setShowAllCategories] = useState(false)

  useEffect(() => {
    if (!phoneHash) return
    setLoading(true)
    api.get<OfferItem[]>(`/client/${phoneHash}/offers`, { sort })
      .then(setOffers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [phoneHash, sort])

  // "Для вас" — personalized top picks: highest cashback across different categories
  const forYou = useMemo(() => {
    const seen = new Set<string>()
    return offers
      .filter(o => o.status !== 'draft')
      .sort((a, b) => {
        const rA = a.cashback_type === 'percent' ? parseFloat(a.cashback_rate) : 0.05
        const rB = b.cashback_type === 'percent' ? parseFloat(b.cashback_rate) : 0.05
        return rB - rA
      })
      .filter(o => {
        if (seen.has(o.category || '')) return false
        seen.add(o.category || '')
        return true
      })
      .slice(0, 8)
  }, [offers])

  const filtered = useMemo(() => {
    let result = offers
    if (category !== 'Все') result = result.filter(o => o.category === category)
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(o =>
        o.partner_name.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        (o.category || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [offers, category, search])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Все': offers.length }
    for (const o of offers) {
      if (o.category) counts[o.category] = (counts[o.category] || 0) + 1
    }
    return counts
  }, [offers])

  const formatRate = (o: OfferItem) =>
    o.cashback_type === 'percent'
      ? `${(parseFloat(o.cashback_rate) * 100).toFixed(0)}%`
      : `${parseFloat(o.cashback_rate).toFixed(0)} ₽`

  const showMainContent = !search && category === 'Все'

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* ===== Header ===== */}
      <div className="bg-gradient-to-b from-beeline-black to-[#2a2a2a] text-white px-5 pt-14 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-beeline-yellow rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <span className="text-[11px] font-extrabold text-beeline-black tracking-tight">CLO</span>
            </div>
            <div>
              <p className="text-[15px] font-semibold leading-tight">Подарки и акции</p>
              <p className="text-[11px] text-gray-400 leading-tight">Билайн × НСПК</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/client/${phoneHash}/cashback`)}
            className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-beeline-yellow rounded-full text-[9px] font-bold text-beeline-black flex items-center justify-center">7</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            placeholder="Поиск партнёра или категории..."
            className="w-full pl-11 pr-10 py-3 bg-white/[0.08] text-white placeholder-gray-500 rounded-2xl text-[14px] focus:outline-none focus:bg-white/[0.14] focus:ring-1 focus:ring-beeline-yellow/50 border border-white/[0.06] transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ===== "Для вас" Section — only on main screen ===== */}
      {showMainContent && !loading && (
        <div className="pt-5 pb-1">
          <div className="px-5 flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold text-beeline-black">Для вас</h2>
            <span className="text-[12px] text-beeline-gray">Персональные предложения</span>
          </div>
          <div className="pl-5 overflow-x-auto scrollbar-none">
            <div className="flex gap-3 pr-5">
              {forYou.map(offer => (
                <button
                  key={offer.id}
                  onClick={() => navigate(`/client/${phoneHash}/offer/${offer.id}`)}
                  className="flex-shrink-0 w-[156px] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/80 hover:shadow-md transition-shadow active:scale-[0.98]"
                >
                  {/* Gradient top */}
                  <div className="h-[72px] bg-gradient-to-br from-beeline-yellow/90 via-brand-600/80 to-brand-800/70 flex items-center justify-center relative">
                    <span className="text-[28px] font-extrabold text-white drop-shadow-sm">
                      {formatRate(offer)}
                    </span>
                    <span className="absolute top-2 right-2 text-[10px] bg-white/25 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                      {(offer.category || '').split(' / ')[0].split(' ')[0]}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-[13px] font-semibold text-beeline-black leading-tight line-clamp-2">{offer.partner_name}</p>
                    <p className="text-[11px] text-beeline-gray mt-1 line-clamp-1">от {parseFloat(offer.min_check).toFixed(0)} ₽</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== Categories — marketplace style: top 3 + expand ===== */}
      {showMainContent && !loading && (() => {
        const sorted = [...CATEGORIES].sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0))
        const topCategories = sorted.slice(0, 3)
        const restCategories = sorted.slice(3)
        return (
          <div className="px-5 pt-5 pb-2">
            {/* Top 3 — large horizontal cards */}
            <div className="flex gap-2.5 mb-2.5">
              {topCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="flex-1 bg-white rounded-2xl border border-gray-100/80 p-3 text-center hover:border-beeline-yellow/50 hover:shadow-sm transition-all active:scale-[0.97]"
                >
                  <span className="text-[28px] block">{categoryIcons[cat] || ''}</span>
                  <p className="text-[11px] font-semibold text-beeline-dark mt-1.5 leading-tight">{cat.split(' / ')[0]}</p>
                  <p className="text-[10px] text-beeline-gray mt-0.5">{categoryCounts[cat] || 0} {'офферов'}</p>
                </button>
              ))}
            </div>

            {/* Expand/collapse rest */}
            {!showAllCategories ? (
              <button
                onClick={() => setShowAllCategories(true)}
                className="w-full py-2.5 rounded-2xl bg-white border border-gray-100/80 text-[12px] font-medium text-beeline-gray hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
              >
                {'Все категории'}
                <span className="text-beeline-gray/60">({CATEGORIES.length})</span>
                <svg className="w-3.5 h-3.5 text-beeline-gray/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {restCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-white border border-gray-100/80 hover:border-beeline-yellow/50 transition-all active:scale-[0.96]"
                    >
                      <span className="text-[18px] leading-none">{categoryIcons[cat] || ''}</span>
                      <span className="text-[9px] text-beeline-dark font-medium text-center leading-tight line-clamp-2">{cat.split(' / ')[0]}</span>
                      <span className="text-[8px] text-beeline-gray">{categoryCounts[cat] || 0}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowAllCategories(false)}
                  className="w-full py-2 mt-2 rounded-xl text-[11px] font-medium text-beeline-gray hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                >
                  {'Свернуть'}
                  <svg className="w-3 h-3 text-beeline-gray/60 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )
      })()}

      {/* ===== Category filter chips — when browsing a category ===== */}
      {!showMainContent && (
        <div className="px-4 pt-3 pb-1 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => { setCategory('Все'); setSearch('') }}
              className="px-3.5 py-1.5 rounded-full text-[12px] font-medium bg-beeline-black text-white"
            >
              ← Все
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all',
                  category === c
                    ? 'bg-beeline-yellow text-beeline-black shadow-sm'
                    : 'bg-white text-beeline-gray border border-gray-200'
                )}
              >
                {categoryIcons[c] || ''} {c.split(' / ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== All offers section ===== */}
      <div className="px-5 pt-4 pb-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold text-beeline-black">
            {showMainContent ? 'Все офферы' : category !== 'Все' ? `${categoryIcons[category] || ''} ${category}` : `Результаты`}
          </h2>
          <div className="flex items-center gap-1.5 bg-white rounded-full px-2 py-1 border border-gray-100">
            <button
              onClick={() => setSort('cashback')}
              className={cn('text-[11px] px-2 py-0.5 rounded-full transition-colors', sort === 'cashback' ? 'bg-beeline-yellow text-beeline-black font-semibold' : 'text-beeline-gray')}
            >
              Кэшбэк
            </button>
            <button
              onClick={() => setSort('new')}
              className={cn('text-[11px] px-2 py-0.5 rounded-full transition-colors', sort === 'new' ? 'bg-beeline-yellow text-beeline-black font-semibold' : 'text-beeline-gray')}
            >
              Новые
            </button>
          </div>
        </div>
        {!showMainContent && (
          <p className="text-[12px] text-beeline-gray -mt-1.5 mb-3">
            {filtered.length} {filtered.length === 1 ? 'оффер' : 'офферов'}
          </p>
        )}
      </div>

      {/* ===== Offer Cards ===== */}
      <div className="px-5 space-y-2.5 pb-28">
        {loading ? (
          <div className="flex flex-col items-center py-16">
            <div className="w-10 h-10 border-3 border-beeline-yellow border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] text-beeline-gray mt-4">Загрузка офферов...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-[14px] text-beeline-dark font-medium">
              {search ? `Ничего не найдено` : 'Нет офферов'}
            </p>
            {search && (
              <>
                <p className="text-[12px] text-beeline-gray mt-1">По запросу «{search}»</p>
                <button onClick={() => setSearch('')} className="text-[13px] text-blue-600 font-medium mt-3">Сбросить поиск</button>
              </>
            )}
          </div>
        ) : (
          filtered.map(offer => (
            <button
              key={offer.id}
              onClick={() => navigate(`/client/${phoneHash}/offer/${offer.id}`)}
              className="w-full bg-white rounded-2xl p-4 text-left shadow-sm border border-gray-100/60 hover:shadow-md transition-all active:scale-[0.99] flex items-center gap-3.5"
            >
              {/* Avatar */}
              <div className={cn('w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 text-[18px] font-bold', getAvatarColor(offer.partner_name))}>
                {offer.partner_name[0]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[14px] font-semibold text-beeline-black truncate">{offer.partner_name}</p>
                  {offer.category && (
                    <span className="text-[13px] shrink-0">{categoryIcons[offer.category] || ''}</span>
                  )}
                </div>
                <p className="text-[12px] text-beeline-gray mt-0.5 truncate">{offer.name}</p>
              </div>

              {/* Cashback badge */}
              <div className="shrink-0 bg-beeline-yellow/10 rounded-xl px-3 py-2 text-center">
                <p className="text-[16px] font-bold text-brand-800 leading-none">{formatRate(offer)}</p>
                <p className="text-[10px] text-beeline-gray mt-1">от {parseFloat(offer.min_check).toFixed(0)}₽</p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* ===== Bottom Tab Bar ===== */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 px-4 pb-[env(safe-area-inset-bottom,8px)] pt-2">
        <div className="flex justify-around max-w-md mx-auto">
          <button className="flex flex-col items-center py-1 px-3 relative">
            <svg className="w-6 h-6 text-beeline-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <span className="text-[10px] font-semibold text-beeline-black mt-0.5">Офферы</span>
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-beeline-yellow rounded-full" />
          </button>
          <button
            onClick={() => navigate(`/client/${phoneHash}/cashback`)}
            className="flex flex-col items-center py-1 px-3"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] text-gray-400 mt-0.5">Кэшбэк</span>
          </button>
        </div>
      </div>
    </div>
  )
}
