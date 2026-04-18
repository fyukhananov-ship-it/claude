import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'

interface BannerData {
  id: string
  title: string
  subtitle: string
  partner_name: string
  image_url: string | null
  cta_text: string
  offer_id: string | null
}

export default function PromoBanner({ phoneHash }: { phoneHash: string }) {
  const navigate = useNavigate()
  const [banners, setBanners] = useState<BannerData[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get<BannerData[]>('/client/banners')
      .then(d => { if (Array.isArray(d) && d.length > 0) setBanners(d) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || banners.length <= 1) return
    const handleScroll = () => {
      const idx = Math.round(el.scrollLeft / el.offsetWidth)
      setActiveIdx(Math.min(idx, banners.length - 1))
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [banners.length])

  if (banners.length === 0) return null

  const renderCard = (b: BannerData) => (
    <div className="bg-white rounded-[20px] overflow-hidden shadow-card">
      {/* Hero image */}
      <div className="h-[200px] relative bg-[#F5F6F8]">
        {b.image_url ? (
          <img src={b.image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] flex items-center justify-center">
            <span className="text-[48px] opacity-30">🎁</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {b.title && (
          <p className="text-[17px] font-bold text-[#1C1917] leading-tight tracking-[-0.02em]">{b.title}</p>
        )}
        {b.subtitle && (
          <p className="text-[13px] text-[#6B7280] mt-1">{b.subtitle}</p>
        )}

        {/* Partner row + CTA */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#F5F6F8] flex items-center justify-center shrink-0">
              <span className="text-[14px] font-bold text-[#9CA3AF]">{b.partner_name?.[0] || '?'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#1C1917] truncate">{b.partner_name}</p>
            </div>
          </div>
          {b.offer_id && (
            <button
              onClick={() => navigate(`/client/${phoneHash}/offer/${b.offer_id}`)}
              className="bg-[#1C1917] text-white px-4 py-2 rounded-full text-[12px] font-bold press-scale shrink-0"
            >
              {b.cta_text || 'Перейти'}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  if (banners.length === 1) {
    return (
      <div className="px-5 mb-5">
        {renderCard(banners[0])}
      </div>
    )
  }

  return (
    <div className="mb-5">
      <div ref={scrollRef} className="overflow-x-auto no-scrollbar snap-x snap-mandatory">
        <div className="flex" style={{ width: `${banners.length * 100}%` }}>
          {banners.map(b => (
            <div key={b.id} className="snap-start px-5" style={{ width: `${100 / banners.length}%` }}>
              {renderCard(b)}
            </div>
          ))}
        </div>
      </div>
      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {banners.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIdx ? 'w-5 bg-[#1C1917]' : 'w-1.5 bg-[#D1D5DB]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
