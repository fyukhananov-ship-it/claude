import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { cn } from '@/lib/utils'

const SLOT_ITEMS = [
  { partner: 'Пятёрочка', rate: '10%', desc: 'Кэшбэк на продукты', color: 'from-red-500 to-rose-600' },
  { partner: 'Яндекс Еда', rate: '20%', desc: 'Кэшбэк на доставку', color: 'from-amber-400 to-orange-500' },
  { partner: 'Лента', rate: '7%', desc: 'Кэшбэк на продукты', color: 'from-blue-500 to-indigo-600' },
  { partner: 'Спортмастер', rate: '10%', desc: 'Кэшбэк на спорттовары', color: 'from-emerald-500 to-teal-600' },
  { partner: 'Lime', rate: '15%', desc: 'Кэшбэк на одежду', color: 'from-lime-400 to-green-600' },
  { partner: 'Шоколадница', rate: '15%', desc: 'Кэшбэк в кофейне', color: 'from-amber-600 to-yellow-800' },
  { partner: 'KFC', rate: '15%', desc: 'Кэшбэк на фастфуд', color: 'from-red-600 to-red-800' },
  { partner: 'Кинопоиск', rate: '30%', desc: 'Кэшбэк на подписку', color: 'from-violet-500 to-purple-700' },
  { partner: 'Л\'Этуаль', rate: '12%', desc: 'Кэшбэк на косметику', color: 'from-pink-400 to-fuchsia-600' },
  { partner: 'Лукойл', rate: '5%', desc: 'Кэшбэк на топливо', color: 'from-red-500 to-orange-600' },
  { partner: 'М.Видео', rate: '5%', desc: 'Кэшбэк на технику', color: 'from-sky-500 to-blue-700' },
  { partner: 'Магнит', rate: '300\u20bd', desc: 'Фикс. кэшбэк за покупку', color: 'from-rose-500 to-pink-700' },
]

const ITEM_H = 80
const VISIBLE = 3

export default function SpinWheel() {
  const { phoneHash, offerId } = useParams<{ phoneHash: string; offerId: string }>()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'result'>('idle')
  const [winIdx, setWinIdx] = useState<number | null>(null)
  const [confetti, setConfetti] = useState(false)
  const slotRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)

  const items = [...SLOT_ITEMS, ...SLOT_ITEMS, ...SLOT_ITEMS, ...SLOT_ITEMS]

  // Haptic feedback helper
  const haptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(style === 'light' ? 10 : style === 'heavy' ? 50 : 25)
      }
    } catch {}
  }

  const spin = useCallback(() => {
    if (phase === 'spinning') return
    setPhase('spinning')
    setConfetti(false)
    haptic('medium')

    const win = Math.floor(Math.random() * SLOT_ITEMS.length)
    setWinIdx(win)

    const targetIdx = SLOT_ITEMS.length * 2 + win
    const targetOffset = targetIdx * ITEM_H - ITEM_H * Math.floor(VISIBLE / 2)

    if (slotRef.current) {
      slotRef.current.style.transition = 'none'
      slotRef.current.style.transform = 'translateY(0)'
      void slotRef.current.offsetHeight
      slotRef.current.style.transition = 'transform 3s cubic-bezier(0.15, 0.65, 0.08, 1)'
      slotRef.current.style.transform = `translateY(-${targetOffset}px)`
    }

    // Haptic ticks during spinning
    const ticks = [200, 400, 600, 900, 1200, 1600, 2000, 2400, 2700, 2900]
    ticks.forEach(t => setTimeout(() => haptic('light'), t))

    setTimeout(() => {
      haptic('heavy')
      setPhase('result')
      setConfetti(true)
      // Save winner to localStorage for widget
      const w = SLOT_ITEMS[win]
      localStorage.setItem('clo_slot_result', JSON.stringify({ partner: w.partner, rate: w.rate, color: w.color, desc: w.desc, ts: Date.now() }))
      setTimeout(() => setConfetti(false), 3000)
    }, 3200)
  }, [phase])

  const handleTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current - e.changedTouches[0].clientY > 50) spin()
  }

  const retry = () => { setPhase('idle'); setWinIdx(null) }

  const handleActivate = async () => {
    if (!phoneHash || !offerId) return
    try { await api.post(`/client/${phoneHash}/activate/${offerId}`); navigate(`/client/${phoneHash}/thanks`) } catch {}
  }

  const winner = winIdx !== null ? SLOT_ITEMS[winIdx] : null

  // ── FULLSCREEN RESULT ──
  if (phase === 'result' && winner) {
    return (
      <div className={cn('min-h-screen relative flex flex-col overflow-hidden bg-gradient-to-br', winner.color)}>
        {/* Decorative shapes */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/[0.08]" />
        <div className="absolute top-1/3 -left-16 w-40 h-40 rounded-full bg-black/[0.06]" />
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-white/[0.05]" />
        <div className="absolute bottom-1/4 left-1/4 w-20 h-20 rounded-full bg-black/[0.04]" />

        {/* Confetti */}
        {confetti && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className="absolute animate-[confettiFall_3s_ease-in_forwards]"
                style={{
                  left: `${Math.random() * 100}%`, top: '-20px',
                  animationDelay: `${Math.random() * 1.5}s`,
                  width: `${6 + Math.random() * 10}px`, height: `${6 + Math.random() * 10}px`,
                  background: ['#fff', '#FFD500', '#111', '#fff', '#FFD500', '#fff'][i % 6],
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                  opacity: 0.6 + Math.random() * 0.4,
                }} />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
          {/* Partner avatar */}
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 shadow-2xl">
            <span className="text-[40px] font-extrabold text-white">{winner.partner[0]}</span>
          </div>

          <p className="text-[13px] font-bold text-white/50 uppercase tracking-[0.2em]">Ваш персональный оффер</p>

          <p className="font-mono-cash text-[72px] font-extrabold text-white leading-none mt-4 drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            {winner.rate}
          </p>

          <p className="text-[24px] font-extrabold text-white mt-4">{winner.partner}</p>
          <p className="text-[14px] text-white/60 mt-2 font-medium">{winner.desc}</p>

          {/* How it works */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 mt-8 w-full max-w-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[12px] text-white/70 leading-relaxed">
                Оплатите покупку через СБП. Кэшбэк зачислится на счёт Билайн автоматически.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="relative z-10 px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-4">
          <button onClick={handleActivate}
            className="w-full py-4 rounded-2xl bg-white text-[#111] font-extrabold text-[16px] press-scale shadow-[0_4px_24px_rgba(0,0,0,0.2)] mb-3">
            Активировать кэшбэк
          </button>
          <button onClick={retry}
            className="w-full py-3.5 rounded-2xl bg-white/10 backdrop-blur-sm text-white font-bold text-[14px] press-scale flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Попробовать ещё раз
          </button>
        </div>

        <style>{`@keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }`}</style>
      </div>
    )
  }

  // ── SLOT MACHINE ──
  return (
    <div className="min-h-screen bg-[#0a0a0a] noise-bg relative flex flex-col items-center justify-center px-5 overflow-hidden"
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#FFD500]/[0.05] rounded-full blur-[120px]" />

      {/* Header */}
      <div className="relative z-10 text-center mb-6">
        <h1 className="text-[28px] font-extrabold text-white tracking-[-0.03em]">Крути барабан!</h1>
        <p className="text-white/30 text-[13px] mt-1.5 font-medium">
          {phase === 'spinning' ? 'Выбираем лучшее предложение...' : 'Свайпните вверх или нажмите кнопку'}
        </p>
      </div>

      {/* Slot Machine */}
      <div className="relative z-10 w-full max-w-sm mb-8">
        <div className="bg-[#161618] border border-white/[0.08] rounded-3xl p-4 shadow-[0_0_60px_rgba(255,213,0,0.08)]">
          <div className="relative overflow-hidden rounded-2xl bg-[#0c0c0e]" style={{ height: ITEM_H * VISIBLE }}>
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0c0c0e] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0c0c0e] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 z-20 pointer-events-none" style={{ top: ITEM_H, height: ITEM_H }}>
              <div className="h-full border-y-2 border-[#FFD500]/40 bg-[#FFD500]/[0.04]" />
            </div>

            <div ref={slotRef} className="will-change-transform">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4" style={{ height: ITEM_H }}>
                  <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg', item.color)}>
                    <span className="text-white text-[16px] font-extrabold">{item.partner[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-white truncate">{item.partner}</p>
                    <p className="text-[11px] text-white/40 mt-0.5 font-medium">{item.desc}</p>
                  </div>
                  <span className="font-mono-cash text-[20px] font-extrabold text-[#FFD500] shrink-0">{item.rate}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center mt-3 gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FFD500] animate-pulse" />
            <span className="text-[10px] text-white/20 font-bold uppercase tracking-[0.15em]">
              {phase === 'spinning' ? 'Крутим...' : 'CLO Slot Machine'}
            </span>
            <div className="w-2 h-2 rounded-full bg-[#FFD500] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Spin button */}
      <div className="relative z-10 w-full max-w-sm">
        <button onClick={spin} disabled={phase === 'spinning'}
          className="w-full py-4 rounded-2xl bg-[#FFD500] text-[#111] font-extrabold text-[16px] press-scale disabled:opacity-70 shadow-[0_4px_32px_rgba(255,213,0,0.4)] flex items-center justify-center gap-2">
          {phase === 'spinning' ? (
            <><div className="w-5 h-5 border-[3px] border-[#111]/30 border-t-[#111] rounded-full animate-spin" />Крутим...</>
          ) : (
            <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>Крутить!</>
          )}
        </button>
      </div>
    </div>
  )
}
