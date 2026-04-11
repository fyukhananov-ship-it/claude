import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { CATEGORIES } from '@/api/mockData'
import { formatCurrency, cn } from '@/lib/utils'
import OnboardingStories, { useOnboardingSeen } from '@/client/components/OnboardingStories'
import ArticlesWidget from '@/client/components/ArticlesWidget'
import OfferCard, { OfferCardItem } from '@/client/components/OfferCard'
import TabBar from '@/client/components/TabBar'

interface OfferItem extends OfferCardItem {
  description: string
  status: string
  category: string | null
  partner_logo: string | null
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

  // Single hero: highest normalized rate
  const heroOffer = useMemo(() => {
    if (activeOffers.length === 0) return null
    return [...activeOffers].sort((a, b) => normalizedRate(b) - normalizedRate(a))[0]
  }, [activeOffers])

  // Top picks: next 4 after hero, diverse categories
  const topPicks = useMemo(() => {
    if (!heroOffer) return []
    const seen = new Set<string>([heroOffer.category || ''])
    return activeOffers
      .filter(o => o.id !== heroOffer.id)
      .sort((a, b) => normalizedRate(b) - normalizedRate(a))
      .filter(o => {
        const cat = o.category || ''
        if (seen.has(cat)) return false
        seen.add(cat)
        return true
      })
      .slice(0, 4)
  }, [activeOffers, heroOffer])

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
      <div className="bg-dark-hero relative text-white px-5 pt-[max(52px,env(safe-area-inset-top,52px))] pb-6">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-[#FFDC00] rounded-2xl flex items-center justify-center">
                <span className="text-[11px] font-extrabold text-[#0A0A0C] tracking-wide">CLO</span>
              </div>
              <div>
                <p className="text-[17px] font-bold tracking-[-0.02em] leading-tight">Подарки и акции</p>
                <p className="text-[12px] text-white/55 font-medium mt-0.5">Билайн × НСПК</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/client/${phoneHash}/cashback`)}
              className="bg-white/[0.07] border border-white/[0.08] rounded-2xl px-3.5 py-2.5 press-scale backdrop-blur-sm"
              aria-label="Мой кэшбэк"
            >
              <p className="text-[9px] text-white/50 font-bold uppercase tracking-[0.12em]">Кэшбэк</p>
              <p className="font-mono-cash text-[15px] font-extrabold text-[#FFDC00] leading-none mt-1">{formatCurrency(total)}</p>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-white/35" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); if (e.target.value) setActiveCategory(null) }}
              placeholder="Партнёр или категория"
              className="w-full pl-11 pr-10 py-3 bg-white/[0.07] text-white placeholder-white/35 rounded-2xl text-[16px] font-medium focus:outline-none focus:bg-white/[0.11] focus:ring-1 focus:ring-[#FFDC00]/40 border border-white/[0.06] backdrop-blur-sm transition-all"
              aria-label="Поиск"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center" aria-label="Очистить">
                <svg className="w-3.5 h-3.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Compact chip categories */}
      <div className="px-5 py-4 overflow-x-auto no-scrollbar bg-[#F5F6F8]">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => { setActiveCategory(null); setSearch('') }}
            className={cn(
              'px-4 py-2 rounded-full text-[13px] font-bold shrink-0 press-scale transition-all',
              !activeCategory
                ? 'bg-[#0A0A0C] text-white shadow-card'
                : 'bg-white text-[#6B7280] shadow-card'
            )}
          >
            ⭐ Все
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSearch('') }}
              className={cn(
                'px-4 py-2 rounded-full text-[13px] font-bold shrink-0 press-scale transition-all whitespace-nowrap',
                activeCategory === cat
                  ? 'bg-[#FFDC00] text-[#0A0A0C] shadow-card'
                  : 'bg-white text-[#6B7280] shadow-card'
              )}
            >
              <span className="mr-1.5">{catIcons[cat]}</span>
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
          {/* ═══ HERO SPOTLIGHT — Offer of the day ═══ */}
          {heroOffer && phoneHash && (
            <div className="px-5 mb-6">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-[0.14em]">★ Топ оффер</h2>
                <span className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-[0.1em]">Сегодня</span>
              </div>
              <OfferCard offer={heroOffer} phoneHash={phoneHash} variant="hero" />
            </div>
          )}

          {/* ═══ МОИ АКТИВАЦИИ — compact pill list ═══ */}
          {myActivations.length > 0 && phoneHash && (
            <div className="mb-6">
              <div className="px-5 flex items-baseline justify-between mb-3">
                <h2 className="text-[18px] font-extrabold text-[#0A0A0C] tracking-[-0.02em]">Мои активации</h2>
                <span className="text-[12px] text-[#9CA3AF] font-bold">{myActivations.length}</span>
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
                <h2 className="text-[18px] font-extrabold text-[#0A0A0C] tracking-[-0.02em]">Для вас</h2>
                <span className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-[0.1em]">Лучшее</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {topPicks.map(o => <OfferCard key={o.id} offer={o} phoneHash={phoneHash} variant="grid" />)}
              </div>
            </div>
          )}

          {/* ═══ SLOT MACHINE BANNER ═══ */}
          <div className="px-5 mb-6">
            {(() => {
              let slotResult: { partner: string; rate: string; color: string; desc: string } | null = null
              try { const raw = localStorage.getItem('clo_slot_result'); if (raw) slotResult = JSON.parse(raw) } catch {}

              return slotResult ? (
                <button onClick={() => navigate(`/client/${phoneHash}/spin/offer-1`)}
                  className="w-full relative rounded-[22px] p-5 press-scale overflow-hidden text-left shadow-float"
                  style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}>
                  <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.14em]">Ваш выигрыш</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-mono-cash text-[28px] font-extrabold text-white leading-none">{slotResult.rate}</span>
                        <span className="text-[14px] font-bold text-white/90 truncate">{slotResult.partner}</span>
                      </div>
                      <p className="text-[12px] text-white/55 mt-1.5 font-medium">Нажмите, чтобы крутить снова</p>
                    </div>
                  </div>
                </button>
              ) : (
                <button onClick={() => navigate(`/client/${phoneHash}/spin/offer-1`)}
                  className="w-full bg-dark-hero relative rounded-[22px] p-5 press-scale overflow-hidden text-left shadow-float">
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#FFDC00] flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-[#0A0A0C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-extrabold text-white tracking-[-0.01em]">Испытайте удачу</p>
                      <p className="text-[12px] text-white/60 mt-0.5 font-medium">Кэшбэк до 30% за один спин</p>
                    </div>
                    <svg className="w-5 h-5 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              )
            })()}
          </div>

          {/* ═══ СКОРО ЗАКОНЧАТСЯ — vertical list ═══ */}
          {expiringSoon.length > 0 && phoneHash && (
            <div className="px-5 mb-6">
              <div className="flex items-baseline justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <h2 className="text-[18px] font-extrabold text-[#0A0A0C] tracking-[-0.02em]">Скоро закончатся</h2>
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
                <h2 className="text-[18px] font-extrabold text-[#0A0A0C] tracking-[-0.02em]">Поесть вне дома</h2>
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
                <h2 className="text-[18px] font-extrabold text-[#0A0A0C] tracking-[-0.02em]">Новинки</h2>
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

          {/* ═══ ARTICLES ═══ */}
          {phoneHash && <ArticlesWidget phoneHash={phoneHash} />}

          {/* ═══ ALL CATEGORIES ═══ */}
          <div className="px-5 mt-6">
            <h2 className="text-[18px] font-extrabold text-[#0A0A0C] tracking-[-0.02em] mb-3">Все категории</h2>
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

      <TabBar active="offers" />
    </div>
  )
}
