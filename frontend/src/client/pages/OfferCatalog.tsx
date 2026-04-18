import { useState, useEffect, useMemo } from 'react' // v2
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { CATEGORIES } from '@/api/mockData'
import { formatCurrency, cn } from '@/lib/utils'
import OnboardingStories, { useOnboardingSeen } from '@/client/components/OnboardingStories'
import OfferCard, { OfferCardItem } from '@/client/components/OfferCard'
import PromoBanner from '@/client/components/PromoBanner'
import GachaWidget from '@/client/components/GachaWidget'
import TabBar from '@/client/components/TabBar'

interface Brand { name: string; logo_url: string | null }

interface OfferItem extends OfferCardItem {
  description: string
  status: string
  category: string | null
  partner_logo: string | null
  is_featured?: boolean
}

const catIcons: Record<string, string> = {
  'Купить продукты': '🛒',
  'Обновить гардероб': '🛍️',
  'Позаботиться о себе': '💄',
  'Поесть вне дома': '🍽️',
  'Заказать доставку': '🛵',
  'Заняться спортом': '💪',
  'Обустроить дом': '🏠',
  'Купить технику': '📱',
  'Порадовать ребёнка': '🧸',
  'Заправить авто': '⛽',
  'Отдохнуть': '✈️',
  'Подписаться': '📲',
}

type SortMode = 'best' | 'new' | 'expiring'

function normalizedRate(o: OfferCardItem): number {
  if (o.cashback_type === 'percent') return parseFloat(o.cashback_rate)
  const fixed = parseFloat(o.cashback_rate)
  const minCheck = parseFloat(o.min_check) || 1000
  return fixed / minCheck
}

export default function OfferCatalog() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()
  const [offers, setOffers] = useState<OfferItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('best')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [total, setTotal] = useState('0')
  const onboardingSeen = useOnboardingSeen()
  const [showOnboarding, setShowOnboarding] = useState(!onboardingSeen)
  const [brand, setBrand] = useState<Brand>({ name: 'Med', logo_url: null })

  useEffect(() => {
    api.get<Brand>('/client/brand').then(b => { if (b?.name) setBrand(b) }).catch(() => {})
  }, [])

  const fetchOffers = () => {
    if (!phoneHash) return
    setLoading(true)
    setError(false)
    Promise.all([
      api.get<OfferItem[]>(`/client/${phoneHash}/offers`),
      api.get<{ total: string }>(`/client/${phoneHash}/cashback/total`).catch(() => ({ total: '0' })),
    ])
      .then(([data, t]) => {
        setOffers(Array.isArray(data) ? data : [])
        setTotal(t.total)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(fetchOffers, [phoneHash])

  // Auto-refresh when admin edits an offer (cross-tab or same-tab)
  useEffect(() => {
    const handler = () => fetchOffers()
    window.addEventListener('clo-mock-store-changed', handler)
    return () => window.removeEventListener('clo-mock-store-changed', handler)
  }, [phoneHash]) // eslint-disable-line react-hooks/exhaustive-deps

  const activatedIds = useMemo(() => {
    try { return new Set<string>(JSON.parse(localStorage.getItem('clo_activated') || '[]')) }
    catch { return new Set<string>() }
  }, [offers])

  const activeOffers = useMemo(() => offers.filter(o => o.status !== 'draft'), [offers])

  const myActivations = useMemo(() =>
    activeOffers.filter(o => activatedIds.has(o.id)).slice(0, 6)
  , [activeOffers, activatedIds])

  // Featured offers (admin-flagged or top by rate)
  const featuredOffers = useMemo(() => {
    const flagged = activeOffers.filter(o => o.is_featured)
    if (flagged.length > 0) return flagged.slice(0, 5)
    if (activeOffers.length === 0) return []
    return [...activeOffers].sort((a, b) => normalizedRate(b) - normalizedRate(a)).slice(0, 1)
  }, [activeOffers])

  // Top picks: next 4 after featured, diverse categories
  const topPicks = useMemo(() => {
    const featuredIds = new Set(featuredOffers.map(o => o.id))
    const seen = new Set<string>(featuredOffers.map(o => o.category || ''))
    return activeOffers
      .filter(o => !featuredIds.has(o.id))
      .sort((a, b) => normalizedRate(b) - normalizedRate(a))
      .filter(o => {
        const cat = o.category || ''
        if (seen.has(cat)) return false
        seen.add(cat)
        return true
      })
      .slice(0, 4)
  }, [activeOffers, featuredOffers])

  // "Скоро закончатся" — offers ending within 14 days
  const expiringSoon = useMemo(() => {
    const now = Date.now()
    return activeOffers
      .filter(o => {
        const days = (new Date(o.end_date).getTime() - now) / 86400000
        return days > 0 && days <= 14
      })
      .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
      .slice(0, 3)
  }, [activeOffers])

  // Featured food collection (horizontal scroll with tall cards)
  const featuredFood = useMemo(() =>
    activeOffers.filter(o => o.category === 'Поесть вне дома').slice(0, 5)
  , [activeOffers])

  // "Новинки"
  const newArrivals = useMemo(() =>
    [...activeOffers]
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
      .slice(0, 3)
  , [activeOffers])

  // Categories with counts for compact grid
  const categoriesWithCounts = useMemo(() =>
    CATEGORIES.map(cat => ({
      name: cat,
      icon: catIcons[cat] || '🏷️',
      count: activeOffers.filter(o => o.category === cat).length,
    })).filter(c => c.count > 0)
  , [activeOffers])

  const filtered = useMemo(() => {
    if (!search && !activeCategory) return null
    let r = activeOffers
    if (activeCategory) r = r.filter(o => o.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(o =>
        o.partner_name.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        (o.category || '').toLowerCase().includes(q)
      )
    }
    if (sortMode === 'best') r = [...r].sort((a, b) => normalizedRate(b) - normalizedRate(a))
    else if (sortMode === 'new') r = [...r].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    else if (sortMode === 'expiring') r = [...r].sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
    return r
  }, [activeOffers, activeCategory, search, sortMode])

  const isHome = !search && !activeCategory

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      {showOnboarding && <OnboardingStories onComplete={() => setShowOnboarding(false)} />}

      {/* Header */}
      <div className="bg-white px-5 pt-[max(52px,env(safe-area-inset-top,52px))] pb-3 border-b border-[#F0F0F0]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EDE9FE] to-[#C4B5FD]" />
            <h1 className="text-[24px] font-extrabold text-[#1C1917] tracking-[-0.03em] leading-none">{brand.name}</h1>
          </div>
          <button
            onClick={() => navigate(`/client/${phoneHash}/cashback`)}
            className="rounded-2xl px-3.5 py-2 press-scale"
            style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 50%, #C4B5FD 100%)' }}
            aria-label="Мой кэшбэк"
          >
            <p className="font-mono-cash text-[15px] font-extrabold text-[#5B21B6] leading-none">{formatCurrency(total)}</p>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); if (e.target.value) setActiveCategory(null) }}
            placeholder="Найти партнёра или категорию"
            className="w-full pl-10 pr-10 py-2.5 bg-[#F5F6F8] text-[#1C1917] placeholder-[#9CA3AF] rounded-xl text-[16px] font-medium focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 transition-all"
            aria-label="Поиск"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#E5E7EB] flex items-center justify-center" aria-label="Очистить">
              <svg className="w-3 h-3 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* Promo banner above categories */}
      {phoneHash && !search && !activeCategory && <PromoBanner phoneHash={phoneHash} />}

      {/* Category chips */}
      <div className="px-5 pt-3 pb-4 overflow-x-auto no-scrollbar bg-[#F5F6F8]">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => { setActiveCategory(null); setSearch('') }}
            className={cn(
              'px-4 py-2 rounded-full text-[13px] font-semibold shrink-0 press-scale transition-all',
              !activeCategory
                ? 'bg-[#0A0A0C] text-white'
                : 'bg-white text-[#6B7280] border border-[#E5E7EB]'
            )}
          >
            Все
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSearch('') }}
              className={cn(
                'px-4 py-2 rounded-full text-[13px] font-semibold shrink-0 press-scale transition-all whitespace-nowrap',
                activeCategory === cat
                  ? 'bg-[#0A0A0C] text-white'
                  : 'bg-white text-[#6B7280] border border-[#E5E7EB]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <div className="w-10 h-10 border-[3px] border-[#FFDC00] border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] text-[#6B7280] font-medium">Загружаем офферы…</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 px-5">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[14px] text-[#0A0A0C] font-bold">Не удалось загрузить</p>
          <p className="text-[13px] text-[#6B7280] mt-1 font-medium">Проверьте интернет</p>
          <button onClick={fetchOffers} className="mt-4 px-5 py-2.5 rounded-full bg-[#0A0A0C] text-white font-bold text-[13px] press-scale shadow-card">Повторить</button>
        </div>
      ) : isHome ? (
        <div className="pb-28">
          {/* ═══ FEATURED OFFERS — swipeable ═══ */}
          {featuredOffers.length > 0 && phoneHash && (
            <div className="mb-6">
              {featuredOffers.length === 1 ? (
                <div className="px-5">
                  <OfferCard offer={featuredOffers[0]} phoneHash={phoneHash} variant="hero" />
                </div>
              ) : (
                <div className="px-5 overflow-x-auto no-scrollbar snap-x snap-mandatory">
                  <div className="flex gap-4">
                    {featuredOffers.map(o => (
                      <div key={o.id} className="snap-start shrink-0 w-[85vw] max-w-[380px]">
                        <OfferCard offer={o} phoneHash={phoneHash} variant="hero" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ МОИ АКТИВАЦИИ — compact pill list ═══ */}
          {myActivations.length > 0 && phoneHash && (
            <div className="mb-6">
              <div className="px-5 flex items-baseline justify-between mb-3">
                <h2 className="text-[17px] font-bold text-[#0A0A0C] tracking-[-0.02em]">Мои активации</h2>
                <span className="text-[12px] text-[#9CA3AF] font-medium">{myActivations.length}</span>
              </div>
              <div className="pl-5 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 pr-5">
                  {myActivations.map(o => <OfferCard key={o.id} offer={o} phoneHash={phoneHash} variant="compact" />)}
                </div>
              </div>
            </div>
          )}

          {/* ═══ TOP PICKS — 4 cards 2x2 grid ═══ */}
          {topPicks.length > 0 && phoneHash && (
            <div className="px-5 mb-6">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-[17px] font-bold text-[#0A0A0C] tracking-[-0.02em]">Для вас</h2>
                <span className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-[0.1em]">Лучшее</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {topPicks.map(o => <OfferCard key={o.id} offer={o} phoneHash={phoneHash} variant="grid" />)}
              </div>
            </div>
          )}

          {/* ═══ GACHA DROP ═══ */}
          {phoneHash && <GachaWidget phoneHash={phoneHash} />}

          {/* ═══ СКОРО ЗАКОНЧАТСЯ — vertical list ═══ */}
          {expiringSoon.length > 0 && phoneHash && (
            <div className="px-5 mb-6">
              <div className="flex items-baseline justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <h2 className="text-[17px] font-bold text-[#0A0A0C] tracking-[-0.02em]">Скоро закончатся</h2>
                </div>
                <button
                  onClick={() => { setSortMode('expiring'); setActiveCategory(null); window.scrollTo(0, 0) }}
                  className="text-[12px] font-bold text-[#6B7280] press-scale"
                >
                  Все →
                </button>
              </div>
              <div className="space-y-2.5">
                {expiringSoon.map(o => <OfferCard key={o.id} offer={o} phoneHash={phoneHash} variant="list" />)}
              </div>
            </div>
          )}

          {/* ═══ FEATURED FOOD — horizontal tall cards ═══ */}
          {featuredFood.length > 0 && phoneHash && (
            <div className="mb-6">
              <div className="px-5 flex items-baseline justify-between mb-3">
                <h2 className="text-[17px] font-bold text-[#0A0A0C] tracking-[-0.02em]">Поесть вне дома</h2>
                <button
                  onClick={() => { setActiveCategory('Поесть вне дома'); window.scrollTo(0, 0) }}
                  className="text-[12px] font-bold text-[#6B7280] press-scale"
                >
                  Все →
                </button>
              </div>
              <div className="pl-5 overflow-x-auto no-scrollbar">
                <div className="flex gap-3 pr-5">
                  {featuredFood.map(o => <OfferCard key={o.id} offer={o} phoneHash={phoneHash} variant="tall" />)}
                </div>
              </div>
            </div>
          )}

          {/* ═══ НОВИНКИ — list ═══ */}
          {newArrivals.length > 0 && phoneHash && (
            <div className="px-5 mb-6">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-[17px] font-bold text-[#0A0A0C] tracking-[-0.02em]">Новинки</h2>
                <button
                  onClick={() => { setSortMode('new'); setActiveCategory(null); window.scrollTo(0, 0) }}
                  className="text-[12px] font-bold text-[#6B7280] press-scale"
                >
                  Все →
                </button>
              </div>
              <div className="space-y-2.5">
                {newArrivals.map(o => <OfferCard key={o.id} offer={o} phoneHash={phoneHash} variant="list" />)}
              </div>
            </div>
          )}

          {/* ═══ ALL CATEGORIES ═══ */}
          <div className="px-5 mt-6">
            <h2 className="text-[17px] font-bold text-[#0A0A0C] tracking-[-0.02em] mb-3">Все категории</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {categoriesWithCounts.map(c => (
                <button
                  key={c.name}
                  onClick={() => { setActiveCategory(c.name); window.scrollTo(0, 0) }}
                  className="bg-white rounded-[18px] p-4 text-left press-scale shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <span className="text-[26px]">{c.icon}</span>
                  <p className="text-[13px] font-bold text-[#0A0A0C] mt-2.5 leading-tight tracking-[-0.01em]">{c.name}</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5 font-medium">{c.count} офферов</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ═══ FILTERED VIEW ═══ */
        <div className="px-5 pb-28">
          <div className="flex items-center justify-between mt-2 mb-3">
            <h2 className="text-[22px] font-extrabold text-[#0A0A0C] tracking-[-0.03em]">
              {activeCategory || 'Результаты'}
            </h2>
            <p className="text-[13px] text-[#9CA3AF] font-medium">{filtered?.length || 0}</p>
          </div>

          {filtered && filtered.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
              {([
                { key: 'best' as SortMode, label: 'Лучший кэшбэк' },
                { key: 'new' as SortMode, label: 'Новые' },
                { key: 'expiring' as SortMode, label: 'Скоро закончатся' },
              ]).map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSortMode(opt.key)}
                  className={cn(
                    'px-3.5 py-2 rounded-full text-[12px] font-bold shrink-0 press-scale transition-all',
                    sortMode === opt.key
                      ? 'bg-[#0A0A0C] text-white shadow-card'
                      : 'bg-white text-[#6B7280] shadow-card'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {filtered && filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[14px] text-[#0A0A0C] font-bold">{search ? 'Ничего не найдено' : 'Нет офферов'}</p>
              {search && <button onClick={() => setSearch('')} className="text-[13px] text-[#D97706] font-bold mt-3">Сбросить</button>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 animate-stagger">
              {(filtered || []).map(o => (
                <OfferCard key={o.id} offer={o} phoneHash={phoneHash || ''} variant="grid" />
              ))}
            </div>
          )}
        </div>
      )}

      <TabBar active="home" />
    </div>
  )
}
