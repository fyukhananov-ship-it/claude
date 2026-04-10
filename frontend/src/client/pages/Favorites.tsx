import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { cn } from '@/lib/utils'
import { useFavorites } from '@/client/lib/hooks'

interface OfferItem {
  id: string; partner_name: string; name: string; cashback_type: string
  cashback_rate: string; min_check: string; image_url: string | null
}

const grads = ['from-amber-400 via-orange-400 to-red-400', 'from-rose-400 via-pink-500 to-fuchsia-500', 'from-violet-400 via-purple-500 to-indigo-500', 'from-sky-400 via-blue-500 to-indigo-500', 'from-emerald-400 via-teal-500 to-cyan-500', 'from-lime-400 via-green-500 to-emerald-500']
function grad(s: string) { return grads[s.charCodeAt(0) % grads.length] }

export default function Favorites() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()
  const [allOffers, setAllOffers] = useState<OfferItem[]>([])
  const [loading, setLoading] = useState(true)
  const { favs, toggle } = useFavorites()

  useEffect(() => {
    if (!phoneHash) return
    api.get<OfferItem[]>(`/client/${phoneHash}/offers`)
      .then(data => setAllOffers(Array.isArray(data) ? data : []))
      .catch(() => setAllOffers([]))
      .finally(() => setLoading(false))
  }, [phoneHash])

  const favoriteOffers = allOffers.filter(o => favs.includes(o.id))

  const fmtRate = (o: OfferItem) => o.cashback_type === 'percent'
    ? `${(parseFloat(o.cashback_rate) * 100).toFixed(0)}%`
    : `${parseFloat(o.cashback_rate).toFixed(0)} ₽`

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-black/[0.04] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center press-scale">
          <svg className="w-5 h-5 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[15px] font-bold text-[#111]">Избранное</span>
      </div>

      <div className="px-5 py-5">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="w-8 h-8 border-[3px] border-[#FFD500] border-t-transparent rounded-full animate-spin" />
            <p className="text-[12px] text-[#999] font-medium">Загружаем избранное…</p>
          </div>
        ) : favoriteOffers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-rose-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <p className="text-[14px] text-[#333] font-bold">Пока нет избранных</p>
            <p className="text-[12px] text-[#999] mt-1 font-medium max-w-xs mx-auto">
              Нажмите на сердечко у интересных офферов, чтобы сохранить их здесь
            </p>
            <button
              onClick={() => navigate(`/client/${phoneHash}`)}
              className="mt-5 px-6 py-3 rounded-2xl bg-[#FFD500] text-[#111] font-extrabold text-[14px] press-scale"
            >
              Смотреть офферы
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 animate-stagger">
            {favoriteOffers.map(o => (
              <div key={o.id} className="relative">
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
                    <div className="absolute top-2 left-2 bg-[#111]/70 backdrop-blur-md text-white px-2 py-0.5 rounded-lg">
                      <span className="font-mono-cash text-[13px] font-extrabold">{fmtRate(o)}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-[13px] font-bold text-[#111] truncate">{o.partner_name}</p>
                    <p className="text-[12px] text-[#999] mt-0.5 truncate">{o.name}</p>
                  </div>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggle(o.id) }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center press-scale shadow-sm"
                  aria-label="Удалить из избранного"
                >
                  <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
