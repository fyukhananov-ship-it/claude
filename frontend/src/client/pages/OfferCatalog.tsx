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
  max_cashback_per_client?: string
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

const catImages: Record<string, string> = {
  'Купить продукты': '/claude/assets/categories/купить-продукты.jpg',
}

type SortMode = 'best' | 'new' | 'expiring'

// Normalized comparable rate: percent as-is, fixed → approximate % based on min_check
function normalizedRate(o: OfferCardItem): number {
  if (o.cashback_type === 'percent') return parseFloat(o.cashback_rate)
  const fixed = parseFloat(o.cashback_rate)
  const minCheck = parseFloat(o.min_check) || 1000
  return fixed / minCheck // e.g. 300₽ / 1000₽ = 0.3 = 30%
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

  // Load activated offer ids from localStorage
  const activatedIds = useMemo(() => {
    try { return new Set<string>(JSON.parse(localStorage.getItem('clo_activated') || '[]')) }
    catch { return new Set<string>() }
  }, [offers])

  const myActivations = useMemo(() =>
    offers.filter(o => activatedIds.has(o.id)).slice(0, 6)
  , [offers, activatedIds])

  // Fix: normalize fixed vs percent for fair comparison
  const forYou = useMemo(() => {
    const seen = new Set<string>()
    return offers
      .filter(o => o.status !== 'draft')
      .sort((a, b) => normalizedRate(b) - normalizedRate(a))
      .filter(o => { if (seen.has(o.category || '')) return false; seen.add(o.category || ''); return true })
      .slice(0, 6)
  }, [offers])

  const collections = useMemo(() =>
    CATEGORIES.map(cat => ({
      name: cat,
      icon: catIcons[cat] || '',
      offers: offers.filter(o => o.category === cat && o.status !== 'draft'),
    })).filter(c => c.offers.length > 0)
  , [offers])

  const filtered = useMemo(() => {
    if (!search && !activeCategory) return null
    let r = offers.filter(o => o.status !== 'draft')
    if (activeCategory) r = r.filter(o => o.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(o =>
        o.partner_name.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        (o.category || '').toLowerCase().includes(q)
      )
    }
    // Apply sort
    if (sortMode === 'best') r = [...r].sort((a, b) => normalizedRate(b) - normalizedRate(a))
    else if (sortMode === 'new') r = [...r].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    else if (sortMode === 'expiring') r = [...r].sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
    return r
  }, [offers, activeCategory, search, sortMode])

  const isHome = !search && !activeCategory

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {showOnboarding && <OnboardingStories onComplete={() => setShowOnboarding(false)} />}

      {/* Header */}
      <div className="bg-[#111] noise-bg relative text-white px-5 pt-[max(52px,env(safe-area-inset-top,52px))] pb-5">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFD500] rounded-2xl flex items-center justify-center shadow-[0_0_24px_rgba(255,213,0,0.3)]">
                <span className="text-[11px] font-extrabold text-[#111]">CLO</span>
              </div>
              <div>
                <p className="text-[16px] font-bold tracking-[-0.02em]">Подарки и акции</p>
                <p className="text-[12px] text-white/50 font-medium">Билайн × НСПК</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/client/${phoneHash}/cashback`)}
              className="bg-white/[0.08] border border-white/[0.06] rounded-2xl px-3 py-2 press-scale"
              aria-label="Мой кэшбэк"
            >
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.08em]">Кэшбэк</p>
              <p className="font-mono-cash text-[14px] font-extrabold text-[#FFD500] leading-none mt-0.5">{formatCurrency(total)}</p>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); if (e.target.value) setActiveCategory(null) }}
              placeholder="Найти партнёра или категорию"
              className="w-full pl-11 pr-10 py-3.5 bg-white/[0.06] text-white placeholder-white/30 rounded-2xl text-[14px] font-medium focus:outline-none focus:bg-white/[0.12] focus:ring-1 focus:ring-[#FFD500]/40 border border-white/[0.04]"
              aria-label="Поиск"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center" aria-label="Очистить">
                <svg className="w-3.5 h-3.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories strip */}
      <div className="px-4 py-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => { setActiveCategory(null); setSearch('') }}
            className={cn(
              'w-[76px] h-[76px] rounded-2xl flex flex-col items-center justify-center gap-1 shrink-0 press-scale border',
              !activeCategory ? 'bg-[#111] text-white border-[#111]' : 'bg-white text-[#666] border-[#f0f0f0]'
            )}
          >
            <span className="text-[22px]">⭐</span>
            <span className="text-[11px] font-bold">Все</span>
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSearch('') }}
              className={cn(
                'w-[76px] h-[76px] rounded-2xl shrink-0 press-scale overflow-hidden relative',
                catImages[cat]
                  ? (activeCategory === cat ? 'ring-2 ring-[#FFD500] shadow-[0_2px_12px_rgba(255,213,0,0.3)]' : '')
                  : (activeCategory === cat ? 'border border-[#FFD500] shadow-[0_2px_12px_rgba(255,213,0,0.3)]' : 'border border-[#f0f0f0]')
              )}
            >
              {catImages[cat] ? (
                <>
                  <img src={catImages[cat]} alt={cat} className="absolute inset-0 w-full h-full object-cover" />
                  {activeCategory === cat && <div className="absolute inset-0 bg-[#FFD500]/20" />}
                  <span className="absolute bottom-1 left-0.5 right-0.5 text-[10px] font-bold leading-tight text-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-2">{cat}</span>
                </>
              ) : (
                <div className={cn('w-full h-full flex flex-col items-center justify-center gap-1', activeCategory === cat ? 'bg-[#FFD500] text-[#111]' : 'bg-white text-[#666]')}>
                  <span className="text-[22px]">{catIcons[cat] || '🏷️'}</span>
                  <span className="text-[10px] font-bold leading-tight text-center line-clamp-2 px-1">{cat}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <div className="w-10 h-10 border-[3px] border-[#FFD500] border-t-transparent rounded-full animate-spin" />
          <p className="text-[12px] text-[#999] font-medium">Загружаем офферы…</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 px-5">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[14px] text-[#333] font-bold">Не удалось загрузить офферы</p>
          <p className="text-[12px] text-[#999] mt-1 font-medium">Проверьте интернет</p>
          <button onClick={fetchOffers} className="mt-4 px-5 py-2.5 rounded-2xl bg-[#111] text-white font-bold text-[13px] press-scale">Повторить</button>
        </div>
      ) : isHome ? (
        <div className="pb-28">
          {/* Мои активации */}
          {myActivations.length > 0 && (
            <div className="pt-1 pb-5">
              <div className="px-5 flex items-baseline justify-between mb-3">
                <h2 className="text-[20px] font-extrabold text-[#111] tracking-[-0.03em]">Мои активации</h2>
                <span className="text-[12px] text-[#999] font-bold">{myActivations.length}</span>
              </div>
              <div className="pl-5 overflow-x-auto no-scrollbar">
                <div className="flex gap-3 pr-5">
                  {myActivations.map(o => <OfferCard key={o.id} offer={o} phoneHash={phoneHash || ''} />)}
                </div>
              </div>
            </div>
          )}

          {/* Для вас */}
          <div className="pt-1 pb-5">
            <div className="px-5 flex items-baseline justify-between mb-3">
              <h2 className="text-[20px] font-extrabold text-[#111] tracking-[-0.03em]">Для вас</h2>
              <span className="text-[12px] text-[#999] font-bold uppercase tracking-[0.08em]">Лучшее</span>
            </div>
            <div className="pl-5 overflow-x-auto no-scrollbar">
              <div className="flex gap-3 pr-5 animate-stagger">
                {forYou.map(o => <OfferCard key={o.id} offer={o} phoneHash={phoneHash || ''} size="lg" />)}
              </div>
            </div>
          </div>

          {/* Slot machine widget */}
          <div className="px-5 mb-6">
            {(() => {
              let slotResult: { partner: string; rate: string; color: string; desc: string } | null = null
              try { const raw = localStorage.getItem('clo_slot_result'); if (raw) slotResult = JSON.parse(raw) } catch {}

              return slotResult ? (
                <button onClick={() => navigate(`/client/${phoneHash}/spin/offer-1`)}
                  className={cn('w-full relative rounded-2xl p-5 press-scale overflow-hidden text-left bg-gradient-to-br', slotResult.color)}>
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-black/5" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                      <span className="text-[22px] font-extrabold text-white">{slotResult.partner[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-white/60 uppercase tracking-[0.1em]">Ваш кэшбэк</p>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="font-mono-cash text-[28px] font-extrabold text-white leading-none">{slotResult.rate}</span>
                        <span className="text-[14px] font-bold text-white/90 truncate">{slotResult.partner}</span>
                      </div>
                      <p className="text-[12px] text-white/60 mt-1 font-medium">Нажмите, чтобы крутить снова</p>
                    </div>
                    <svg className="w-5 h-5 text-white/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ) : (
                <button onClick={() => navigate(`/client/${phoneHash}/spin/offer-1`)}
                  className="w-full bg-[#111] noise-bg relative rounded-2xl p-5 press-scale overflow-hidden text-left">
                  <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#FFD500]/[0.08]" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-purple-500/[0.06]" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFD500] to-[#F59E0B] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,213,0,0.3)]">
                      <svg className="w-7 h-7 text-[#111]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-extrabold text-white">Испытайте удачу!</p>
                      <p className="text-[12px] text-white/60 mt-0.5 font-medium">Крутите барабан и выиграйте кэшбэк до 30%</p>
                    </div>
                    <svg className="w-5 h-5 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              )
            })()}
          </div>

          {/* Collections */}
          {collections.map(col => (
            <div key={col.name} className="mb-6">
              <div className="px-5 flex items-center justify-between mb-3">
                <h2 className="text-[18px] font-extrabold text-[#111] tracking-[-0.02em]">{col.name}</h2>
                <button onClick={() => setActiveCategory(col.name)} className="text-[12px] font-bold text-[#FFD500] press-scale">
                  Все {col.offers.length} →
                </button>
              </div>
              <div className="pl-5 overflow-x-auto no-scrollbar">
                <div className="flex gap-3 pr-5">
                  {col.offers.slice(0, 6).map(o => <OfferCard key={o.id} offer={o} phoneHash={phoneHash || ''} />)}
                </div>
              </div>
            </div>
          ))}

          {/* Articles widget — moved to bottom */}
          {phoneHash && <ArticlesWidget phoneHash={phoneHash} />}
        </div>
      ) : (
        /* Filtered view */
        <div className="px-5 pb-28">
          <div className="flex items-center justify-between mt-2 mb-3">
            <h2 className="text-[20px] font-extrabold text-[#111] tracking-[-0.03em]">
              {activeCategory || 'Результаты'}
            </h2>
            <p className="text-[12px] text-[#999] font-medium">{filtered?.length || 0} офферов</p>
          </div>

          {/* Sort toggle */}
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
                    'px-3.5 py-2 rounded-full text-[12px] font-bold shrink-0 press-scale transition-colors',
                    sortMode === opt.key
                      ? 'bg-[#111] text-white'
                      : 'bg-white border border-[#e8e8ec] text-[#666]'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {filtered && filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[14px] text-[#333] font-bold">{search ? 'Ничего не найдено' : 'Нет офферов'}</p>
              {search && <button onClick={() => setSearch('')} className="text-[13px] text-[#FFD500] font-bold mt-3">Сбросить</button>}
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
