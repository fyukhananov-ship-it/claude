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
  cashback_type: string
  cashback_rate: string
  min_check: string
  max_cashback_per_tx: string
  start_date: string
  end_date: string
  status: string
  category: string | null
  image_url: string | null
}

const categoryIcons: Record<string, string> = {
  '\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u043E\u0432\u044B\u0435 \u0441\u0435\u0442\u0438': '\u{1F6D2}',
  '\u0422\u043E\u0432\u0430\u0440\u044B \u0434\u043B\u044F \u0434\u043E\u043C\u0430 / DIY': '\u{1F3E0}',
  '\u041E\u0434\u0435\u0436\u0434\u0430 / \u043E\u0431\u0443\u0432\u044C': '\u{1F45C}',
  '\u041A\u043E\u0441\u043C\u0435\u0442\u0438\u043A\u0430 / \u0443\u0445\u043E\u0434': '\u{2728}',
  '\u0421\u043F\u043E\u0440\u0442 / outdoor': '\u{1F3C3}',
  'QSR / \u0444\u0430\u0441\u0442\u0444\u0443\u0434': '\u{1F354}',
  '\u041A\u043E\u0444\u0435\u0439\u043D\u0438': '\u{2615}',
  'Casual / fine dining': '\u{1F37D}\u{FE0F}',
  '\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u0435\u0434\u044B': '\u{1F4E6}',
  '\u042D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u0438\u043A\u0430 / \u0442\u0435\u0445\u043D\u0438\u043A\u0430': '\u{1F4F1}',
  '\u0422\u043E\u0432\u0430\u0440\u044B \u0434\u043B\u044F \u0434\u0435\u0442\u0435\u0439': '\u{1F9F8}',
  '\u041A\u043D\u0438\u0433\u0438 / \u0445\u043E\u0431\u0431\u0438 / \u043F\u043E\u0434\u043F\u0438\u0441\u043A\u0438': '\u{1F4DA}',
  '\u0410\u0417\u0421 / \u0442\u043E\u043F\u043B\u0438\u0432\u043E': '\u{26FD}',
  '\u041E\u0442\u0435\u043B\u0438 / \u0430\u0432\u0438\u0430\u0431\u0438\u043B\u0435\u0442\u044B': '\u{2708}\u{FE0F}',
  '\u041A\u0438\u043D\u043E / \u0440\u0430\u0437\u0432\u043B\u0435\u0447\u0435\u043D\u0438\u044F / \u0444\u0438\u0442\u043D\u0435\u0441': '\u{1F3AC}',
  '\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u0435\u0442\u0438 / \u0444\u0440\u0430\u043D\u0448\u0438\u0437\u044B': '\u{1F3EA}',
  '\u0421\u0435\u0440\u0432\u0438\u0441\u044B': '\u{1F6E0}\u{FE0F}',
  '\u041E\u043D\u043B\u0430\u0439\u043D-\u0441\u0435\u0440\u0432\u0438\u0441\u044B / SaaS': '\u{1F4BB}',
}

const gradients = [
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-600',
  'from-violet-400 to-purple-600',
  'from-sky-400 to-blue-600',
  'from-emerald-400 to-teal-600',
  'from-fuchsia-400 to-pink-600',
  'from-cyan-400 to-blue-500',
  'from-lime-400 to-green-600',
]
function getGradient(s: string) { return gradients[s.charCodeAt(0) % gradients.length] }

export default function OfferCatalog() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()
  const [offers, setOffers] = useState<OfferItem[]>([])
  const [category, setCategory] = useState('Все')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'cashback' | 'new'>('cashback')
  const [loading, setLoading] = useState(true)
  const [showAllCats, setShowAllCats] = useState(false)

  useEffect(() => {
    if (!phoneHash) return
    setLoading(true)
    api.get<OfferItem[]>(`/client/${phoneHash}/offers`, { sort })
      .then(data => setOffers(Array.isArray(data) ? data : []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false))
  }, [phoneHash, sort])

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

  const filtered = useMemo(() => {
    let r = offers
    if (category !== 'Все') r = r.filter(o => o.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(o => o.partner_name.toLowerCase().includes(q) || o.name.toLowerCase().includes(q) || (o.category || '').toLowerCase().includes(q))
    }
    return r
  }, [offers, category, search])

  const catCounts = useMemo(() => {
    const c: Record<string, number> = {}
    offers.forEach(o => { if (o.category) c[o.category] = (c[o.category] || 0) + 1 })
    return c
  }, [offers])

  const sortedCats = useMemo(() =>
    [...CATEGORIES].sort((a, b) => (catCounts[b] || 0) - (catCounts[a] || 0))
  , [catCounts])

  const topCats = sortedCats.slice(0, 3)
  const restCats = sortedCats.slice(3)

  const fmtRate = (o: OfferItem) => o.cashback_type === 'percent'
    ? `${(parseFloat(o.cashback_rate) * 100).toFixed(0)}%`
    : `${parseFloat(o.cashback_rate).toFixed(0)} \u20BD`

  const isHome = !search && category === 'Все'

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ── Header ── */}
      <div className="bg-[#111] noise-bg relative text-white px-5 pt-[max(52px,env(safe-area-inset-top,52px))] pb-5">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFD500] rounded-2xl flex items-center justify-center shadow-[0_0_24px_rgba(255,213,0,0.3)]">
                <span className="text-[11px] font-extrabold text-[#111] tracking-tight">CLO</span>
              </div>
              <div>
                <p className="text-[16px] font-bold tracking-[-0.02em]">Подарки и акции</p>
                <p className="text-[11px] text-white/40 font-medium tracking-wide">Билайн × НСПК</p>
              </div>
            </div>
            <button onClick={() => navigate(`/client/${phoneHash}/cashback`)}
              className="relative w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/[0.06] flex items-center justify-center">
              <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFD500] rounded-full text-[10px] font-bold text-[#111] flex items-center justify-center shadow-lg">7</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Найти партнёра или категорию"
              className="w-full pl-11 pr-10 py-3.5 bg-white/[0.06] text-white placeholder-white/25 rounded-2xl text-[14px] font-medium focus:outline-none focus:bg-white/[0.12] focus:ring-1 focus:ring-[#FFD500]/40 border border-white/[0.04] transition-all" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── "Для вас" ── */}
      {isHome && !loading && (
        <div className="pt-6 pb-1">
          <div className="px-5 flex items-baseline justify-between mb-4">
            <h2 className="text-[20px] font-extrabold text-[#111] tracking-[-0.03em]">Для вас</h2>
            <span className="text-[11px] text-[#999] font-medium uppercase tracking-[0.08em]">Персональное</span>
          </div>
          <div className="pl-5 overflow-x-auto no-scrollbar">
            <div className="flex gap-3 pr-5 animate-stagger">
              {forYou.map(offer => (
                <button key={offer.id} onClick={() => navigate(`/client/${phoneHash}/offer/${offer.id}`)}
                  className="flex-shrink-0 w-[140px] press-scale group">
                  <div className={cn('h-[100px] rounded-2xl bg-gradient-to-br flex flex-col items-center justify-center relative overflow-hidden', getGradient(offer.partner_name))}>
                    <span className="font-mono-cash text-[32px] font-extrabold text-white drop-shadow-lg leading-none">
                      {fmtRate(offer)}
                    </span>
                    <span className="absolute top-2 right-2 text-[9px] bg-black/20 text-white/90 px-2 py-0.5 rounded-full backdrop-blur-sm font-medium">
                      {(offer.category || '').split(' / ')[0].split(' ')[0]}
                    </span>
                  </div>
                  <p className="text-[13px] font-bold text-[#111] mt-2 leading-tight truncate">{offer.partner_name}</p>
                  <p className="text-[11px] text-[#999] mt-0.5">от {parseFloat(offer.min_check).toFixed(0)} &#8381;</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Categories ── */}
      {isHome && !loading && (
        <div className="px-5 pt-5 pb-2">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[20px] font-extrabold text-[#111] tracking-[-0.03em]">Категории</h2>
            <span className="text-[11px] text-[#999] font-medium">{CATEGORIES.length} шт</span>
          </div>

          {/* Top 3 large */}
          <div className="grid grid-cols-3 gap-2.5 mb-2.5">
            {topCats.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className="bg-white rounded-2xl border border-[#f0f0f0] p-3 text-center press-scale hover:border-[#FFD500]/40 hover:shadow-[0_2px_12px_rgba(255,213,0,0.1)] transition-all">
                <span className="text-[26px] block">{categoryIcons[cat] || ''}</span>
                <p className="text-[11px] font-bold text-[#111] mt-2 leading-tight">{cat.split(' / ')[0]}</p>
                <p className="text-[10px] text-[#bbb] mt-0.5 font-medium">{catCounts[cat] || 0}</p>
              </button>
            ))}
          </div>

          {/* Expand */}
          {!showAllCats ? (
            <button onClick={() => setShowAllCats(true)}
              className="w-full py-3 rounded-2xl bg-[#111] text-white text-[12px] font-bold tracking-wide press-scale flex items-center justify-center gap-2">
              Все категории
              <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-2 animate-stagger">
                {restCats.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl bg-white border border-[#f0f0f0] press-scale hover:border-[#FFD500]/30 transition-all">
                    <span className="text-[18px]">{categoryIcons[cat] || ''}</span>
                    <span className="text-[9px] font-bold text-[#333] text-center leading-tight line-clamp-2">{cat.split(' / ')[0]}</span>
                    <span className="text-[8px] text-[#bbb] font-medium">{catCounts[cat] || 0}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowAllCats(false)}
                className="w-full py-2.5 mt-2 rounded-xl text-[11px] font-bold text-[#999] press-scale flex items-center justify-center gap-1">
                Свернуть
                <svg className="w-3 h-3 opacity-40 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Category chips (browse mode) ── */}
      {!isHome && (
        <div className="px-4 pt-3 pb-1 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            <button onClick={() => { setCategory('Все'); setSearch('') }}
              className="px-4 py-2 rounded-full text-[12px] font-bold bg-[#111] text-white press-scale">
              &#8592; Все
            </button>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={cn('px-3 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all press-scale',
                  category === c ? 'bg-[#FFD500] text-[#111] shadow-[0_2px_8px_rgba(255,213,0,0.3)]' : 'bg-white text-[#999] border border-[#eee]')}>
                {categoryIcons[c] || ''} {c.split(' / ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Section header ── */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-extrabold text-[#111] tracking-[-0.03em]">
            {isHome ? 'Все офферы' : category !== 'Все' ? category : 'Результаты'}
          </h2>
          <div className="flex items-center bg-[#f0f0f0] rounded-full p-0.5">
            {[['cashback', 'Кэшбэк'], ['new', 'Новые']].map(([val, label]) => (
              <button key={val} onClick={() => setSort(val as 'cashback' | 'new')}
                className={cn('text-[11px] px-3 py-1 rounded-full font-bold transition-all',
                  sort === val ? 'bg-white text-[#111] shadow-sm' : 'text-[#999]')}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {!isHome && <p className="text-[12px] text-[#999] mt-1 font-medium">{filtered.length} офферов</p>}
      </div>

      {/* ── Offer cards ── */}
      <div className="px-5 pb-28 animate-stagger">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-10 h-10 border-[3px] border-[#FFD500] border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] text-[#999] mt-4 font-medium">Загрузка офферов...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-[14px] text-[#333] font-bold">{search ? 'Ничего не найдено' : 'Нет офферов'}</p>
            {search && <>
              <p className="text-[12px] text-[#999] mt-1">По запросу &laquo;{search}&raquo;</p>
              <button onClick={() => setSearch('')} className="text-[13px] text-[#FFD500] font-bold mt-3">Сбросить</button>
            </>}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(offer => (
              <button key={offer.id} onClick={() => navigate(`/client/${phoneHash}/offer/${offer.id}`)}
                className="w-full bg-white rounded-2xl p-4 text-left border border-[#f0f0f0] hover:border-[#e0e0e0] press-scale flex items-center gap-3.5 transition-all">
                {/* Gradient avatar */}
                <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0 text-white text-[17px] font-extrabold shadow-lg', getGradient(offer.partner_name))}>
                  {offer.partner_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[14px] font-bold text-[#111] truncate">{offer.partner_name}</p>
                    {offer.category && <span className="text-[12px] shrink-0">{categoryIcons[offer.category] || ''}</span>}
                  </div>
                  <p className="text-[11px] text-[#999] mt-0.5 truncate font-medium">{offer.name}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono-cash text-[18px] font-extrabold text-[#111] leading-none">{fmtRate(offer)}</p>
                  <p className="text-[10px] text-[#bbb] mt-1 font-medium">от {parseFloat(offer.min_check).toFixed(0)}&#8381;</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Tab bar ── */}
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
