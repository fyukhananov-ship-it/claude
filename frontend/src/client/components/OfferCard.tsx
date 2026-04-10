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

// Refined subtle brand-tinted gradient fallbacks (not AI-saturated)
const tints = [
  { bg: 'bg-[#FEF3C7]', ring: '#F59E0B', text: 'text-[#92400E]' }, // amber
  { bg: 'bg-[#FEE2E2]', ring: '#EF4444', text: 'text-[#991B1B]' }, // rose
  { bg: 'bg-[#EDE9FE]', ring: '#8B5CF6', text: 'text-[#5B21B6]' }, // violet
  { bg: 'bg-[#DBEAFE]', ring: '#3B82F6', text: 'text-[#1E40AF]' }, // blue
  { bg: 'bg-[#D1FAE5]', ring: '#10B981', text: 'text-[#065F46]' }, // emerald
  { bg: 'bg-[#FCE7F3]', ring: '#EC4899', text: 'text-[#9F1239]' }, // pink
  { bg: 'bg-[#E0F2FE]', ring: '#0EA5E9', text: 'text-[#0C4A6E]' }, // sky
  { bg: 'bg-[#F3E8FF]', ring: '#A855F7', text: 'text-[#581C87]' }, // purple
]

function tint(s: string) {
  return tints[s.charCodeAt(0) % tints.length]
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
  const t = tint(o.partner_name)

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
        'rounded-full flex items-center justify-center press-scale z-10 transition-all',
        size === 'sm' ? 'w-7 h-7' : 'w-8 h-8',
        light ? 'bg-white/15 backdrop-blur-md hover:bg-white/25' : 'bg-white shadow-card hover:shadow-card-hover'
      )}
      aria-label={isFav ? 'Удалить из избранного' : 'В избранное'}
    >
      {isFav ? (
        <svg className={cn(size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4', 'text-rose-500')} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg className={cn(size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4', light ? 'text-white/90' : 'text-[#6B7280]')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  )

  // Cashback pill — refined white with dark text (premium feel)
  const CashbackPill = ({ small = false }: { small?: boolean }) => (
    <div className={cn(
      'inline-flex items-center bg-white/95 backdrop-blur-md rounded-full shadow-sm',
      small ? 'px-2 py-0.5' : 'px-2.5 py-1'
    )}>
      <span className={cn('font-mono-cash font-extrabold text-[#0A0A0C]', small ? 'text-[12px]' : 'text-[13px]')}>
        {fmtRate(o)}
      </span>
    </div>
  )

  const Badges = ({ sm = false }: { sm?: boolean }) => (
    <>
      {isNew && (
        <span className={cn(
          'bg-emerald-500 text-white rounded-full font-extrabold uppercase tracking-wider shadow-sm',
          sm ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
        )}>
          NEW
        </span>
      )}
      {isExpiring && !isNew && (
        <span className={cn(
          'bg-red-500 text-white rounded-full font-extrabold uppercase tracking-wider shadow-sm',
          sm ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
        )}>
          {daysLeft}д
        </span>
      )}
    </>
  )

  const ImageFallback = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
    <div className={cn('absolute inset-0 flex items-center justify-center', t.bg)}>
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${t.ring}22 0%, transparent 60%), radial-gradient(circle at 70% 70%, ${t.ring}18 0%, transparent 60%)`
        }}
      />
      <span className={cn('font-extrabold relative z-10', t.text,
        size === 'sm' && 'text-[22px]',
        size === 'md' && 'text-[48px] opacity-30',
        size === 'lg' && 'text-[100px] opacity-20'
      )}>
        {o.partner_name[0]}
      </span>
    </div>
  )

  // ─── HERO: full-width spotlight card ───
  if (variant === 'hero') {
    return (
      <div className="relative">
        <button onClick={handleOpen} className="w-full rounded-[28px] overflow-hidden press-scale text-left block relative h-[240px] shadow-hero">
          {o.image_url ? (
            <img src={o.image_url} alt={o.partner_name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <ImageFallback size="lg" />
          )}
          {/* Refined vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C]/85 via-[#0A0A0C]/15 to-transparent" />

          <div className="absolute top-5 left-5 flex gap-2">
            <Badges />
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-10">
            <p className="text-[11px] font-bold text-white/70 uppercase tracking-[0.14em]">{o.partner_name}</p>
            <p className="text-[20px] font-extrabold text-white mt-1.5 line-clamp-2 leading-[1.15] tracking-[-0.02em]">{o.name}</p>
            <div className="flex items-end justify-between mt-4">
              <div>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.12em]">Кэшбэк</p>
                <p className="font-mono-cash text-[40px] font-extrabold text-white leading-none mt-1">{fmtRate(o)}</p>
              </div>
              <div className="bg-[#FFDC00] text-[#0A0A0C] px-4 py-2.5 rounded-full font-extrabold text-[13px] shadow-float">
                Подробнее
              </div>
            </div>
          </div>
        </button>
        <div className="absolute top-5 right-5 z-10">
          <HeartButton light />
        </div>
      </div>
    )
  }

  // ─── LIST: horizontal row ───
  if (variant === 'list') {
    return (
      <div className="relative">
        <button onClick={handleOpen} className="w-full bg-white rounded-[20px] p-3.5 flex items-center gap-3 press-scale text-left shadow-card hover:shadow-card-hover transition-shadow">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 relative">
            {o.image_url ? (
              <img src={o.image_url} alt={o.partner_name} className="w-full h-full object-cover" />
            ) : (
              <ImageFallback size="sm" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-bold text-[#0A0A0C] truncate tracking-[-0.01em]">{o.partner_name}</p>
              {isNew && <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider shrink-0">NEW</span>}
              {isExpiring && !isNew && <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider shrink-0">{daysLeft}д</span>}
            </div>
            <p className="text-[12px] text-[#6B7280] mt-0.5 truncate font-medium">{o.name}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5 font-medium">макс. {maxCb} ₽</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono-cash text-[22px] font-extrabold text-[#0A0A0C] leading-none">{fmtRate(o)}</p>
            <p className="text-[9px] text-[#9CA3AF] font-bold uppercase tracking-[0.12em] mt-1">Кэшбэк</p>
          </div>
        </button>
      </div>
    )
  }

  // ─── COMPACT: tiny row for "Мои активации" ───
  if (variant === 'compact') {
    return (
      <button onClick={handleOpen} className="flex-shrink-0 w-[148px] bg-white rounded-2xl p-3 flex items-center gap-2.5 press-scale text-left shadow-card">
        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 relative">
          {o.image_url ? (
            <img src={o.image_url} alt={o.partner_name} className="w-full h-full object-cover" />
          ) : (
            <ImageFallback size="sm" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-[#0A0A0C] truncate">{o.partner_name}</p>
          <p className="font-mono-cash text-[13px] font-extrabold text-emerald-600 mt-0.5">{fmtRate(o)}</p>
        </div>
      </button>
    )
  }

  // ─── TALL: featured food card ───
  if (variant === 'tall') {
    return (
      <div className="relative flex-shrink-0 w-[264px]">
        <button onClick={handleOpen} className="w-full rounded-[22px] overflow-hidden press-scale text-left block relative h-[188px] shadow-float">
          {o.image_url ? (
            <img src={o.image_url} alt={o.partner_name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <ImageFallback size="md" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C]/80 via-[#0A0A0C]/10 to-transparent" />

          <div className="absolute top-3.5 left-3.5 flex gap-1.5">
            <Badges sm />
          </div>

          <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
            <div className="mb-2"><CashbackPill /></div>
            <p className="text-[14px] font-bold text-white leading-tight line-clamp-1 tracking-[-0.01em]">{o.partner_name}</p>
            <p className="text-[11px] text-white/75 mt-0.5 truncate font-medium">{o.name}</p>
          </div>
        </button>
        <div className="absolute top-3.5 right-3.5 z-10">
          <HeartButton size="sm" light />
        </div>
      </div>
    )
  }

  // ─── GRID: 2-column ───
  if (variant === 'grid') {
    return (
      <div className="relative">
        <button onClick={handleOpen} className="bg-white rounded-[20px] overflow-hidden press-scale text-left w-full shadow-card hover:shadow-card-hover transition-shadow">
          <div className="h-[126px] relative">
            {o.image_url ? (
              <img src={o.image_url} alt={o.partner_name} className="w-full h-full object-cover" />
            ) : (
              <ImageFallback size="md" />
            )}
            <div className="absolute top-2.5 left-2.5"><CashbackPill small /></div>
            <div className="absolute top-2.5 right-11 flex gap-1">
              <Badges sm />
            </div>
          </div>
          <div className="p-3.5">
            <p className="text-[13px] font-bold text-[#0A0A0C] truncate tracking-[-0.01em]">{o.partner_name}</p>
            <p className="text-[12px] text-[#6B7280] mt-0.5 truncate font-medium">{o.name}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-1 font-medium">макс. {maxCb} ₽</p>
          </div>
        </button>
        <div className="absolute top-2.5 right-2.5 z-10">
          <HeartButton size="sm" />
        </div>
      </div>
    )
  }

  // ─── HORIZONTAL (default) ───
  return (
    <div className="flex-shrink-0 relative w-[176px]">
      <button onClick={handleOpen} className="press-scale text-left w-full">
        <div className="rounded-[18px] overflow-hidden relative h-[116px] shadow-card">
          {o.image_url ? (
            <img src={o.image_url} alt={o.partner_name} className="w-full h-full object-cover" />
          ) : (
            <ImageFallback size="md" />
          )}
          <div className="absolute top-2.5 left-2.5"><CashbackPill /></div>
          <div className="absolute top-2.5 right-11 flex gap-1">
            <Badges sm />
          </div>
        </div>
        <p className="text-[13px] font-bold text-[#0A0A0C] mt-2.5 leading-tight truncate tracking-[-0.01em]">{o.partner_name}</p>
        <p className="text-[12px] text-[#6B7280] mt-0.5 truncate font-medium">{o.name}</p>
        <p className="text-[11px] text-[#9CA3AF] mt-0.5 font-medium">макс. {maxCb} ₽</p>
      </button>
      <div className="absolute top-2.5 right-2.5 z-10">
        <HeartButton size="sm" />
      </div>
    </div>
  )
}
