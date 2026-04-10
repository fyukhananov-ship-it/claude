import { useNavigate } from 'react-router-dom'
import { useFavorites } from '@/client/lib/hooks'
import { isNewOffer, isExpiringSoon, daysUntil } from '@/client/lib/format'
import { cn } from '@/lib/utils'

export interface OfferCardItem {
  id: string
  partner_name: string
  name: string
  cashback_type: string
  cashback_rate: string
  min_check: string
  max_cashback_per_tx: string
  start_date: string
  end_date: string
  image_url: string | null
}

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

function grad(s: string) {
  return grads[s.charCodeAt(0) % grads.length]
}

function fmtRate(o: OfferCardItem) {
  return o.cashback_type === 'percent'
    ? `${(parseFloat(o.cashback_rate) * 100).toFixed(0)}%`
    : `${parseFloat(o.cashback_rate).toFixed(0)} ₽`
}

type Variant = 'horizontal' | 'grid' | 'hero' | 'list' | 'compact' | 'tall'

interface Props {
  offer: OfferCardItem
  phoneHash: string
  variant?: Variant
}

export default function OfferCard({ offer: o, phoneHash, variant = 'horizontal' }: Props) {
  const navigate = useNavigate()
  const { has, toggle } = useFavorites()
  const isFav = has(o.id)
  const isNew = isNewOffer(o.start_date)
  const isExpiring = isExpiringSoon(o.end_date)
  const daysLeft = daysUntil(o.end_date)
  const maxCb = parseFloat(o.max_cashback_per_tx).toFixed(0)

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    toggle(o.id)
  }

  const handleOpen = () => navigate(`/client/${phoneHash}/offer/${o.id}`)

  const HeartButton = ({ size = 'md', light = false }: { size?: 'sm' | 'md'; light?: boolean }) => (
    <button
      onClick={handleFav}
      className={cn(
        'rounded-full flex items-center justify-center press-scale z-10 shadow-sm',
        size === 'sm' ? 'w-7 h-7' : 'w-8 h-8',
        light ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'
      )}
      aria-label={isFav ? 'Удалить из избранного' : 'В избранное'}
    >
      {isFav ? (
        <svg className={cn(size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4', 'text-rose-500')} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg className={cn(size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4', light ? 'text-white' : 'text-[#666]')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  )

  const Badges = () => (
    <>
      {isNew && (
        <div className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">NEW</div>
      )}
      {isExpiring && !isNew && (
        <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">{daysLeft}д</div>
      )}
    </>
  )

  // ─── HERO: full-width spotlight card ───
  if (variant === 'hero') {
    return (
      <div className="relative">
        <button onClick={handleOpen} className="w-full rounded-3xl overflow-hidden press-scale text-left block relative h-[220px]">
          {o.image_url ? (
            <img src={o.image_url} alt={o.partner_name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className={cn('absolute inset-0 bg-gradient-to-br', grad(o.partner_name))}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[120px] font-extrabold text-white/15">{o.partner_name[0]}</span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute top-4 left-4 flex gap-2">
            <Badges />
          </div>

          <div className="absolute bottom-5 left-5 right-5 z-10">
            <p className="text-[12px] font-bold text-white/70 uppercase tracking-[0.1em]">{o.partner_name}</p>
            <p className="text-[18px] font-extrabold text-white mt-1 line-clamp-2 leading-tight">{o.name}</p>
            <div className="flex items-end justify-between mt-3">
              <div>
                <p className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Кэшбэк</p>
                <p className="font-mono-cash text-[36px] font-extrabold text-white leading-none mt-0.5 drop-shadow-lg">{fmtRate(o)}</p>
              </div>
              <div className="bg-[#FFD500] text-[#111] px-4 py-2.5 rounded-2xl font-extrabold text-[13px] shadow-lg">
                Подробнее →
              </div>
            </div>
          </div>
        </button>
        <div className="absolute top-4 right-4 z-10">
          <HeartButton light />
        </div>
      </div>
    )
  }

  // ─── LIST: horizontal row with avatar + info ───
  if (variant === 'list') {
    return (
      <div className="relative">
        <button onClick={handleOpen} className="w-full bg-white rounded-2xl border border-[#f0f0f0] p-3 flex items-center gap-3 press-scale text-left">
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative">
            {o.image_url ? (
              <img src={o.image_url} alt={o.partner_name} className="w-full h-full object-cover" />
            ) : (
              <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', grad(o.partner_name))}>
                <span className="text-[22px] font-extrabold text-white">{o.partner_name[0]}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-bold text-[#111] truncate">{o.partner_name}</p>
              {isNew && <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider shrink-0">NEW</span>}
              {isExpiring && !isNew && <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider shrink-0">{daysLeft}д</span>}
            </div>
            <p className="text-[12px] text-[#999] mt-0.5 truncate font-medium">{o.name}</p>
            <p className="text-[11px] text-[#bbb] mt-0.5">макс. {maxCb} ₽</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono-cash text-[22px] font-extrabold text-[#111] leading-none">{fmtRate(o)}</p>
            <p className="text-[10px] text-[#999] font-bold uppercase tracking-wider mt-1">Кэшбэк</p>
          </div>
        </button>
      </div>
    )
  }

  // ─── COMPACT: tiny row for "Мои активации" ───
  if (variant === 'compact') {
    return (
      <button onClick={handleOpen} className="flex-shrink-0 w-[140px] bg-white rounded-2xl border border-[#f0f0f0] p-3 flex items-center gap-2.5 press-scale text-left">
        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 relative">
          {o.image_url ? (
            <img src={o.image_url} alt={o.partner_name} className="w-full h-full object-cover" />
          ) : (
            <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', grad(o.partner_name))}>
              <span className="text-[14px] font-extrabold text-white">{o.partner_name[0]}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-[#111] truncate">{o.partner_name}</p>
          <p className="font-mono-cash text-[13px] font-extrabold text-emerald-600 mt-0.5">{fmtRate(o)}</p>
        </div>
      </button>
    )
  }

  // ─── TALL: 2/3 width tall card for featured collection ───
  if (variant === 'tall') {
    return (
      <div className="relative flex-shrink-0 w-[260px]">
        <button onClick={handleOpen} className="w-full rounded-2xl overflow-hidden press-scale text-left block relative h-[180px]">
          {o.image_url ? (
            <img src={o.image_url} alt={o.partner_name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className={cn('absolute inset-0 bg-gradient-to-br', grad(o.partner_name))}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[80px] font-extrabold text-white/15">{o.partner_name[0]}</span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />

          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badges />
          </div>

          <div className="absolute bottom-3 left-3 right-3 z-10">
            <div className="inline-flex items-center gap-1 bg-[#FFD500] px-2.5 py-1 rounded-lg mb-2">
              <span className="font-mono-cash text-[14px] font-extrabold text-[#111]">{fmtRate(o)}</span>
            </div>
            <p className="text-[14px] font-bold text-white leading-tight line-clamp-1">{o.partner_name}</p>
            <p className="text-[11px] text-white/70 mt-0.5 truncate font-medium">{o.name}</p>
          </div>
        </button>
        <div className="absolute top-3 right-3 z-10">
          <HeartButton size="sm" light />
        </div>
      </div>
    )
  }

  // ─── GRID: 2-column compact grid ───
  if (variant === 'grid') {
    return (
      <div className="relative">
        <button onClick={handleOpen} className="bg-white rounded-2xl overflow-hidden border border-[#f0f0f0] press-scale text-left hover:border-[#e0e0e0] transition-all w-full">
          <div className="h-[120px] relative">
            {o.image_url ? (
              <img src={o.image_url} alt={o.partner_name} className="w-full h-full object-cover" />
            ) : (
              <div className={cn('w-full h-full bg-gradient-to-br', grad(o.partner_name))}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[48px] font-extrabold text-white/15">{o.partner_name[0]}</span>
                </div>
              </div>
            )}
            <div className="absolute top-2 left-2 bg-[#111]/75 backdrop-blur-md text-white px-2 py-0.5 rounded-lg">
              <span className="font-mono-cash text-[13px] font-extrabold">{fmtRate(o)}</span>
            </div>
            <div className="absolute top-2 right-10 flex gap-1">
              <Badges />
            </div>
          </div>
          <div className="p-3">
            <p className="text-[13px] font-bold text-[#111] truncate">{o.partner_name}</p>
            <p className="text-[12px] text-[#999] mt-0.5 truncate">{o.name}</p>
            <p className="text-[11px] text-[#bbb] mt-1">макс. {maxCb} ₽</p>
          </div>
        </button>
        <div className="absolute top-2 right-2 z-10">
          <HeartButton size="sm" />
        </div>
      </div>
    )
  }

  // ─── HORIZONTAL (default): medium horizontal card ───
  return (
    <div className="flex-shrink-0 relative w-[170px]">
      <button onClick={handleOpen} className="press-scale text-left w-full">
        <div className="rounded-2xl overflow-hidden relative h-[110px]">
          {o.image_url ? (
            <img src={o.image_url} alt={o.partner_name} className="w-full h-full object-cover" />
          ) : (
            <div className={cn('w-full h-full bg-gradient-to-br', grad(o.partner_name))}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[42px] font-extrabold text-white/20">{o.partner_name[0]}</span>
              </div>
            </div>
          )}
          <div className="absolute top-2.5 left-2.5 bg-[#111]/75 backdrop-blur-md text-white px-2.5 py-1 rounded-lg">
            <span className="font-mono-cash text-[14px] font-extrabold">{fmtRate(o)}</span>
          </div>
          <div className="absolute top-2.5 right-10 flex gap-1">
            <Badges />
          </div>
        </div>
        <p className="text-[13px] font-bold text-[#111] mt-2.5 leading-tight truncate">{o.partner_name}</p>
        <p className="text-[12px] text-[#999] mt-0.5 truncate">{o.name}</p>
        <p className="text-[11px] text-[#bbb] mt-0.5">макс. {maxCb} ₽</p>
      </button>
      <div className="absolute top-2.5 right-2.5 z-10">
        <HeartButton size="sm" />
      </div>
    </div>
  )
}
