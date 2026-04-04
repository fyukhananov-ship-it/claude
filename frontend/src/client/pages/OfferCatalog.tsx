import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { CATEGORIES } from '@/api/mockData'
import { cn } from '@/lib/utils'

interface OfferItem {
  id: string; partner_name: string; partner_logo: string | null; name: string
  description: string; cashback_type: string; cashback_rate: string
  min_check: string; max_cashback_per_tx: string; start_date: string
  end_date: string; status: string; category: string | null; image_url: string | null
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

// Deterministic gradient from partner name
const grads = [
  'from-amber-400 via-orange-400 to-red-400',
  'from-rose-400 via-pink-500 to-fuchsia-500',
  'from-violet-400 via-purple-500 to-indigo-500',
  'from-sky-400 via-blue-500 to-indigo-500',
  'from-emerald-400 via-teal-500 to-cyan-500',
  'from-lime-400 via-green-500 to-emerald-500',
  'from-yellow-300 via-amber-400 to-orange-500',
  'from-pink-400 via-rose-500 to-red-500',
]
function grad(s: string) { return grads[s.charCodeAt(0) % grads.length] }

export default function OfferCatalog() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()
  const [offers, setOffers] = useState<OfferItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!phoneHash) return
    setLoading(true)
    api.get<OfferItem[]>(`/client/${phoneHash}/offers`)
      .then(data => setOffers(Array.isArray(data) ? data : []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false))
  }, [phoneHash])

  const forYou = useMemo(() => {
    const seen = new Set<string>()
    return offers.filter(o => o.status !== 'draft')
      .sort((a, b) => {
        const rA = a.cashback_type === 'percent' ? parseFloat(a.cashback_rate) : 0.05
        const rB = b.cashback_type === 'percent' ? parseFloat(b.cashback_rate) : 0.05
        return rB - rA
      })
      .filter(o => { if (seen.has(o.category || '')) return false; seen.add(o.category || ''); return true })
      .slice(0, 6)
  }, [offers])

  const collections = useMemo(() =>
    CATEGORIES.map(cat => ({
      name: cat, icon: catIcons[cat] || '', offers: offers.filter(o => o.category === cat && o.status !== 'draft'),
    })).filter(c => c.offers.length > 0)
  , [offers])

  const filtered = useMemo(() => {
    if (!search && !activeCategory) return null
    let r = offers
    if (activeCategory) r = r.filter(o => o.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(o => o.partner_name.toLowerCase().includes(q) || o.name.toLowerCase().includes(q) || (o.category || '').toLowerCase().includes(q))
    }
    return r
  }, [offers, activeCategory, search])

  const fmtRate = (o: OfferItem) => o.cashback_type === 'percent'
    ? `${(parseFloat(o.cashback_rate) * 100).toFixed(0)}%` : `${parseFloat(o.cashback_rate).toFixed(0)} \u20bd`

  const isHome = !search && !activeCategory

  // Offer image card component
  const OfferCard = ({ o, size = 'md' }: { o: OfferItem; size?: 'lg' | 'md' }) => {
    const w = size === 'lg' ? 'w-[200px]' : 'w-[170px]'
    const h = size === 'lg' ? 'h-[140px]' : 'h-[110px]'
    return (
      <button onClick={() => navigate(`/client/${phoneHash}/offer/${o.id}`)}
        className={cn('flex-shrink-0 press-scale text-left', w)}>
        {/* Image area */}
        <div className={cn('rounded-2xl overflow-hidden relative', h)}>
          {o.image_url ? (
            <img src={o.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className={cn('w-full h-full bg-gradient-to-br', grad(o.partner_name))}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[42px] font-extrabold text-white/20">{o.partner_name[0]}</span>
              </div>
            </div>
          )}
          {/* Cashback badge */}
          <div className="absolute top-2.5 left-2.5 bg-[#111]/70 backdrop-blur-md text-white px-2.5 py-1 rounded-lg">
            <span className="font-mono-cash text-[14px] font-extrabold">{fmtRate(o)}</span>
          </div>
        </div>
        {/* Info */}
        <p className="text-[13px] font-bold text-[#111] mt-2.5 leading-tight truncate">{o.partner_name}</p>
        <p className="text-[11px] text-[#999] mt-0.5 truncate">{o.name}</p>
        <p className="text-[10px] text-[#bbb] mt-0.5">{'от '}{parseFloat(o.min_check).toFixed(0)}{' \u20bd'}</p>
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
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
                <p className="text-[11px] text-white/40 font-medium">Билайн × НСПК</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Push demo bell */}
              <button onClick={async () => {
                if (!('Notification' in window)) { alert('Push-уведомления не поддерживаются в этом браузере'); return }
                const perm = await Notification.requestPermission()
                if (perm !== 'granted') { alert('Разрешите уведомления в настройках браузера'); return }
                const lenta = offers.find(o => o.partner_name === 'Лента') || offers[0]
                const offerUrl = `/claude/client/${phoneHash}/offer/${lenta?.id || 'offer-3'}`
                const reg = await navigator.serviceWorker?.ready
                if (reg) {
                  reg.showNotification('Лента: кэшбэк 7% на продукты!', {
                    body: 'Оплатите покупки через СБП и получите кэшбэк на счёт Билайн. Активируйте прямо сейчас →',
                    icon: '/claude/icons/icon-192.png',
                    badge: '/claude/icons/icon-192.png',
                    tag: 'clo-lenta',
                    renotify: true,
                    data: { url: offerUrl },
                  } as NotificationOptions)
                } else {
                  new Notification('Лента: кэшбэк 7% на продукты!', {
                    body: 'Активируйте оффер прямо сейчас →',
                    icon: '/claude/icons/icon-192.png',
                  })
                  setTimeout(() => navigate(`/client/${phoneHash}/offer/${lenta?.id || 'offer-3'}`), 500)
                }
              }}
                className="relative w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/[0.06] flex items-center justify-center press-scale">
                <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              </button>
              {/* Cashback */}
              <button onClick={() => navigate(`/client/${phoneHash}/cashback`)}
                className="relative w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/[0.06] flex items-center justify-center">
                <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFD500] rounded-full text-[10px] font-bold text-[#111] flex items-center justify-center">7</span>
              </button>
            </div>
          </div>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); if (e.target.value) setActiveCategory(null) }}
              placeholder="Найти партнёра или категорию"
              className="w-full pl-11 pr-10 py-3.5 bg-white/[0.06] text-white placeholder-white/25 rounded-2xl text-[14px] font-medium focus:outline-none focus:bg-white/[0.12] focus:ring-1 focus:ring-[#FFD500]/40 border border-white/[0.04]" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories strip */}
      <div className="px-4 py-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max">
          <button onClick={() => { setActiveCategory(null); setSearch('') }}
            className={cn('w-[76px] h-[76px] rounded-2xl flex flex-col items-center justify-center gap-1 shrink-0 press-scale border',
              !activeCategory ? 'bg-[#111] text-white border-[#111]' : 'bg-white text-[#666] border-[#f0f0f0]')}>
            <span className="text-[22px]">⭐</span>
            <span className="text-[10px] font-bold">Все</span>
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setActiveCategory(cat); setSearch('') }}
              className={cn('w-[76px] h-[76px] rounded-2xl flex flex-col items-center justify-center gap-1 shrink-0 press-scale border',
                activeCategory === cat ? 'bg-[#FFD500] text-[#111] border-[#FFD500] shadow-[0_2px_12px_rgba(255,213,0,0.3)]' : 'bg-white text-[#666] border-[#f0f0f0]')}>
              <span className="text-[22px]">{catIcons[cat] || '🏷️'}</span>
              <span className="text-[10px] font-bold leading-tight text-center line-clamp-2 px-1">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20">
          <div className="w-10 h-10 border-[3px] border-[#FFD500] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isHome ? (
        <div className="pb-28">
          {/* "Для вас" — large cards */}
          <div className="pt-1 pb-5">
            <div className="px-5 flex items-baseline justify-between mb-3">
              <h2 className="text-[20px] font-extrabold text-[#111] tracking-[-0.03em]">Для вас</h2>
              <span className="text-[11px] text-[#bbb] font-bold uppercase tracking-[0.08em]">Лучшее</span>
            </div>
            <div className="pl-5 overflow-x-auto no-scrollbar">
              <div className="flex gap-3 pr-5 animate-stagger">
                {forYou.map(o => <OfferCard key={o.id} o={o} size="lg" />)}
              </div>
            </div>
          </div>

          {/* Collections */}
          {collections.map(col => (
            <div key={col.name} className="mb-6">
              <div className="px-5 flex items-center justify-between mb-3">
                <h2 className="text-[18px] font-extrabold text-[#111] tracking-[-0.02em]">{col.icon} {col.name}</h2>
                <button onClick={() => setActiveCategory(col.name)} className="text-[12px] font-bold text-[#FFD500] press-scale">
                  Все {col.offers.length} →
                </button>
              </div>
              <div className="pl-5 overflow-x-auto no-scrollbar">
                <div className="flex gap-3 pr-5">
                  {col.offers.slice(0, 6).map(o => <OfferCard key={o.id} o={o} />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Filtered view */
        <div className="px-5 pb-28">
          <div className="flex items-center justify-between mt-2 mb-4">
            <h2 className="text-[20px] font-extrabold text-[#111] tracking-[-0.03em]">
              {activeCategory ? `${catIcons[activeCategory] || ''} ${activeCategory}` : 'Результаты'}
            </h2>
            <p className="text-[12px] text-[#999] font-medium">{filtered?.length || 0} офферов</p>
          </div>
          {filtered && filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[14px] text-[#333] font-bold">{search ? 'Ничего не найдено' : 'Нет офферов'}</p>
              {search && <button onClick={() => setSearch('')} className="text-[13px] text-[#FFD500] font-bold mt-3">Сбросить</button>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 animate-stagger">
              {(filtered || []).map(o => (
                <button key={o.id} onClick={() => navigate(`/client/${phoneHash}/offer/${o.id}`)}
                  className="bg-white rounded-2xl overflow-hidden border border-[#f0f0f0] press-scale text-left hover:border-[#e0e0e0] transition-all">
                  {/* Image */}
                  <div className="h-[120px] relative">
                    {o.image_url ? (
                      <img src={o.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className={cn('w-full h-full bg-gradient-to-br', grad(o.partner_name))}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[48px] font-extrabold text-white/15">{o.partner_name[0]}</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-[#111]/70 backdrop-blur-md text-white px-2 py-0.5 rounded-lg">
                      <span className="font-mono-cash text-[13px] font-extrabold">{fmtRate(o)}</span>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <p className="text-[13px] font-bold text-[#111] truncate">{o.partner_name}</p>
                    <p className="text-[11px] text-[#999] mt-0.5 truncate">{o.name}</p>
                    <p className="text-[10px] text-[#bbb] mt-1">от {parseFloat(o.min_check).toFixed(0)} ₽</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab bar */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-black/[0.04] px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
        <div className="flex justify-around max-w-md mx-auto">
          <button className="flex flex-col items-center py-1 px-4 relative">
            <svg className="w-6 h-6 text-[#111]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <span className="text-[10px] font-bold text-[#111] mt-0.5">Офферы</span>
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-[#FFD500] rounded-full" />
          </button>
          <button onClick={() => navigate(`/client/${phoneHash}/cashback`)} className="flex flex-col items-center py-1 px-4">
            <svg className="w-6 h-6 text-[#bbb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] text-[#bbb] mt-0.5 font-medium">Кэшбэк</span>
          </button>
        </div>
      </div>
    </div>
  )
}
