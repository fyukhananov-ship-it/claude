import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

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
}

export default function OfferDetail() {
  const { phoneHash, offerId } = useParams<{ phoneHash: string; offerId: string }>()
  const navigate = useNavigate()
  const [offer, setOffer] = useState<OfferData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!phoneHash || !offerId) return
    api.get<OfferData>(`/client/${phoneHash}/offers/${offerId}`)
      .then(setOffer)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [phoneHash, offerId])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-beeline-gray">Загрузка...</div>
  if (!offer) return <div className="min-h-screen flex items-center justify-center text-beeline-gray">Оффер не найден</div>

  const isActivated = offer.status === 'activated' || offer.status === 'cashback_received'
  const rateText = offer.cashback_type === 'percent'
    ? `${(parseFloat(offer.cashback_rate) * 100).toFixed(0)}%`
    : `${parseFloat(offer.cashback_rate).toFixed(0)} ₽`

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 px-4 py-3 flex items-center border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="ml-2 font-medium text-sm">{offer.partner_name}</span>
      </div>

      {/* Hero */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
            {offer.partner_logo ? (
              <img src={offer.partner_logo} alt="" className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <span className="text-2xl font-bold text-beeline-gray">{offer.partner_name[0]}</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-beeline-black">{offer.name}</h1>
            <p className="text-beeline-gray text-sm">{offer.partner_name}</p>
          </div>
        </div>

        {/* Cashback card */}
        <div className="bg-gradient-to-r from-beeline-yellow to-brand-600 rounded-2xl p-5 mb-6">
          <p className="text-sm font-medium text-beeline-black/70">Кэшбэк</p>
          <p className="text-4xl font-bold text-beeline-black mt-1">{rateText}</p>
          <p className="text-sm text-beeline-black/70 mt-1">
            Макс. {parseFloat(offer.max_cashback_per_tx).toFixed(0)} ₽ за покупку
          </p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="font-semibold text-beeline-black mb-2">Условия</h2>
          <p className="text-sm text-beeline-dark leading-relaxed">{offer.description}</p>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-beeline-gray">Минимальный чек</span>
            <span className="text-sm font-medium">{parseFloat(offer.min_check).toFixed(0)} ₽</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-beeline-gray">Период</span>
            <span className="text-sm font-medium">
              {new Date(offer.start_date).toLocaleDateString('ru')} — {new Date(offer.end_date).toLocaleDateString('ru')}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-xl p-4 mb-8">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-700">
              Оплатите покупку через СБП у партнёра. Кэшбэк автоматически поступит на ваш счёт Билайн.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4">
        {isActivated ? (
          <Button variant="secondary" size="lg" className="w-full" disabled>
            Уже активирован
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate(`/client/${phoneHash}/activate/${offer.id}`)}
          >
            Активировать
          </Button>
        )}
      </div>
    </div>
  )
}
