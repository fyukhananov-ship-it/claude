import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'clo_onboarding_seen'

interface Story {
  bg: string
  image?: string
  icon: string
  title: string
  description: string
  accent: string
}

const stories: Story[] = [
  {
    bg: 'from-[#111] via-[#1a1a2e] to-[#111]',
    image: '/claude/assets/onboarding/welcome.jpg',
    icon: '🎁',
    title: 'Добро пожаловать\nв Билайн Кэшбэк',
    description: 'Получайте кэшбэк до 30% за покупки\nу партнёров — деньги вернутся\nна ваш счёт Билайн',
    accent: '#FFD500',
  },
  {
    bg: 'from-[#0f172a] via-[#1e293b] to-[#0f172a]',
    image: '/claude/assets/onboarding/how-it-works.jpg',
    icon: '📱',
    title: 'Как это работает?',
    description: 'Выберите оффер → оплатите покупку\nчерез СБП → кэшбэк начислится\nавтоматически в течение 3 дней',
    accent: '#38bdf8',
  },
  {
    bg: 'from-[#1a0a2e] via-[#2d1b4e] to-[#1a0a2e]',
    image: '/claude/assets/onboarding/categories.jpg',
    icon: '🛍️',
    title: '90+ партнёров\nв 12 категориях',
    description: 'Продукты, рестораны, одежда, техника,\nспорт, путешествия — кэшбэк\nна всё, что вы любите',
    accent: '#c084fc',
  },
  {
    bg: 'from-[#1a2e0a] via-[#1b4e2d] to-[#0a2e1a]',
    image: '/claude/assets/onboarding/spin.jpg',
    icon: '🎰',
    title: 'Крутите барабан —\nвыигрывайте больше!',
    description: 'Испытайте удачу в нашем колесе\nфортуны и получите повышенный\nкэшбэк на любимые бренды',
    accent: '#4ade80',
  },
]

const HOLD_DURATION = 4000
const DOUBLE_TAP_DELAY = 300
const SWIPE_DOWN_THRESHOLD = 80

export default function OnboardingStories({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const lastLeftTapRef = useRef(0)
  const currentRef = useRef(current)
  currentRef.current = current

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }, [])

  const finish = useCallback(() => {
    clearTimers()
    localStorage.setItem(STORAGE_KEY, '1')
    setExiting(true)
    setTimeout(onComplete, 300)
  }, [onComplete, clearTimers])

  const goNext = useCallback(() => {
    clearTimers()
    if (currentRef.current < stories.length - 1) {
      setCurrent(c => c + 1)
      setProgress(0)
    } else {
      finish()
    }
  }, [finish, clearTimers])

  const restartCurrent = useCallback(() => {
    clearTimers()
    setProgress(0)
    // re-trigger timer via a key change
    setCurrent(c => c) // no-op for state, but startTimer will re-run
  }, [clearTimers])

  const goPrev = useCallback(() => {
    clearTimers()
    if (currentRef.current > 0) {
      setCurrent(c => c - 1)
      setProgress(0)
    } else {
      restartCurrent()
    }
  }, [restartCurrent, clearTimers])

  // Auto-advance timer with smooth progress
  const startTimer = useCallback(() => {
    clearTimers()
    startTimeRef.current = performance.now()

    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current
      const p = Math.min(elapsed / HOLD_DURATION, 1)
      setProgress(p)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    timerRef.current = window.setTimeout(() => {
      if (currentRef.current < stories.length - 1) {
        setCurrent(c => c + 1)
        setProgress(0)
      } else {
        finish()
      }
    }, HOLD_DURATION)
  }, [clearTimers, finish])

  useEffect(() => {
    startTimer()
    return clearTimers
  }, [current, startTimer, clearTimers])

  // Touch state
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchMoved = useRef(false)

  const handlePointerAction = useCallback((x: number) => {
    const w = window.innerWidth
    if (x < w * 0.35) {
      // Left side: single tap = restart, double tap = prev
      const now = Date.now()
      if (now - lastLeftTapRef.current < DOUBLE_TAP_DELAY) {
        lastLeftTapRef.current = 0
        goPrev()
      } else {
        lastLeftTapRef.current = now
        // Restart current — reset timer and progress
        clearTimers()
        setProgress(0)
        startTimeRef.current = performance.now()
        startTimer()
      }
    } else {
      // Right side: next
      goNext()
    }
  }, [goPrev, goNext, clearTimers, startTimer])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchMoved.current = false
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current)
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
    if (dx > 8 || dy > 8) touchMoved.current = true
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault() // prevent synthetic click

    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current

    // Swipe down — close
    if (dy > SWIPE_DOWN_THRESHOLD && Math.abs(dx) < Math.abs(dy)) {
      finish()
      return
    }

    // Horizontal swipe
    if (Math.abs(dx) > 60 && touchMoved.current) {
      if (dx < 0) goNext()
      else goPrev()
      return
    }

    // Tap (no significant movement)
    if (!touchMoved.current) {
      handlePointerAction(e.changedTouches[0].clientX)
    }
  }, [finish, goNext, goPrev, handlePointerAction])

  // Desktop click (won't fire on mobile because of preventDefault in touchEnd)
  const onClickHandler = useCallback((e: React.MouseEvent) => {
    handlePointerAction(e.clientX)
  }, [handlePointerAction])

  const story = stories[current]

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] transition-opacity duration-300 touch-none',
        exiting ? 'opacity-0' : 'opacity-100'
      )}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onClickHandler}
    >
      {/* Background */}
      {story.image ? (
        <>
          <img src={story.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </>
      ) : (
        <div className={cn('absolute inset-0 bg-gradient-to-b', story.bg)} />
      )}

      {/* Progress bars */}
      <div className="absolute top-[max(12px,env(safe-area-inset-top,12px))] left-4 right-14 z-20 flex gap-1.5">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-[3px] rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white"
              style={{
                width: i < current ? '100%' : i === current ? `${progress * 100}%` : '0%',
                transition: 'none',
              }}
            />
          </div>
        ))}
      </div>

      {/* Close button (X) */}
      <button
        onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); finish() }}
        onClick={(e) => { e.stopPropagation(); finish() }}
        className="absolute top-[max(6px,env(safe-area-inset-top,6px))] right-3 z-20 w-10 h-10 flex items-center justify-center"
      >
        <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Content */}
      <div className={cn(
        'absolute inset-0 flex flex-col items-center px-8 z-10 pointer-events-none',
        story.image ? 'justify-end pb-[max(100px,calc(env(safe-area-inset-bottom,32px)+100px))]' : 'justify-center'
      )}>
        {!story.image && (
          <>
            <div
              className="absolute w-[300px] h-[300px] rounded-full opacity-[0.07]"
              style={{ background: story.accent, filter: 'blur(80px)', top: '15%' }}
            />
            <div
              className="absolute w-[200px] h-[200px] rounded-full opacity-[0.05]"
              style={{ background: story.accent, filter: 'blur(60px)', bottom: '20%' }}
            />
            <div
              className="w-24 h-24 rounded-[28px] flex items-center justify-center mb-8 shadow-2xl"
              style={{ background: `${story.accent}20`, boxShadow: `0 0 60px ${story.accent}30` }}
            >
              <span className="text-[48px]">{story.icon}</span>
            </div>
          </>
        )}

        <h1 className="text-[28px] font-extrabold text-white text-center leading-[1.15] tracking-[-0.03em] whitespace-pre-line drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          {story.title}
        </h1>

        <p className={cn('text-[15px] text-center mt-4 leading-[1.5] font-medium whitespace-pre-line drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]',
          story.image ? 'text-white/80' : 'text-white/50'
        )}>
          {story.description}
        </p>

        <div className="flex gap-2 mt-10">
          {stories.map((_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-full transition-all duration-300',
                i === current ? 'w-6 h-2' : 'w-2 h-2 bg-white/20'
              )}
              style={i === current ? { background: story.accent } : undefined}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA on last slide */}
      {current === stories.length - 1 && (
        <div className="absolute bottom-[max(32px,calc(env(safe-area-inset-bottom,32px)+16px))] left-6 right-6 z-20">
          <button
            onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); finish() }}
            onClick={(e) => { e.stopPropagation(); finish() }}
            className="w-full py-4 rounded-2xl text-[16px] font-extrabold tracking-[-0.02em] press-scale pointer-events-auto"
            style={{ background: story.accent, color: '#111' }}
          >
            Начать покупки →
          </button>
        </div>
      )}
    </div>
  )
}

export function useOnboardingSeen(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1'
}
