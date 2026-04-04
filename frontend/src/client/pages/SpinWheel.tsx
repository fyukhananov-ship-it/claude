import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { cn } from '@/lib/utils'

const SLOT_ITEMS = [
  { partner: 'Пятёрочка', rate: '10%', color: 'from-red-500 to-rose-600' },
  { partner: 'Яндекс Еда', rate: '20%', color: 'from-amber-400 to-orange-500' },
  { partner: 'Лента', rate: '7%', color: 'from-blue-500 to-indigo-600' },
  { partner: 'Спортмастер', rate: '10%', color: 'from-emerald-500 to-teal-600' },
  { partner: 'Lime', rate: '15%', color: 'from-lime-400 to-green-600' },
  { partner: 'Шоколадница', rate: '15%', color: 'from-amber-600 to-yellow-800' },
  { partner: 'KFC', rate: '15%', color: 'from-red-600 to-red-800' },
  { partner: 'Кинопоиск', rate: '30%', color: 'from-violet-500 to-purple-700' },
  { partner: 'Л\'Этуаль', rate: '12%', color: 'from-pink-400 to-fuchsia-600' },
  { partner: 'Лукойл', rate: '5%', color: 'from-red-500 to-orange-600' },
  { partner: 'М.Видео', rate: '5%', color: 'from-sky-500 to-blue-700' },
  { partner: 'Магнит', rate: '300\u20bd', color: 'from-rose-500 to-pink-700' },
]

const ITEM_H = 80 // px per slot item
const VISIBLE = 3 // visible items in window

export default function SpinWheel() {
  const { phoneHash, offerId } = useParams<{ phoneHash: string; offerId: string }>()
  const navigate = useNavigate()
  const [spinning, setSpinning] = useState(false)
  const [winIdx, setWinIdx] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const slotRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)

  // Repeat items for seamless loop
  const items = [...SLOT_ITEMS, ...SLOT_ITEMS, ...SLOT_ITEMS, ...SLOT_ITEMS]

  const spin = useCallback(() => {
    if (spinning) return
    setSpinning(true)
    setShowResult(false)
    setConfetti(false)

    const win = Math.floor(Math.random() * SLOT_ITEMS.length)
    setWinIdx(win)

    // Target: land on win index in the 3rd repetition (center of visible window)
    const targetIdx = SLOT_ITEMS.length * 2 + win
    const targetOffset = targetIdx * ITEM_H - ITEM_H * Math.floor(VISIBLE / 2)

    if (slotRef.current) {
      // Reset to top instantly
      slotRef.current.style.transition = 'none'
      slotRef.current.style.transform = 'translateY(0)'

      // Force reflow
      void slotRef.current.offsetHeight

      // Animate to target
      slotRef.current.style.transition = 'transform 3s cubic-bezier(0.15, 0.65, 0.08, 1)'
      slotRef.current.style.transform = `translateY(-${targetOffset}px)`
    }

    setTimeout(() => {
      setSpinning(false)
      setShowResult(true)
      setConfetti(true)
      setTimeout(() => setConfetti(false), 3000)
    }, 3200)
  }, [spinning])

  // Touch swipe to spin
  const handleTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY
    if (dy > 50) spin() // swipe up
  }

  const winner = winIdx !== null ? SLOT_ITEMS[winIdx] : null

  const handleActivate = async () => {
    if (!phoneHash || !offerId) return
    try { await api.post(`/client/${phoneHash}/activate/${offerId}`); navigate(`/client/${phoneHash}/thanks`) } catch {}
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] noise-bg relative flex flex-col items-center justify-center px-5 overflow-hidden"
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

      {/* Ambient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#FFD500]/[0.05] rounded-full blur-[120px]" />

      {/* Confetti */}
      {confetti && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="absolute animate-[confettiFall_2.5s_ease-in_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 1}s`,
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                background: ['#FFD500', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'][i % 6],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 text-center mb-6">
        <h1 className="text-[28px] font-extrabold text-white tracking-[-0.03em]">
          {showResult ? 'Поздравляем!' : 'Крути барабан!'}
        </h1>
        <p className="text-white/30 text-[13px] mt-1.5 font-medium">
          {showResult ? 'Ваш персональный оффер' : 'Свайпните вверх или нажмите кнопку'}
        </p>
      </div>

      {/* Slot Machine */}
      <div className="relative z-10 w-full max-w-sm mb-8">
        {/* Machine frame */}
        <div className="bg-[#161618] border border-white/[0.08] rounded-3xl p-4 shadow-[0_0_60px_rgba(255,213,0,0.08)]">
          {/* Slot window */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0c0c0e]"
            style={{ height: ITEM_H * VISIBLE }}>

            {/* Gradient overlays for depth */}
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0c0c0e] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0c0c0e] to-transparent z-10 pointer-events-none" />

            {/* Center indicator line */}
            <div className="absolute inset-x-0 z-20 pointer-events-none" style={{ top: ITEM_H, height: ITEM_H }}>
              <div className="h-full border-y-2 border-[#FFD500]/40 bg-[#FFD500]/[0.04]" />
            </div>

            {/* Scrolling items */}
            <div ref={slotRef} className="will-change-transform">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4" style={{ height: ITEM_H }}>
                  <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg', item.color)}>
                    <span className="text-white text-[16px] font-extrabold">{item.partner[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-white truncate">{item.partner}</p>
                    <p className="text-[11px] text-white/40 mt-0.5 font-medium">Кэшбэк на счёт Билайн</p>
                  </div>
                  <div className="shrink-0">
                    <span className="font-mono-cash text-[20px] font-extrabold text-[#FFD500]">{item.rate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Machine label */}
          <div className="flex items-center justify-center mt-3 gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FFD500] animate-pulse" />
            <span className="text-[10px] text-white/20 font-bold uppercase tracking-[0.15em]">
              {spinning ? 'Выбираем лучшее...' : showResult ? 'Готово!' : 'CLO Slot Machine'}
            </span>
            <div className="w-2 h-2 rounded-full bg-[#FFD500] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom area */}
      <div className="relative z-10 w-full max-w-sm">
        {showResult && winner ? (
          <div className="animate-stagger">
            {/* Winner card */}
            <div className={cn('rounded-3xl p-6 mb-4 relative overflow-hidden bg-gradient-to-br', winner.color)}>
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -left-6 w-24 h-24 rounded-full bg-black/10" />
              <div className="relative z-10">
                <p className="text-[11px] font-bold text-white/60 uppercase tracking-[0.15em]">Ваш кэшбэк</p>
                <p className="font-mono-cash text-[48px] font-extrabold text-white leading-none mt-2 drop-shadow-lg">{winner.rate}</p>
                <p className="text-[16px] font-bold text-white/90 mt-3">{winner.partner}</p>
                <p className="text-[12px] text-white/50 mt-1">Оплатите через СБП и получите кэшбэк</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => { setShowResult(false); setWinIdx(null) }}
                className="flex-1 py-3.5 rounded-2xl border border-white/10 text-white/60 font-bold text-[14px] press-scale flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Ещё раз
              </button>
              <button onClick={handleActivate}
                className="flex-1 py-3.5 rounded-2xl bg-[#FFD500] text-[#111] font-extrabold text-[14px] press-scale shadow-[0_4px_24px_rgba(255,213,0,0.35)]">
                Активировать
              </button>
            </div>
          </div>
        ) : (
          <button onClick={spin} disabled={spinning}
            className="w-full py-4 rounded-2xl bg-[#FFD500] text-[#111] font-extrabold text-[16px] press-scale disabled:opacity-70 shadow-[0_4px_32px_rgba(255,213,0,0.4)] flex items-center justify-center gap-2">
            {spinning ? (
              <><div className="w-5 h-5 border-[3px] border-[#111]/30 border-t-[#111] rounded-full animate-spin" />Крутим...</>
            ) : (
              <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>Крутить!</>
            )}
          </button>
        )}
      </div>

      {/* Confetti keyframes */}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
