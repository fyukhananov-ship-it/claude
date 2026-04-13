import { useState, useEffect } from 'react'
import { api } from '@/api/client'

interface Slide {
  icon: string
  title: string
  description: string
  accent: string
  bg: string
  image?: string
}

const defaultSlides: Slide[] = [
  { icon: '🎁', title: 'Добро пожаловать\nв Билайн Кэшбэк', description: 'Получайте кэшбэк до 30% за покупки\nу партнёров — деньги вернутся\nна ваш счёт Билайн', accent: '#FFD500', bg: 'from-[#111] via-[#1a1a2e] to-[#111]' },
  { icon: '📱', title: 'Как это работает?', description: 'Выберите оффер → оплатите покупку\nчерез СБП → кэшбэк начислится\nавтоматически в течение 3 дней', accent: '#38bdf8', bg: 'from-[#0f172a] via-[#1e293b] to-[#0f172a]' },
  { icon: '🛍️', title: '90+ партнёров\nв 12 категориях', description: 'Продукты, рестораны, одежда, техника,\nспорт, путешествия — кэшбэк\nна всё, что вы любите', accent: '#c084fc', bg: 'from-[#1a0a2e] via-[#2d1b4e] to-[#1a0a2e]' },
  { icon: '🎰', title: 'Крутите барабан —\nвыигрывайте больше!', description: 'Испытайте удачу в нашем колесе\nфортуны и получите повышенный\nкэшбэк на любимые бренды', accent: '#4ade80', bg: 'from-[#1a2e0a] via-[#1b4e2d] to-[#0a2e1a]' },
]

const bgOptions = [
  { label: 'Тёмный', value: 'from-[#111] via-[#1a1a2e] to-[#111]' },
  { label: 'Синий', value: 'from-[#0f172a] via-[#1e293b] to-[#0f172a]' },
  { label: 'Фиолетовый', value: 'from-[#1a0a2e] via-[#2d1b4e] to-[#1a0a2e]' },
  { label: 'Зелёный', value: 'from-[#1a2e0a] via-[#1b4e2d] to-[#0a2e1a]' },
  { label: 'Бордовый', value: 'from-[#2e0a0a] via-[#4e1b1b] to-[#2e0a0a]' },
]

export default function Onboarding() {
  const [slides, setSlides] = useState<Slide[]>(defaultSlides)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)

  useEffect(() => {
    api.get<Record<string, string>>('/admin/settings')
      .then(s => {
        if (s.onboarding_slides) {
          try {
            const parsed = JSON.parse(s.onboarding_slides)
            if (Array.isArray(parsed) && parsed.length > 0) setSlides(parsed)
          } catch {}
        }
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/admin/settings', { onboarding_slides: JSON.stringify(slides) })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {} finally { setSaving(false) }
  }

  const updateSlide = (i: number, field: keyof Slide, value: string) => {
    setSlides(s => s.map((sl, idx) => idx === i ? { ...sl, [field]: value } : sl))
  }

  const addSlide = () => {
    setSlides(s => [...s, { icon: '✨', title: 'Новый слайд', description: 'Описание', accent: '#FFD500', bg: bgOptions[0].value }])
    setEditing(slides.length)
  }

  const removeSlide = (i: number) => {
    if (slides.length <= 1) return
    setSlides(s => s.filter((_, idx) => idx !== i))
    setEditing(null)
  }

  const moveSlide = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= slides.length) return
    setSlides(s => {
      const copy = [...s]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    })
    setEditing(j)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#111] tracking-[-0.03em]">Онбординг</h1>
          <p className="text-[13px] text-[#999] mt-1 font-medium">{slides.length} слайдов</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addSlide} className="px-4 py-2.5 rounded-xl bg-[#f0f0f0] text-[#111] text-[13px] font-bold press-scale">
            Добавить слайд
          </button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2.5 rounded-xl bg-[#FFD500] text-[#111] text-[13px] font-bold press-scale disabled:opacity-50 shadow-[0_2px_12px_rgba(255,213,0,0.25)]">
            {saving ? 'Сохранение...' : saved ? 'Сохранено' : 'Сохранить'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {slides.map((slide, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
            {/* Preview bar */}
            <button
              onClick={() => setEditing(editing === i ? null : i)}
              className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-[#fafafa] transition-colors"
            >
              <span className="text-[11px] font-bold text-[#999] w-6">{i + 1}</span>
              <span className="text-[24px]">{slide.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-[#111] truncate">{slide.title.replace(/\n/g, ' ')}</p>
                <p className="text-[12px] text-[#999] truncate">{slide.description.replace(/\n/g, ' ')}</p>
              </div>
              <div className="w-4 h-4 rounded-full" style={{ background: slide.accent }} />
              <svg className={`w-4 h-4 text-[#999] transition-transform ${editing === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Edit form */}
            {editing === i && (
              <div className="px-5 pb-5 border-t border-[#f0f0f0] pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Иконка</label>
                    <input value={slide.icon} onChange={e => updateSlide(i, 'icon', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Акцентный цвет</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={slide.accent} onChange={e => updateSlide(i, 'accent', e.target.value)} className="w-10 h-10 rounded-xl border-0 cursor-pointer" />
                      <input value={slide.accent} onChange={e => updateSlide(i, 'accent', e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-[#eee] text-[14px] font-mono focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Заголовок (\\n для переноса строки)</label>
                  <input value={slide.title} onChange={e => updateSlide(i, 'title', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Описание (\\n для переноса строки)</label>
                  <textarea value={slide.description} onChange={e => updateSlide(i, 'description', e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40 resize-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Фон</label>
                  <select value={slide.bg} onChange={e => updateSlide(i, 'bg', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40">
                    {bgOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">URL изображения (опционально)</label>
                  <input value={slide.image || ''} onChange={e => updateSlide(i, 'image', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" placeholder="https://..." />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => moveSlide(i, -1)} disabled={i === 0} className="px-3 py-2 rounded-lg bg-[#f0f0f0] text-[12px] font-bold text-[#666] press-scale disabled:opacity-30">Вверх</button>
                  <button onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1} className="px-3 py-2 rounded-lg bg-[#f0f0f0] text-[12px] font-bold text-[#666] press-scale disabled:opacity-30">Вниз</button>
                  <div className="flex-1" />
                  <button onClick={() => removeSlide(i)} disabled={slides.length <= 1} className="px-3 py-2 rounded-lg bg-red-50 text-[12px] font-bold text-red-600 press-scale disabled:opacity-30">Удалить</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
