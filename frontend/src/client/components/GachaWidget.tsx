import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'

interface GachaState { pity: number; pity_max: number; total_pulls: number }

export default function GachaWidget({ phoneHash }: { phoneHash: string }) {
  const navigate = useNavigate()
  const [state, setState] = useState<GachaState | null>(null)

  useEffect(() => {
    api.get<GachaState>(`/client/${phoneHash}/gacha`)
      .then(setState)
      .catch(() => {})
  }, [phoneHash])

  const pity = state?.pity ?? 0
  const max = state?.pity_max ?? 10
  const left = max - pity
  const progress = pity / max
  const isClose = progress >= 0.7

  return (
    <div className="px-5 mb-5">
      <button
        onClick={() => navigate(`/client/${phoneHash}/gacha`)}
        className="w-full rounded-[20px] p-4 press-scale text-left overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 40%, #4338CA 100%)' }}
      >
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#7C3AED]/20 blur-xl" />
        <div className="absolute bottom-0 left-12 w-16 h-16 rounded-full bg-[#A855F7]/10 blur-lg" />

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] flex items-center justify-center shrink-0 shadow-lg">
            <span className="text-[22px]">?</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-white tracking-[-0.01em]">Дроп офферов</p>
            <p className="text-[12px] text-white/50 mt-0.5">
              {isClose
                ? `Легендарный через ${left} ${left === 1 ? 'дроп' : left < 5 ? 'дропа' : 'дропов'}!`
                : 'Открой случайный оффер с кэшбэком'
              }
            </p>
            {/* Pity bar */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progress * 100}%`,
                    background: isClose ? 'linear-gradient(90deg, #F59E0B, #FCD34D)' : 'linear-gradient(90deg, #7C3AED, #A855F7)',
                  }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-white/40">{pity}/{max}</span>
            </div>
          </div>
          <svg className="w-5 h-5 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
  )
}
