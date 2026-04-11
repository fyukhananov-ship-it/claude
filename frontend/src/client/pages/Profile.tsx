import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { formatCurrency } from '@/lib/utils'
import { useFavorites } from '@/client/lib/hooks'
import TabBar from '@/client/components/TabBar'
import { useToast } from '@/client/components/Toast'

export default function Profile() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()
  const [total, setTotal] = useState('0')
  const [pushEnabled, setPushEnabled] = useState(false)
  const { favs } = useFavorites()
  const toast = useToast()

  useEffect(() => {
    if (!phoneHash) return
    api.get<{ total: string }>(`/client/${phoneHash}/cashback/total`)
      .then(t => setTotal(t.total))
      .catch(() => {})

    if ('Notification' in window) {
      setPushEnabled(Notification.permission === 'granted')
    }
  }, [phoneHash])

  const togglePush = async () => {
    if (!('Notification' in window)) {
      toast.show('Push не поддерживается браузером', 'error')
      return
    }
    if (Notification.permission === 'granted') {
      toast.show('Отключите в настройках браузера', 'info')
      return
    }
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      setPushEnabled(true)
      toast.show('Push-уведомления включены', 'success')
    } else {
      toast.show('Разрешите уведомления', 'error')
    }
  }

  const resetOnboarding = () => {
    localStorage.removeItem('clo_onboarding_seen')
    toast.show('Онбординг сброшен', 'success')
    setTimeout(() => navigate(`/client/${phoneHash}`), 500)
  }

  const resetStore = () => {
    if (!confirm('Сбросить все сохранённые офферы и партнёров к исходному состоянию?')) return
    localStorage.removeItem('clo_mock_store_v1')
    toast.show('Данные сброшены', 'success')
    setTimeout(() => window.location.reload(), 500)
  }

  const shortHash = phoneHash ? `${phoneHash.slice(0, 6)}…${phoneHash.slice(-4)}` : ''

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      {/* Header */}
      <div className="bg-dark-hero relative text-white px-5 pt-[max(52px,env(safe-area-inset-top,52px))] pb-6">
        <div className="relative z-10">
          <h1 className="text-[22px] font-extrabold tracking-[-0.02em] mb-5">Профиль</h1>

          {/* User card */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD500] to-[#F59E0B] flex items-center justify-center shadow-[0_0_24px_rgba(255,213,0,0.3)]">
              <svg className="w-8 h-8 text-[#111]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-[16px] font-bold">Клиент Билайн</p>
              <p className="text-[12px] text-white/50 font-mono mt-0.5">ID: {shortHash}</p>
            </div>
          </div>

          {/* Total cashback */}
          <div className="mt-5 bg-white/[0.08] border border-white/[0.06] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-white/40 uppercase tracking-[0.1em] font-bold">Накопленный кэшбэк</p>
              <p className="font-mono-cash text-[24px] font-extrabold mt-1">{formatCurrency(total)}</p>
            </div>
            <button onClick={() => navigate(`/client/${phoneHash}/cashback`)} className="text-[12px] font-bold text-[#FFD500] press-scale">
              История →
            </button>
          </div>
        </div>
      </div>

      {/* Actions list */}
      <div className="px-5 py-5 pb-28 space-y-3">
        <button
          onClick={() => navigate(`/client/${phoneHash}/favorites`)}
          className="w-full bg-white rounded-2xl shadow-card p-4 flex items-center gap-4 press-scale"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-[14px] font-bold text-[#111]">Избранные офферы</p>
            <p className="text-[12px] text-[#999] mt-0.5 font-medium">{favs.length} в коллекции</p>
          </div>
          <svg className="w-5 h-5 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={togglePush}
          className="w-full bg-white rounded-2xl shadow-card p-4 flex items-center gap-4 press-scale"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-[14px] font-bold text-[#111]">Push-уведомления</p>
            <p className="text-[12px] text-[#999] mt-0.5 font-medium">
              {pushEnabled ? 'Включены' : 'Получайте новые офферы'}
            </p>
          </div>
          <div className={`w-10 h-6 rounded-full relative transition-colors ${pushEnabled ? 'bg-[#FFD500]' : 'bg-[#e5e5e5]'}`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${pushEnabled ? 'left-[18px]' : 'left-0.5'}`} />
          </div>
        </button>

        <button
          onClick={() => navigate(`/client/${phoneHash}/help`)}
          className="w-full bg-white rounded-2xl shadow-card p-4 flex items-center gap-4 press-scale"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-[14px] font-bold text-[#111]">Помощь и вопросы</p>
            <p className="text-[12px] text-[#999] mt-0.5 font-medium">Как получить кэшбэк, FAQ</p>
          </div>
          <svg className="w-5 h-5 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={resetOnboarding}
          className="w-full bg-white rounded-2xl shadow-card p-4 flex items-center gap-4 press-scale"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-[14px] font-bold text-[#111]">Посмотреть онбординг</p>
            <p className="text-[12px] text-[#999] mt-0.5 font-medium">Краткий тур по приложению</p>
          </div>
          <svg className="w-5 h-5 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={resetStore}
          className="w-full bg-white rounded-2xl shadow-card p-4 flex items-center gap-4 press-scale"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-[14px] font-bold text-[#111]">Сбросить данные</p>
            <p className="text-[12px] text-[#999] mt-0.5 font-medium">Очистить админ-правки офферов</p>
          </div>
          <svg className="w-5 h-5 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="text-center text-[12px] text-[#bbb] font-medium pt-6">
          Билайн × НСПК · CLO · v1.0
        </div>
      </div>

      <TabBar active="profile" />
    </div>
  )
}
