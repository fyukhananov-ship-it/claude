import { useState, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { cn } from '@/lib/utils'

interface Prize {
  partner: string
  rate: string
  desc: string
  color: string
  textColor: string
}

const PRIZES: Prize[] = [
  { partner: 'Пятёрочка',   rate: '10%',  desc: 'Кэшбэк на продукты',      color: '#FCA5A5', textColor: '#7F1D1D' },
  { partner: 'Яндекс Еда',  rate: '20%',  desc: 'Кэшбэк на доставку',      color: '#FDBA74', textColor: '#7C2D12' },
  { partner: 'Лента',       rate: '7%',   desc: 'Кэшбэк на продукты',      color: '#FDE68A', textColor: '#78350F' },
  { partner: 'Спортмастер', rate: '10%',  desc: 'Кэшбэк на спорттовары',   color: '#BEF264', textColor: '#365314' },
  { partner: 'Lime',        rate: '15%',  desc: 'Кэшбэк на одежду',        color: '#6EE7B7', textColor: '#064E3B' },
  { partner: 'Шоколадница', rate: '15%',  desc: 'Кэшбэк в кофейне',        color: '#5EEAD4', textColor: '#134E4A' },
  { partner: 'KFC',         rate: '15%',  desc: 'Кэшбэк на фастфуд',       color: '#7DD3FC', textColor: '#0C4A6E' },
  { partner: 'Кинопоиск',   rate: '30%',  desc: 'Кэшбэк на подписку',      color: '#A5B4FC', textColor: '#312E81' },
  { partner: "Л'Этуаль",    rate: '12%',  desc: 'Кэшбэк на косметику',     color: '#C4B5FD', textColor: '#4C1D95' },
  { partner: 'Лукойл',      rate: '5%',   desc: 'Кэшбэк на топливо',       color: '#F0ABFC', textColor: '#701A75' },
  { partner: 'М.Видео',     rate: '5%',   desc: 'Кэшбэк на технику',       color: '#FDA4AF', textColor: '#881337' },
  { partner: 'Магнит',      rate: '300₽', desc: 'Фикс. кэшбэк',             color: '#FCD34D', textColor: '#78350F' },
]

const SEGMENTS = PRIZES.length
const SEG_ANGLE = 360 / SEGMENTS
const WHEEL_SIZE = 340
const R = WHEEL_SIZE / 2
const CX = R
const CY = R

// Build SVG path for a sector
function sectorPath(i: number) {
  const start = (i * SEG_ANGLE - 90) * (Math.PI / 180)
  const end = ((i + 1) * SEG_ANGLE - 90) * (Math.PI / 180)
  const x1 = CX + R * Math.cos(start)
  const y1 = CY + R * Math.sin(start)
  const x2 = CX + R * Math.cos(end)
  const y2 = CY + R * Math.sin(end)
  return `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`
}

// Position for text inside sector
function textPos(i: number) {
  const angle = (i * SEG_ANGLE + SEG_ANGLE / 2 - 90) * (Math.PI / 180)
  const r = R * 0.62
  return {
    x: CX + r * Math.cos(angle),
    y: CY + r * Math.sin(angle),
    rotation: i * SEG_ANGLE + SEG_ANGLE / 2,
  }
}

export default function SpinWheel() {
  const { phoneHash, offerId } = useParams<{ phoneHash: string; offerId: string }>()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'result'>('idle')
  const [winIdx, setWinIdx] = useState<number | null>(null)
  const [confetti, setConfetti] = useState(false)
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef<SVGGElement>(null)

  const haptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(style === 'light' ? 8 : style === 'heavy' ? 40 : 20)
      }
    } catch {}
  }

  const spin = useCallback(() => {
    if (phase === 'spinning') return
    setPhase('spinning')
    setConfetti(false)
    haptic('medium')

    const win = Math.floor(Math.random() * SEGMENTS)
    setWinIdx(win)

    // Target angle: pointer is at top (0°), sector i center is at (i*30 + 15)°
    // To bring sector i under pointer, we rotate wheel by -(i*30 + 15) + full rotations
    const finalAngle = 360 * 6 - (win * SEG_ANGLE + SEG_ANGLE / 2)
    setRotation(finalAngle)

    // Haptic ticks
    const ticks = [300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700, 3000]
    ticks.forEach(t => setTimeout(() => haptic('light'), t))

    setTimeout(() => {
      haptic('heavy')
      setPhase('result')
      setConfetti(true)
      const w = PRIZES[win]
      localStorage.setItem('clo_slot_result', JSON.stringify({
        partner: w.partner,
        rate: w.rate,
        color: 'from-violet-500 to-purple-700',
        desc: w.desc,
        ts: Date.now(),
      }))
      setTimeout(() => setConfetti(false), 3500)
    }, 4000)
  }, [phase])

  const retry = () => {
    setPhase('idle')
    setWinIdx(null)
    setRotation(prev => prev % 360) // keep final angle but reset to same modulo
  }

  const handleActivate = async () => {
    if (!phoneHash || !offerId) return
    try {
      await api.post(`/client/${phoneHash}/activate/${offerId}`)
      navigate(`/client/${phoneHash}/thanks`)
    } catch {}
  }

  const winner = winIdx !== null ? PRIZES[winIdx] : null

  // Memoize sector paths once
  const sectors = useMemo(() => PRIZES.map((p, i) => ({
    path: sectorPath(i),
    fill: p.color,
    text: textPos(i),
    rate: p.rate,
    partner: p.partner,
    textColor: p.textColor,
  })), [])

  return (
    <div
      className="min-h-screen relative flex flex-col overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at top, #FFF5F7 0%, #FCE7F3 30%, #F3E8FF 70%, #E0E7FF 100%)',
      }}
    >
      {/* Floating soft blobs */}
      <div className="absolute top-[10%] -left-16 w-52 h-52 rounded-full bg-gradient-to-br from-pink-200 to-transparent blur-3xl opacity-60" />
      <div className="absolute top-[45%] -right-20 w-64 h-64 rounded-full bg-gradient-to-bl from-violet-200 to-transparent blur-3xl opacity-50" />
      <div className="absolute bottom-[10%] left-[20%] w-44 h-44 rounded-full bg-gradient-to-t from-yellow-100 to-transparent blur-3xl opacity-60" />

      {/* Close button */}
      <button
        onClick={() => navigate(`/client/${phoneHash}`)}
        className="absolute top-[max(16px,env(safe-area-inset-top,16px))] right-4 z-40 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center press-scale shadow-card"
        aria-label="Закрыть"
      >
        <svg className="w-5 h-5 text-[#0A0A0C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Confetti */}
      {confetti && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-[confettiFall_3.5s_ease-in_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 1.5}s`,
                width: `${6 + Math.random() * 10}px`,
                height: `${6 + Math.random() * 10}px`,
                background: ['#FBBF24', '#F472B6', '#A78BFA', '#60A5FA', '#34D399', '#FB7185'][i % 6],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                opacity: 0.8 + Math.random() * 0.2,
              }}
            />
          ))}
        </div>
      )}

      {/* ─── RESULT OVERLAY ─── */}
      {phase === 'result' && winner ? (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 pt-[max(60px,env(safe-area-inset-top,60px))]">
          <div className="text-center mb-2 animate-[bounce-in_0.6s_ease-out]">
            <p className="text-[12px] font-extrabold text-[#6B7280] uppercase tracking-[0.2em]">Поздравляем!</p>
          </div>

          {/* Prize card */}
          <div
            className="w-full max-w-[340px] rounded-[28px] p-6 shadow-hero relative overflow-hidden animate-[bounce-in_0.7s_ease-out]"
            style={{
              background: `linear-gradient(160deg, ${winner.color} 0%, #FFFFFF 100%)`,
            }}
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/40 blur-2xl" />
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center mx-auto mb-4 shadow-card">
                <span className="text-[32px] font-extrabold" style={{ color: winner.textColor }}>{winner.partner[0]}</span>
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.15em]" style={{ color: winner.textColor }}>
                Ваш кэшбэк
              </p>
              <p className="font-mono-cash text-[76px] font-extrabold leading-none mt-2" style={{ color: winner.textColor }}>
                {winner.rate}
              </p>
              <p className="text-[20px] font-extrabold text-[#0A0A0C] mt-3">{winner.partner}</p>
              <p className="text-[13px] text-[#6B7280] mt-1 font-medium">{winner.desc}</p>
            </div>
          </div>

          {/* How it works hint */}
          <div className="mt-5 bg-white/70 backdrop-blur-md rounded-2xl px-4 py-3 max-w-[340px] shadow-card flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFDC00] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#0A0A0C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-[12px] text-[#6B7280] font-medium leading-tight">
              Оплатите через СБП — кэшбэк автоматически зачислится на счёт
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="relative z-10 text-center pt-[max(60px,env(safe-area-inset-top,60px))] px-5">
            <div className="inline-block text-[36px] mb-1 animate-[wiggle_2s_ease-in-out_infinite]">🎡</div>
            <h1 className="text-[28px] font-extrabold text-[#0A0A0C] tracking-[-0.03em]">Колесо удачи</h1>
            <p className="text-[#6B7280] text-[13px] mt-1 font-medium">
              {phase === 'spinning' ? 'Крутим…' : 'Выиграйте до 30% кэшбэка'}
            </p>
          </div>

          {/* Wheel */}
          <div className="relative z-10 flex-1 flex items-center justify-center px-5">
            <div className="relative" style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
              {/* Outer glow ring */}
              <div
                className="absolute inset-[-8px] rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, #FCA5A5, #FDBA74, #FDE68A, #BEF264, #6EE7B7, #5EEAD4, #7DD3FC, #A5B4FC, #C4B5FD, #F0ABFC, #FDA4AF, #FCA5A5)',
                  filter: 'blur(24px)',
                  opacity: 0.4,
                }}
              />

              {/* Wheel SVG */}
              <svg
                width={WHEEL_SIZE}
                height={WHEEL_SIZE}
                viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
                className="relative drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
              >
                {/* Outer white ring */}
                <circle cx={CX} cy={CY} r={R} fill="white" />
                {/* Inner circle with padding */}
                <g
                  ref={wheelRef}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: `${CX}px ${CY}px`,
                    transition: phase === 'spinning' ? 'transform 4s cubic-bezier(0.18, 0.68, 0.12, 1)' : 'none',
                  }}
                >
                  <circle cx={CX} cy={CY} r={R - 8} fill="white" />
                  {sectors.map((s, i) => (
                    <g key={i}>
                      <path
                        d={sectorPath(i)}
                        fill={s.fill}
                        stroke="white"
                        strokeWidth={3}
                        style={{ filter: 'brightness(1.02)' }}
                      />
                      <text
                        x={s.text.x}
                        y={s.text.y}
                        transform={`rotate(${s.text.rotation} ${s.text.x} ${s.text.y})`}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={s.textColor}
                        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 800 }}
                      >
                        {s.rate}
                      </text>
                      <text
                        x={s.text.x}
                        y={s.text.y + 18}
                        transform={`rotate(${s.text.rotation} ${s.text.x} ${s.text.y})`}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={s.textColor}
                        opacity={0.75}
                        style={{ fontFamily: 'Manrope, sans-serif', fontSize: 9, fontWeight: 700 }}
                      >
                        {s.partner.length > 10 ? s.partner.slice(0, 10) + '…' : s.partner}
                      </text>
                    </g>
                  ))}
                </g>

                {/* Outer decorative dots */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 15 - 90) * (Math.PI / 180)
                  const dotR = R - 2
                  const x = CX + dotR * Math.cos(angle)
                  const y = CY + dotR * Math.sin(angle)
                  return <circle key={i} cx={x} cy={y} r={2.5} fill="#FFDC00" />
                })}
              </svg>

              {/* Center hub with Spin button */}
              <button
                onClick={spin}
                disabled={phase === 'spinning'}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white shadow-float flex items-center justify-center press-scale disabled:opacity-90 z-10 group"
                aria-label="Крутить"
              >
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-[#FFDC00] to-[#F59E0B] flex items-center justify-center">
                  {phase === 'spinning' ? (
                    <div className="w-6 h-6 border-[3px] border-[#0A0A0C]/30 border-t-[#0A0A0C] rounded-full animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-[13px] font-extrabold text-[#0A0A0C] leading-none tracking-tight">SPIN</span>
                      <svg className="w-3 h-3 text-[#0A0A0C] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 3l2.5 5 5.5.8-4 3.9.9 5.5L10 15.5 5.1 18.2l.9-5.5L2 8.8l5.5-.8L10 3z" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              {/* Pointer at top */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-2 z-20">
                <div className="relative">
                  <svg width="32" height="40" viewBox="0 0 32 40" className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
                    <path d="M16 38 L2 8 Q16 0 30 8 Z" fill="#0A0A0C" />
                    <path d="M16 36 L4 10 Q16 3 28 10 Z" fill="#FFDC00" />
                    <circle cx={16} cy={10} r={3} fill="#0A0A0C" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Info + CTA */}
          <div className="relative z-10 px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-4">
            <button
              onClick={spin}
              disabled={phase === 'spinning'}
              className="w-full py-4 rounded-full bg-[#0A0A0C] text-white font-extrabold text-[16px] press-scale disabled:opacity-70 shadow-float flex items-center justify-center gap-2"
            >
              {phase === 'spinning' ? 'Крутим...' : '🎯 Крутить колесо'}
            </button>
            <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-[#6B7280] font-medium">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-[#FFDC00]" />
                <span>Раз в сутки</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-[#FFDC00]" />
                <span>До 30% кэшбэка</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-[#FFDC00]" />
                <span>Бесплатно</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom CTA in result state */}
      {phase === 'result' && winner && (
        <div className="relative z-20 px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-4 space-y-3">
          <button
            onClick={handleActivate}
            className="w-full py-4 rounded-full bg-[#FFDC00] text-[#0A0A0C] font-extrabold text-[16px] press-scale shadow-float"
          >
            Активировать кэшбэк
          </button>
          <button
            onClick={retry}
            className="w-full py-3.5 rounded-full bg-white/70 backdrop-blur-md text-[#0A0A0C] font-bold text-[14px] press-scale shadow-card flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Попробовать ещё раз
          </button>
        </div>
      )}

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.8); }
          60% { opacity: 1; transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
