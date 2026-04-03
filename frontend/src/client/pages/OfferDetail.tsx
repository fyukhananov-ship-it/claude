import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { cn } from '@/lib/utils'

interface OfferData {
  id: string; partner_name: string; partner_logo: string | null; name: string
  description: string; image_url: string | null; cashback_type: string
  cashback_rate: string; min_check: string; max_cashback_per_tx: string
  start_date: string; end_date: string; status: string; category?: string
}

const gradients = ['from-amber-400 to-orange-500','from-rose-400 to-pink-600','from-violet-400 to-purple-600','from-sky-400 to-blue-600','from-emerald-400 to-teal-600','from-fuchsia-400 to-pink-600']
function getGrad(s: string) { return gradients[s.charCodeAt(0) % gradients.length] }

export default function OfferDetail() {
  const { phoneHash, offerId } = useParams<{ phoneHash: string; offerId: string }>()
  const navigate = useNavigate()
  const [offer, setOffer] = useState<OfferData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!phoneHash || !offerId) return
    api.get<OfferData>(`/client/${phoneHash}/offers/${offerId}`)
      .then(o => { setOffer(o); setDone(o.status === 'activated' || o.status === 'cashback_received') })
      .catch(() => {}).finally(() => setLoading(false))
  }, [phoneHash, offerId])

  const handleActivate = async () => {
    if (!phoneHash || !offerId || activating) return
    setActivating(true)
    try { await api.post(`/client/${phoneHash}/activate/${offerId}`); setDone(true); navigate(`/client/${phoneHash}/thanks`) }
    catch {} finally { setActivating(false) }
  }

  if (loading) return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-[#FFD500] border-t-transparent rounded-full animate-spin" /></div>
  if (!offer) return <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center"><p className="text-[#999]">Оффер не найден</p></div>

  const rate = offer.cashback_type === 'percent' ? `${(parseFloat(offer.cashback_rate) * 100).toFixed(0)}%` : `${parseFloat(offer.cashback_rate).toFixed(0)} \u20BD`

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-black/[0.04] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center press-scale">
          <svg className="w-5 h-5 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-[15px] font-bold text-[#111] truncate">{offer.partner_name}</span>
      </div>

      {/* Hero */}
      <div className="px-5 pt-5">
        <div className={cn('rounded-3xl p-6 relative overflow-hidden noise-bg bg-gradient-to-br', getGrad(offer.partner_name))}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-8 w-36 h-36 rounded-full bg-black/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-[22px] font-extrabold text-white shadow-xl">
                {offer.partner_name[0]}
              </div>
              <div>
                <p className="text-white/70 text-[11px] font-bold uppercase tracking-[0.1em]">{offer.partner_name}</p>
                <p className="text-white text-[14px] font-bold leading-tight mt-0.5">{offer.name}</p>
              </div>
            </div>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.15em]">Кэшбэк</p>
            <p className="font-mono-cash text-[52px] font-extrabold text-white leading-none mt-1 drop-shadow-lg">{rate}</p>
            <p className="text-white/60 text-[12px] font-medium mt-2">Макс. {parseFloat(offer.max_cashback_per_tx).toFixed(0)} &#8381; за покупку</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="px-5 mt-6">
        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
          <p className="text-[13px] font-extrabold text-[#111] mb-4 tracking-[-0.01em]">Как получить кэшбэк</p>
          <div className="flex gap-2">
            {[{n:'1', t:'Активируйте', c:'bg-[#FFD500]/10 text-[#B8960A]'}, {n:'2', t:'Оплатите через СБП', c:'bg-sky-50 text-sky-600'}, {n:'3', t:'Получите на Билайн', c:'bg-emerald-50 text-emerald-600'}].map(s => (
              <div key={s.n} className="flex-1 text-center">
                <div className={cn('w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center', s.c)}>
                  <span className="text-[13px] font-extrabold">{s.n}</span>
                </div>
                <p className="text-[10px] text-[#666] leading-tight font-medium">{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-5 mt-5 mb-32">
        <h3 className="text-[16px] font-extrabold text-[#111] mb-3 tracking-[-0.02em]">Условия</h3>
        <p className="text-[13px] text-[#666] leading-relaxed">{offer.description}</p>
        <div className="mt-4 bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
          {[
            ['Минимальный чек', `${parseFloat(offer.min_check).toFixed(0)} \u20BD`],
            ['Макс. за покупку', `${parseFloat(offer.max_cashback_per_tx).toFixed(0)} \u20BD`],
            ['Период', `${new Date(offer.start_date).toLocaleDateString('ru',{day:'numeric',month:'short'})} \u2014 ${new Date(offer.end_date).toLocaleDateString('ru',{day:'numeric',month:'short',year:'numeric'})}`],
            ['Оплата', 'СБП'],
            ['Начисление', 'Счёт Билайн, 1\u20143 дня'],
          ].map(([l, v], i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3.5 border-b border-[#f7f7f7] last:border-0">
              <span className="text-[12px] text-[#999] font-medium">{l}</span>
              <span className="text-[12px] font-bold text-[#333]">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-black/[0.04] px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        {done ? (
          <div className="w-full py-4 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold text-[15px] flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Активирован
          </div>
        ) : (
          <button onClick={handleActivate} disabled={activating}
            className="w-full py-4 rounded-2xl bg-[#FFD500] text-[#111] font-extrabold text-[15px] press-scale disabled:opacity-60 shadow-[0_4px_24px_rgba(255,213,0,0.35)] transition-all">
            {activating ? 'Подключаем...' : 'Активировать кэшбэк'}
          </button>
        )}
      </div>
    </div>
  )
}
