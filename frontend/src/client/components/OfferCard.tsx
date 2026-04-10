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

interface Props {
  offer: OfferCardItem
  phoneHash: string
  size?: 'lg' | 'md'
  variant?: 'horizontal' | 'grid'
}

export default function OfferCard({ offer: o, phoneHash, size = 'md', variant = 'horizontal' }: Props) {
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

  if (variant === 'grid') {
    return (
      <div className="relative">
        <button
          onClick={() => navigate(`/client/${phoneHash}/offer/${o.id}`)}
          className="bg-white rounded-2xl overflow-hidden border border-[#f0f0f0] press-scale text-left hover:border-[#e0e0e0] transition-all w-full"
        >
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
            {isNew && (
              <div className="absolute top-2 right-10 bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">
                NEW
              </div>
            )}
            {isExpiring && !isNew && (
              <div className="absolute top-2 right-10 bg-red-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">
                {daysLeft}д
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="text-[13px] font-bold text-[#111] truncate">{o.partner_name}</p>
            <p className="text-[12px] text-[#999] mt-0.5 truncate">{o.name}</p>
            <p className="text-[11px] text-[#bbb] mt-1">макс. {maxCb} ₽</p>
          </div>
        </button>
        <button
          onClick={handleFav}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center press-scale shadow-sm"
          aria-label={isFav ? 'Удалить из избранного' : 'В избранное'}
        >
          {isFav ? (
            <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      </div>
    )
  }

  const w = size === 'lg' ? 'w-[200px]' : 'w-[170px]'
  const h = size === 'lg' ? 'h-[140px]' : 'h-[110px]'

  return (
    <div className={cn('flex-shrink-0 relative', w)}>
      <button
        onClick={() => navigate(`/client/${phoneHash}/offer/${o.id}`)}
        className="press-scale text-left w-full"
      >
        <div className={cn('rounded-2xl overflow-hidden relative', h)}>
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
          {isNew && (
            <div className="absolute top-2.5 right-10 bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">
              NEW
            </div>
          )}
          {isExpiring && !isNew && (
            <div className="absolute top-2.5 right-10 bg-red-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">
              {daysLeft}д
            </div>
          )}
        </div>
        <p className="text-[13px] font-bold text-[#111] mt-2.5 leading-tight truncate">{o.partner_name}</p>
        <p className="text-[12px] text-[#999] mt-0.5 truncate">{o.name}</p>
        <p className="text-[11px] text-[#bbb] mt-0.5">макс. {maxCb} ₽ · от {parseFloat(o.min_check).toFixed(0)} ₽</p>
      </button>
      <button
        onClick={handleFav}
        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center press-scale shadow-sm z-10"
        aria-label={isFav ? 'Удалить из избранного' : 'В избранное'}
      >
        {isFav ? (
          <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )}
      </button>
    </div>
  )
}
