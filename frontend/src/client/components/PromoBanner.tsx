import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'

interface BannerData {
  id: string
  title: string
  subtitle: string
  partner_name: string
  partner_logo_url: string | null
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
      const w = el.firstElementChild?.firstElementChild?.getBoundingClientRect().width || el.offsetWidth
      const idx = Math.round(el.scrollLeft / w)
      setActiveIdx(Math.min(idx, banners.length - 1))
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [banners.length])

  if (banners.length === 0) return null

  const handleClick = (b: BannerData) => {
    if (b.offer_id) navigate(`/client/${phoneHash}/offer/${b.offer_id}`)
  }

  const renderCard = (b: BannerData) => (
    <button
      onClick={() => handleClick(b)}
      className="w-full text-left press-scale rounded-[24px] overflow-hidden bg-white"
    >
      {/* Hero image — fills top, generous height */}
      <div className="h-[260px] relative bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB]">
        {b.image_url ? (
          <img src={b.image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[80px] opacity-20">🎁</span>
          </div>
        )}
      </div>

      {/* Text block */}
      <div className="px-5 pt-4 pb-5">
        {b.title && (
          <p className="text-[20px] font-extrabold text-[#1C1917] leading-[1.15] tracking-[-0.02em]">
            {b.title}
          </p>
        )}
        {b.subtitle && (
          <p className="text-[13px] text-[#9CA3AF] mt-1.5 leading-snug">{b.subtitle}</p>
        )}

        {/* Partner row with CTA */}
        {(b.partner_name || b.offer_id) && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#F3F4F6]">
            {b.partner_logo_url ? (
              <img src={b.partner_logo_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 bg-[#F5F6F8]" />
            ) : b.partner_name ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EDE9FE] to-[#C4B5FD] flex items-center justify-center shrink-0">
                <span className="text-[14px] font-extrabold text-[#5B21B6]">{b.partner_name[0]}</span>
              </div>
            ) : null}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-[#1C1917] truncate">{b.partner_name}</p>
            </div>
            {b.offer_id && (
              <div className="bg-[#1C1917] text-white px-4 py-2 rounded-full text-[12px] font-bold shrink-0">
                {b.cta_text || 'Перейти'}
              </div>
            )}
          </div>
        )}
      </div>
    </button>
  )

  if (banners.length === 1) {
    return (
      <div className="px-5 pt-4 pb-2">
        {renderCard(banners[0])}
      </div>
    )
  }

  return (
    <div className="pt-4 pb-2">
      <div ref={scrollRef} className="overflow-x-auto no-scrollbar snap-x snap-mandatory">
        <div className="flex px-5 gap-3">
          {banners.map(b => (
            <div key={b.id} className="snap-center shrink-0 w-[calc(100vw-40px)] max-w-[380px]">
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
