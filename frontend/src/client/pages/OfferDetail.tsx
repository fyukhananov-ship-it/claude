import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { cn } from '@/lib/utils'
import { useFavorites } from '@/client/lib/hooks'
import { formatOfferDate, daysUntil, isExpiringSoon, isNewOffer } from '@/client/lib/format'
import { useToast } from '@/client/components/Toast'

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
  const [error, setError] = useState(false)
  const [activating, setActivating] = useState(false)
  const [done, setDone] = useState(false)
  const { has, toggle } = useFavorites()
  const toast = useToast()

  const fetchOffer = () => {
    if (!phoneHash || !offerId) return
    setLoading(true)
    setError(false)
    api.get<OfferData>(`/client/${phoneHash}/offers/${offerId}`)
      .then(o => { setOffer(o); setDone(o.status === 'activated' || o.status === 'cashback_received') })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(fetchOffer, [phoneHash, offerId])

  const handleActivate = async () => {
    if (!phoneHash || !offerId || activating || done) return
    setActivating(true)
    try {
      await api.post(`/client/${phoneHash}/activate/${offerId}`)
      setDone(true)
      toast.show('Оффер активирован! Теперь оплатите через СБП', 'success')
      navigate(`/client/${phoneHash}/thanks`)
    } catch {
      toast.show('Не удалось активировать. Проверьте интернет', 'error')
    } finally {
      setActivating(false)
    }
  }

  const handleShare = async () => {
    if (!offer) return
    const url = window.location.href
    const text = `${offer.partner_name}: кэшбэк ${offer.cashback_type === 'percent' ? (parseFloat(offer.cashback_rate) * 100).toFixed(0) + '%' : parseFloat(offer.cashback_rate).toFixed(0) + ' ₽'} через Билайн`
    if (navigator.share) {
      try { await navigator.share({ title: offer.partner_name, text, url }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); toast.show('Ссылка скопирована', 'success') } catch {}
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-[3px] border-[#FFD500] border-t-transparent rounded-full animate-spin" />
      <p className="text-[13px] text-[#999] font-medium">Загружаем оффер…</p>
    </div>
  )

  if (error || !offer) return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 bg-[#f0f0f0] rounded-full flex items-center justify-center mb-3">
        <svg className="w-7 h-7 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-[14px] text-[#333] font-bold">Оффер не найден</p>
      <p className="text-[12px] text-[#999] mt-1 font-medium text-center max-w-xs">Проверьте интернет-соединение или попробуйте позже</p>
      <div className="flex gap-2 mt-5">
        <button onClick={fetchOffer} className="px-5 py-3 rounded-2xl bg-[#111] text-white font-bold text-[13px] press-scale">Повторить</button>
        <button onClick={() => navigate(`/client/${phoneHash}`)} className="px-5 py-3 rounded-2xl bg-[#FFD500] text-[#111] font-bold text-[13px] press-scale">В каталог</button>
      </div>
    </div>
  )

  const rate = offer.cashback_type === 'percent' ? `${(parseFloat(offer.cashback_rate) * 100).toFixed(0)}%` : `${parseFloat(offer.cashback_rate).toFixed(0)} \u20BD`
  const isFav = has(offer.id)
  const isExpiring = isExpiringSoon(offer.end_date)
  const isNew = isNewOffer(offer.start_date)
  const daysLeft = daysUntil(offer.end_date)

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-black/[0.04] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center press-scale">
          <svg className="w-5 h-5 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-[15px] font-bold text-[#111] truncate flex-1">{offer.partner_name}</span>
        <button onClick={handleShare} className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center press-scale" aria-label="Поделиться">
          <svg className="w-5 h-5 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
        <button onClick={() => toggle(offer.id)} className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center press-scale" aria-label={isFav ? 'Удалить из избранного' : 'В избранное'}>
          {isFav ? (
            <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Hero */}
      <div className="px-5 pt-5">
        <div className={cn('rounded-3xl p-6 relative overflow-hidden noise-bg bg-gradient-to-br', getGrad(offer.partner_name))}>
          {offer.image_url && (
            <img src={offer.image_url} alt={offer.partner_name} className="absolute inset-0 w-full h-full object-cover opacity-30" />
          )}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-8 w-36 h-36 rounded-full bg-black/5" />
          <div className="relative z-10">
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {isNew && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-wider">Новый</span>
              )}
              {isExpiring && (
                <span className="px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold uppercase tracking-wider">Скоро закончится</span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-[22px] font-extrabold text-white shadow-xl">
                {offer.partner_name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white/70 text-[12px] font-bold uppercase tracking-[0.1em]">{offer.partner_name}</p>
                <p className="text-white text-[14px] font-bold leading-tight mt-0.5 line-clamp-2">{offer.name}</p>
              </div>
            </div>
            <p className="text-white/50 text-[12px] font-bold uppercase tracking-[0.15em]">Кэшбэк</p>
            <p className="font-mono-cash text-[52px] font-extrabold text-white leading-none mt-1 drop-shadow-lg">{rate}</p>
            <p className="text-white/60 text-[13px] font-medium mt-2">Макс. {parseFloat(offer.max_cashback_per_tx).toFixed(0)} &#8381; за покупку</p>
          </div>
        </div>
      </div>

      {/* How it works — expanded */}
      <div className="px-5 mt-6">
        <h3 className="text-[16px] font-extrabold text-[#111] mb-3 tracking-[-0.02em]">Как получить кэшбэк</h3>
        <div className="space-y-3">
          {[
            { n: '1', title: 'Активируйте оффер', desc: 'Нажмите кнопку ниже — оффер привяжется к вашему номеру', color: 'from-[#FFD500] to-[#F59E0B]' },
            { n: '2', title: 'Оплатите через СБП', desc: 'Оплата только через Систему быстрых платежей. Другие способы не участвуют', color: 'from-sky-400 to-blue-600' },
            { n: '3', title: 'Получите кэшбэк', desc: 'Кэшбэк автоматически зачислится на счёт Билайн в течение 1–3 дней', color: 'from-emerald-400 to-teal-600' },
          ].map(s => (
            <div key={s.n} className="bg-white rounded-2xl border border-[#f0f0f0] p-4 flex gap-3 items-start">
              <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg', s.color)}>
                <span className="font-mono-cash text-[14px] font-extrabold text-white">{s.n}</span>
              </div>
              <div className="pt-0.5 flex-1">
                <p className="text-[14px] font-extrabold text-[#111]">{s.title}</p>
                <p className="text-[12px] text-[#666] mt-1 leading-relaxed font-medium">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SBP warning */}
      <div className="px-5 mt-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-[12px] text-amber-800 leading-[1.5] font-medium">
            <strong>Важно:</strong> оплата только через СБП. Картой или наличными — кэшбэк не начислится.
          </p>
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
            ['Действует до', `${formatOfferDate(offer.end_date)}${daysLeft > 0 && daysLeft <= 30 ? ` (${daysLeft} дн.)` : ''}`],
            ['Оплата', 'Только СБП'],
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
          <div className="space-y-2">
            <div className="w-full py-4 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold text-[15px] flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Оффер активирован
            </div>
            <button onClick={() => navigate(`/client/${phoneHash}`)}
              className="w-full py-3 rounded-2xl bg-[#f0f0f0] text-[#333] font-bold text-[14px] press-scale">
              Смотреть другие офферы
            </button>
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
