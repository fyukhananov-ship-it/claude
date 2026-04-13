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
    if (!('Notification' in window)) { toast.show('Push не поддерживается', 'error'); return }
    if (Notification.permission === 'granted') { toast.show('Отключите в настройках браузера', 'info'); return }
    const perm = await Notification.requestPermission()
    if (perm === 'granted') { setPushEnabled(true); toast.show('Push включены', 'success') }
    else { toast.show('Разрешите уведомления', 'error') }
  }

  const resetOnboarding = () => {
    localStorage.removeItem('clo_onboarding_seen')
    toast.show('Онбординг сброшен', 'success')
    setTimeout(() => navigate(`/client/${phoneHash}`), 500)
  }

  const shortHash = phoneHash ? `${phoneHash.slice(0, 6)}...${phoneHash.slice(-4)}` : ''

  const MenuItem = ({ icon, iconBg, title, subtitle, onClick, trailing }: {
    icon: React.ReactNode; iconBg: string; title: string; subtitle: string
    onClick: () => void; trailing?: React.ReactNode
  }) => (
    <button onClick={onClick} className="w-full bg-white rounded-[16px] p-3.5 flex items-center gap-3.5 press-scale text-left shadow-card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-[#1C1917]">{title}</p>
        <p className="text-[12px] text-[#9CA3AF] mt-0.5">{subtitle}</p>
      </div>
      {trailing || (
        <svg className="w-4 h-4 text-[#D1D5DB] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  )

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <div className="bg-white px-5 pt-[max(52px,env(safe-area-inset-top,52px))] pb-5 border-b border-[#F0F0F0]">
        <h1 className="text-[24px] font-extrabold text-[#1C1917] tracking-[-0.03em]">Профиль</h1>

        <div className="flex items-center gap-3.5 mt-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EDE9FE] to-[#C4B5FD] flex items-center justify-center">
            <svg className="w-7 h-7 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-[16px] font-bold text-[#1C1917]">Клиент</p>
            <p className="text-[12px] text-[#9CA3AF] font-mono mt-0.5">{shortHash}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-mono-cash text-[18px] font-extrabold text-[#5B21B6]">{formatCurrency(total)}</p>
            <p className="text-[10px] text-[#9CA3AF]">кэшбэк</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 pb-28 space-y-2.5">
        <MenuItem
          icon={<svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>}
          iconBg="bg-rose-50"
          title="Избранное"
          subtitle={`${favs.length} офферов`}
          onClick={() => navigate(`/client/${phoneHash}/favorites`)}
        />

        <MenuItem
          icon={<svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
          iconBg="bg-amber-50"
          title="Push-уведомления"
          subtitle={pushEnabled ? 'Включены' : 'Получайте новые офферы'}
          onClick={togglePush}
          trailing={
            <div className={`w-10 h-6 rounded-full relative transition-colors ${pushEnabled ? 'bg-[#7C3AED]' : 'bg-[#E5E7EB]'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${pushEnabled ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
          }
        />

        <MenuItem
          icon={<svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          iconBg="bg-sky-50"
          title="Помощь"
          subtitle="FAQ и вопросы"
          onClick={() => navigate(`/client/${phoneHash}/help`)}
        />

        <MenuItem
          icon={<svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
          iconBg="bg-violet-50"
          title="Онбординг"
          subtitle="Посмотреть тур заново"
          onClick={resetOnboarding}
        />

        <div className="text-center text-[11px] text-[#D1D5DB] pt-6">Med v1.0</div>
      </div>

      <TabBar active="profile" />
    </div>
  )
}
