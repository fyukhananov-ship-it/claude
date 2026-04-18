import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { cn } from '@/lib/utils'

interface PullResult {
  offer: {
    id: string; name: string; partner_name: string
    cashback_type: string; cashback_rate: string; image_url: string | null
  }
  rarity: 'legendary' | 'epic' | 'rare' | 'common'
  pity: number; pity_max: number; is_pity: boolean; total_pulls: number
}

const RARITY_CONFIG = {
  legendary: { label: 'ЛЕГЕНДАРНЫЙ', color: '#F59E0B', glow: '#FCD34D', bg: 'from-[#78350F] via-[#92400E] to-[#F59E0B]', ring: 'ring-[#F59E0B]', particles: '#FCD34D' },
  epic:      { label: 'ЭПИЧЕСКИЙ', color: '#A855F7', glow: '#C084FC', bg: 'from-[#3B0764] via-[#581C87] to-[#7C3AED]', ring: 'ring-[#A855F7]', particles: '#C084FC' },
  rare:      { label: 'РЕДКИЙ', color: '#3B82F6', glow: '#60A5FA', bg: 'from-[#1E3A5F] via-[#1E40AF] to-[#3B82F6]', ring: 'ring-[#3B82F6]', particles: '#60A5FA' },
  common:    { label: 'ОБЫЧНЫЙ', color: '#6B7280', glow: '#9CA3AF', bg: 'from-[#374151] via-[#4B5563] to-[#6B7280]', ring: 'ring-[#6B7280]', particles: '#9CA3AF' },
}

function fmtRate(o: PullResult['offer']) {
  return o.cashback_type === 'percent'
    ? `${(parseFloat(o.cashback_rate) * 100).toFixed(0)}%`
    : `${parseFloat(o.cashback_rate).toFixed(0)} \u20BD`
}

function Particles({ color, count = 30 }: { color: string; count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const x = Math.random() * 100
        const delay = Math.random() * 0.8
        const dur = 1.5 + Math.random() * 1
        const size = 3 + Math.random() * 5
        return (
          <div
            key={i}
            className="absolute rounded-full animate-[gacha-particle_var(--dur)_var(--delay)_ease-out_forwards] opacity-0"
            style={{
              left: `${x}%`,
              bottom: '40%',
              width: size,
              height: size,
              background: color,
              '--delay': `${delay}s`,
              '--dur': `${dur}s`,
            } as React.CSSProperties}
          />
        )
      })}
    </div>
  )
}

export default function GachaPull() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'ready' | 'pulling' | 'reveal' | 'result'>('ready')
  const [gachaState, setGachaState] = useState({ pity: 0, pity_max: 10, total_pulls: 0 })
  const [result, setResult] = useState<PullResult | null>(null)
  const [pulling, setPulling] = useState(false)
  const pullBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!phoneHash) return
    api.get<{ pity: number; pity_max: number; total_pulls: number }>(`/client/${phoneHash}/gacha`)
      .then(setGachaState)
      .catch(() => {})
  }, [phoneHash])

  const doPull = async () => {
    if (!phoneHash || pulling) return
    setPulling(true)
    setPhase('pulling')

    try {
      const res = await api.post<PullResult>(`/client/${phoneHash}/gacha/pull`)
      setResult(res)
      setTimeout(() => setPhase('reveal'), 1200)
      setTimeout(() => setPhase('result'), 2200)
      setGachaState({ pity: res.pity, pity_max: res.pity_max, total_pulls: res.total_pulls })
    } catch {
      setPhase('ready')
    } finally {
      setPulling(false)
    }
  }

  const rc = result ? RARITY_CONFIG[result.rarity] : RARITY_CONFIG.common
  const pityProgress = gachaState.pity / gachaState.pity_max
  const pullsUntilPity = gachaState.pity_max - gachaState.pity

  return (
    <div className="min-h-screen bg-[#0A0A0C] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full opacity-20 blur-[100px] transition-colors duration-1000"
          style={{ background: phase === 'result' && result ? rc.glow : '#7C3AED' }} />
      </div>

      {/* Back button */}
      <div className="relative z-20 px-5 pt-[max(52px,env(safe-area-inset-top,52px))]">
        <button onClick={() => navigate(`/client/${phoneHash}`)}
          className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center press-scale">
          <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center px-5 pt-8">
        {/* Title */}
        <h1 className="text-[24px] font-extrabold text-white tracking-[-0.03em] text-center">Дроп офферов</h1>
        <p className="text-[13px] text-white/50 mt-1 text-center">Получи случайный оффер с кэшбэком</p>

        {/* Pity counter */}
        <div className="mt-6 w-full max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.1em]">До гарантированного</span>
            <span className="text-[12px] font-bold text-[#F59E0B]">{pullsUntilPity} из {gachaState.pity_max}</span>
          </div>
          <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${pityProgress * 100}%`,
                background: pityProgress >= 0.8 ? 'linear-gradient(90deg, #F59E0B, #FCD34D)' : 'linear-gradient(90deg, #7C3AED, #A855F7)',
              }}
            />
          </div>
          {pityProgress >= 0.8 && (
            <p className="text-[11px] text-[#F59E0B] font-semibold mt-1.5 text-center animate-pulse">
              Легендарный оффер уже близко!
            </p>
          )}
        </div>

        {/* Pull area */}
        <div className="mt-10 relative w-[220px] h-[220px] flex items-center justify-center">
          {phase === 'ready' && (
            <div className="w-[180px] h-[180px] rounded-[40px] bg-gradient-to-br from-[#7C3AED]/30 to-[#4C1D95]/30 border-2 border-[#7C3AED]/30 flex items-center justify-center animate-pulse">
              <span className="text-[64px]">?</span>
            </div>
          )}

          {phase === 'pulling' && (
            <div className="w-[180px] h-[180px] rounded-[40px] bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {(phase === 'reveal' || phase === 'result') && result && (
            <>
              {phase === 'result' && <Particles color={rc.particles} />}
              <div className={cn(
                'w-[180px] h-[180px] rounded-[40px] overflow-hidden border-4 transition-all duration-700',
                phase === 'reveal' ? 'scale-90 opacity-50' : 'scale-100 opacity-100',
                phase === 'result' && `ring-4 ${rc.ring} ring-offset-4 ring-offset-[#0A0A0C]`,
              )}
                style={{ borderColor: rc.color }}
              >
                {result.offer.image_url ? (
                  <img src={result.offer.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', rc.bg)}>
                    <span className="text-[48px] font-extrabold text-white/30">{result.offer.partner_name[0]}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Result info */}
        {phase === 'result' && result && (
          <div className="mt-6 text-center animate-[fade-in-up_0.5s_ease-out]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
              style={{ background: `${rc.color}20`, border: `1px solid ${rc.color}40` }}>
              <div className="w-2 h-2 rounded-full" style={{ background: rc.color }} />
              <span className="text-[11px] font-extrabold uppercase tracking-[0.1em]" style={{ color: rc.color }}>
                {rc.label}
                {result.is_pity && ' — ГАРАНТ!'}
              </span>
            </div>
            <p className="text-[13px] text-white/50 font-medium">{result.offer.partner_name}</p>
            <p className="text-[18px] font-bold text-white mt-1 tracking-[-0.02em]">{result.offer.name}</p>
            <p className="font-mono-cash text-[36px] font-extrabold mt-2 leading-none" style={{ color: rc.color }}>
              {fmtRate(result.offer)}
            </p>
            <p className="text-[12px] text-white/40 mt-1">кэшбэк активирован</p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => navigate(`/client/${phoneHash}/offer/${result.offer.id}`)}
                className="flex-1 py-3 rounded-full bg-white text-[#0A0A0C] font-bold text-[13px] press-scale"
              >
                Смотреть оффер
              </button>
              <button
                onClick={() => { setResult(null); setPhase('ready') }}
                className="flex-1 py-3 rounded-full border border-white/20 text-white font-bold text-[13px] press-scale"
              >
                Ещё раз
              </button>
            </div>
          </div>
        )}

        {/* Pull button */}
        {phase === 'ready' && (
          <button
            ref={pullBtnRef}
            onClick={doPull}
            disabled={pulling}
            className="mt-10 w-full max-w-xs py-4 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white font-bold text-[15px] press-scale disabled:opacity-50 shadow-[0_4px_32px_rgba(124,58,237,0.4)]"
          >
            Открыть дроп
          </button>
        )}

        {/* Stats */}
        <p className="text-[11px] text-white/20 mt-6">
          Всего открыто: {gachaState.total_pulls}
        </p>
      </div>

      {/* CSS for particles */}
      <style>{`
        @keyframes gacha-particle {
          0% { opacity: 0; transform: translateY(0) scale(0); }
          20% { opacity: 1; transform: translateY(-20px) scale(1); }
          100% { opacity: 0; transform: translateY(-200px) translateX(${Math.random() > 0.5 ? '' : '-'}${20 + Math.random() * 60}px) scale(0.3); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
