import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { cn } from '@/lib/utils'

interface OfferData {
  id: string
  partner_name: string
  partner_logo: string | null
  name: string
  description: string
  image_url: string | null
  cashback_type: string
  cashback_rate: string
  min_check: string
  max_cashback_per_tx: string
  start_date: string
  end_date: string
  status: string
  category?: string
}

const avatarColors = [
  'bg-rose-100 text-rose-600', 'bg-sky-100 text-sky-600', 'bg-amber-100 text-amber-600',
  'bg-emerald-100 text-emerald-600', 'bg-violet-100 text-violet-600', 'bg-fuchsia-100 text-fuchsia-600',
]
function getAvatarColor(name: string) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length]
}

export default function OfferDetail() {
  const { phoneHash, offerId } = useParams<{ phoneHash: string; offerId: string }>()
  const navigate = useNavigate()
  const [offer, setOffer] = useState<OfferData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [activated, setActivated] = useState(false)

  useEffect(() => {
    if (!phoneHash || !offerId) return
    api.get<OfferData>(`/client/${phoneHash}/offers/${offerId}`)
      .then(o => { setOffer(o); setActivated(o.status === 'activated' || o.status === 'cashback_received') })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [phoneHash, offerId])

  const handleActivate = async () => {
    if (!phoneHash || !offerId || activating) return
    setActivating(true)
    try {
      await api.post(`/client/${phoneHash}/activate/${offerId}`)
      setActivated(true)
      navigate(`/client/${phoneHash}/thanks`)
    } catch { /* */ } finally { setActivating(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-beeline-yellow border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!offer) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <p className="text-beeline-gray">Оффер не найден</p>
      <button onClick={() => navigate(-1)} className="text-blue-600 text-sm mt-2">Назад</button>
    </div>
  )

  const rateText = offer.cashback_type === 'percent'
    ? `${(parseFloat(offer.cashback_rate) * 100).toFixed(0)}%`
    : `${parseFloat(offer.cashback_rate).toFixed(0)}\u00A0\u20BD`

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <svg className="w-5 h-5 text-beeline-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[15px] font-semibold text-beeline-black truncate">{offer.partner_name}</span>
      </div>

      {/* Hero card */}
      <div className="px-5 pt-5">
        <div className="bg-gradient-to-br from-beeline-yellow via-brand-500 to-brand-700 rounded-3xl p-6 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-6 w-28 h-28 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold bg-white/20 text-white shadow-lg backdrop-blur-sm')}>
                {offer.partner_name[0]}
              </div>
              <div>
                <p className="text-white/80 text-[12px] font-medium">{offer.partner_name}</p>
                <p className="text-white text-[15px] font-semibold leading-tight mt-0.5">{offer.name}</p>
              </div>
            </div>

            <div className="mt-2">
              <p className="text-white/60 text-[11px] font-medium uppercase tracking-wider">Кэшбэк</p>
              <p className="text-[44px] font-extrabold text-white leading-none mt-1 drop-shadow-sm">{rateText}</p>
              <p className="text-white/70 text-[13px] mt-2">
                Макс. {parseFloat(offer.max_cashback_per_tx).toFixed(0)}\u00A0\u20BD за покупку
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="px-5 mt-6">
        <div className="bg-[#f5f5f7] rounded-2xl p-4">
          <p className="text-[13px] font-semibold text-beeline-dark mb-3">Как получить кэшбэк</p>
          <div className="flex gap-3">
            {[
              { step: '1', text: 'Активируйте' },
              { step: '2', text: 'Оплатите через СБП' },
              { step: '3', text: 'Получите на Билайн' },
            ].map((s, i) => (
              <div key={i} className="flex-1 text-center">
                <div className="w-8 h-8 rounded-full bg-beeline-yellow/20 flex items-center justify-center mx-auto mb-1.5">
                  <span className="text-[12px] font-bold text-brand-800">{s.step}</span>
                </div>
                <p className="text-[11px] text-beeline-gray leading-tight">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-5 mt-5">
        <h3 className="text-[15px] font-semibold text-beeline-black mb-3">Условия</h3>
        <p className="text-[13px] text-beeline-dark/80 leading-relaxed">{offer.description}</p>

        <div className="mt-4 space-y-0">
          {[
            ['Минимальный чек', `${parseFloat(offer.min_check).toFixed(0)}\u00A0\u20BD`],
            ['Макс. кэшбэк за покупку', `${parseFloat(offer.max_cashback_per_tx).toFixed(0)}\u00A0\u20BD`],
            ['Период', `${new Date(offer.start_date).toLocaleDateString('ru', {day:'numeric',month:'short'})} — ${new Date(offer.end_date).toLocaleDateString('ru', {day:'numeric',month:'short',year:'numeric'})}`],
            ['Способ оплаты', 'СБП (Система быстрых платежей)'],
            ['Начисление', 'На счёт Билайн (1-3 дня)'],
          ].map(([label, value], i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <span className="text-[13px] text-beeline-gray">{label}</span>
              <span className="text-[13px] font-medium text-beeline-dark">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-28" /> {/* spacer for sticky CTA */}

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100/50 px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        {activated ? (
          <button disabled className="w-full py-4 rounded-2xl bg-emerald-50 text-emerald-600 font-semibold text-[15px] flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Активирован
          </button>
        ) : (
          <button
            onClick={handleActivate}
            disabled={activating}
            className="w-full py-4 rounded-2xl bg-beeline-yellow text-beeline-black font-bold text-[15px] hover:bg-brand-600 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-yellow-400/25"
          >
            {activating ? 'Подключаем...' : 'Активировать кэшбэк'}
          </button>
        )}
      </div>
    </div>
  )
}
