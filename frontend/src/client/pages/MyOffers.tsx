import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import TabBar from '@/client/components/TabBar'

interface ActivatedOffer {
  id: string
  partner_name: string
  name: string
  cashback_type: string
  cashback_rate: string
  image_url: string | null
  status: string
}

const tints = [
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#FEE2E2', text: '#991B1B' },
  { bg: '#EDE9FE', text: '#5B21B6' },
  { bg: '#DBEAFE', text: '#1E40AF' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#FCE7F3', text: '#9F1239' },
]

function tint(s: string) { return tints[s.charCodeAt(0) % tints.length] }

function fmtRate(o: ActivatedOffer) {
  return o.cashback_type === 'percent'
    ? `${(parseFloat(o.cashback_rate) * 100).toFixed(0)}%`
    : `${parseFloat(o.cashback_rate).toFixed(0)} \u20BD`
}

export default function MyOffers() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()
  const [offers, setOffers] = useState<ActivatedOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [spinResult, setSpinResult] = useState<{ partner: string; rate: string } | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('clo_slot_result')
      if (raw) setSpinResult(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    if (!phoneHash) return
    api.get<ActivatedOffer[]>(`/client/${phoneHash}/offers`)
      .then(all => {
        setOffers(all.filter(o => o.status === 'activated' || o.status === 'cashback_received'))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [phoneHash])

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <div className="bg-white px-5 pt-[max(52px,env(safe-area-inset-top,52px))] pb-4 border-b border-[#F0F0F0]">
        <h1 className="text-[24px] font-extrabold text-[#1C1917] tracking-[-0.03em]">Мои офферы</h1>
        <p className="text-[13px] text-[#9CA3AF] mt-0.5">Активированные предложения</p>
      </div>

      <div className="px-5 py-5 pb-28">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : offers.length === 0 && !spinResult ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-[#F5F6F8] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <p className="text-[15px] font-bold text-[#1C1917]">Пока нет активаций</p>
            <p className="text-[13px] text-[#9CA3AF] mt-1">Активируйте офферы в каталоге</p>
            <button
              onClick={() => navigate(`/client/${phoneHash}`)}
              className="mt-4 px-5 py-2.5 rounded-full bg-[#1C1917] text-white font-bold text-[13px] press-scale"
            >
              К офферам
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Spin wheel result */}
            {spinResult && (
              <div className="bg-white rounded-[16px] p-3.5 flex items-center gap-3.5 shadow-card">
                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #4C1D95)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#1C1917] truncate">{spinResult.partner}</p>
                  <p className="text-[12px] text-[#6B7280] mt-0.5">Выигрыш в колесе фортуны</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono-cash text-[20px] font-extrabold text-[#7C3AED] leading-none">{spinResult.rate}</p>
                  <p className="text-[9px] text-[#9CA3AF] font-medium mt-0.5">кэшбэк</p>
                </div>
              </div>
            )}

            {offers.map(o => {
              const t = tint(o.partner_name)
              return (
                <button
                  key={o.id}
                  onClick={() => navigate(`/client/${phoneHash}/offer/${o.id}`)}
                  className="w-full bg-white rounded-[16px] p-3.5 flex items-center gap-3.5 press-scale text-left shadow-card"
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 relative">
                    {o.image_url ? (
                      <img src={o.image_url} alt={o.partner_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: t.bg }}>
                        <span className="text-[20px] font-extrabold" style={{ color: t.text }}>{o.partner_name[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#1C1917] truncate">{o.partner_name}</p>
                    <p className="text-[12px] text-[#6B7280] mt-0.5 truncate">{o.name}</p>
                    {o.status === 'cashback_received' && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">Кэшбэк получен</span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono-cash text-[20px] font-extrabold text-[#1C1917] leading-none">{fmtRate(o)}</p>
                    <p className="text-[9px] text-[#9CA3AF] font-medium mt-0.5">кэшбэк</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <TabBar active="my" />
    </div>
  )
}
