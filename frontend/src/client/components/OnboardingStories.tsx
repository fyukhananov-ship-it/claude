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
    icon: '📱',
    title: 'Как это работает?',
    description: 'Выберите оффер → оплатите покупку\nчерез СБП → кэшбэк начислится\nавтоматически в течение 3 дней',
    accent: '#38bdf8',
  },
  {
    bg: 'from-[#1a0a2e] via-[#2d1b4e] to-[#1a0a2e]',
    icon: '🛍️',
    title: '90+ партнёров\nв 12 категориях',
    description: 'Продукты, рестораны, одежда, техника,\nспорт, путешествия — кэшбэк\nна всё, что вы любите',
    accent: '#c084fc',
  },
  {
    bg: 'from-[#1a2e0a] via-[#1b4e2d] to-[#0a2e1a]',
    icon: '🎰',
    title: 'Крутите барабан —\nвыигрывайте больше!',
    description: 'Испытайте удачу в нашем колесе\nфортуны и получите повышенный\nкэшбэк на любимые бренды',
    accent: '#4ade80',
  },
]

const HOLD_DURATION = 4000
const DOUBLE_TAP_DELAY = 300

export default function OnboardingStories({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const lastLeftTapRef = useRef(0)

  const finish = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, '1')
    setExiting(true)
    setTimeout(onComplete, 300)
  }, [onComplete])

  const goNext = useCallback(() => {
    if (current < stories.length - 1) {
      setCurrent(c => c + 1)
      setProgress(0)
    } else {
      finish()
    }
  }, [current, finish])

  const restartCurrent = useCallback(() => {
    setProgress(0)
  }, [])

  const goPrev = useCallback(() => {
    if (current > 0) {
      setCurrent(c => c - 1)
      setProgress(0)
    } else {
      restartCurrent()
    }
  }, [current, restartCurrent])

  const handleLeftTap = useCallback(() => {
    const now = Date.now()
    if (now - lastLeftTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap — go to previous story
      lastLeftTapRef.current = 0
      goPrev()
    } else {
      // Single tap — restart current story
      lastLeftTapRef.current = now
      restartCurrent()
    }
  }, [goPrev, restartCurrent])

  // Auto-advance timer with smooth progress
  const startTimer = useCallback((fromProgress = 0) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const remaining = HOLD_DURATION * (1 - fromProgress)
    startTimeRef.current = performance.now() - (fromProgress * HOLD_DURATION)

    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current
      const p = Math.min(elapsed / HOLD_DURATION, 1)
      setProgress(p)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    timerRef.current = window.setTimeout(goNext, remaining)
  }, [goNext])

  useEffect(() => {
    startTimer(0)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [current]) // eslint-disable-line react-hooks/exhaustive-deps

  // Touch handling
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isTap = useRef(true)
  const touchHandled = useRef(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isTap.current = true
    touchHandled.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current)
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
    if (dx > 10 || dy > 10) isTap.current = false
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchHandled.current = true
    const dx = e.changedTouches[0].clientX - touchStartX.current

    if (Math.abs(dx) > 60) {
      if (dx < 0) goNext()
      else goPrev()
    } else if (isTap.current) {
      const x = e.changedTouches[0].clientX
      const w = window.innerWidth
      if (x < w * 0.3) handleLeftTap()
      else goNext()
    }
  }

  // Click for desktop — skip if touch already handled
  const handleClick = (e: React.MouseEvent) => {
    if (touchHandled.current) {
      touchHandled.current = false
      return
    }
    const x = e.clientX
    const w = window.innerWidth
    if (x < w * 0.3) handleLeftTap()
    else goNext()
  }

  const story = stories[current]

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] transition-opacity duration-300',
        exiting ? 'opacity-0' : 'opacity-100'
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {/* Background */}
      {story.image ? (
        <>
          <img src={story.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-all duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </>
      ) : (
        <div className={cn('absolute inset-0 bg-gradient-to-b', story.bg, 'transition-all duration-500')} />
      )}

      {/* Progress bars */}
      <div className="absolute top-[max(12px,env(safe-area-inset-top,12px))] left-4 right-12 z-10 flex gap-1.5">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-[3px] rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-none"
              style={{
                width: i < current ? '100%' : i === current ? `${progress * 100}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); finish() }}
        className="absolute top-[max(24px,calc(env(safe-area-inset-top,24px)+12px))] right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
      >
        <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Content */}
      <div className={cn(
        'absolute inset-0 flex flex-col items-center px-8 z-10',
        story.image ? 'justify-end pb-[max(100px,calc(env(safe-area-inset-bottom,32px)+100px))]' : 'justify-center'
      )}>
        {!story.image && (
          <>
            {/* Decorative circles */}
            <div
              className="absolute w-[300px] h-[300px] rounded-full opacity-[0.07]"
              style={{ background: story.accent, filter: 'blur(80px)', top: '15%' }}
            />
            <div
              className="absolute w-[200px] h-[200px] rounded-full opacity-[0.05]"
              style={{ background: story.accent, filter: 'blur(60px)', bottom: '20%' }}
            />

            {/* Icon */}
            <div
              className="w-24 h-24 rounded-[28px] flex items-center justify-center mb-8 shadow-2xl"
              style={{ background: `${story.accent}20`, boxShadow: `0 0 60px ${story.accent}30` }}
            >
              <span className="text-[48px]">{story.icon}</span>
            </div>
          </>
        )}

        {/* Title */}
        <h1 className="text-[28px] font-extrabold text-white text-center leading-[1.15] tracking-[-0.03em] whitespace-pre-line">
          {story.title}
        </h1>

        {/* Description */}
        <p className={cn('text-[15px] text-center mt-4 leading-[1.5] font-medium whitespace-pre-line',
          story.image ? 'text-white/70' : 'text-white/50'
        )}>
          {story.description}
        </p>

        {/* Page indicator dots */}
        <div className="flex gap-2 mt-10">
          {stories.map((_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-full transition-all duration-300',
                i === current
                  ? 'w-6 h-2'
                  : 'w-2 h-2 bg-white/20'
              )}
              style={i === current ? { background: story.accent } : undefined}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      {current === stories.length - 1 && (
        <div className="absolute bottom-[max(32px,calc(env(safe-area-inset-bottom,32px)+16px))] left-6 right-6 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); finish() }}
            className="w-full py-4 rounded-2xl text-[16px] font-extrabold tracking-[-0.02em] press-scale"
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
