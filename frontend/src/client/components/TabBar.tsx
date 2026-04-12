import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'

type TabId = 'home' | 'journal' | 'cashback' | 'profile'

const tabs: { id: TabId; label: string; path: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    id: 'home',
    label: 'Главная',
    path: '',
    icon: (active) => (
      <svg className="w-[22px] h-[22px]" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'journal',
    label: 'Журнал',
    path: '/journal',
    icon: (active) => (
      <svg className="w-[22px] h-[22px]" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    id: 'cashback',
    label: 'Кэшбэк',
    path: '/cashback',
    icon: (active) => (
      <svg className="w-[22px] h-[22px]" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 6v3" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Профиль',
    path: '/profile',
    icon: (active) => (
      <svg className="w-[22px] h-[22px]" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
]

export default function TabBar({ active }: { active: TabId }) {
  const navigate = useNavigate()
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const loc = useLocation()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#F0F0F0] px-2 pb-[max(4px,env(safe-area-inset-bottom))] pt-1.5 z-30">
      <div className="flex justify-around max-w-md mx-auto">
        {tabs.map(tab => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                const target = `/client/${phoneHash}${tab.path}`
                if (loc.pathname !== target) navigate(target)
              }}
              className="flex flex-col items-center py-1 px-3 min-w-[60px]"
            >
              <span className={cn('transition-colors', isActive ? 'text-[#D97706]' : 'text-[#9CA3AF]')}>
                {tab.icon(isActive)}
              </span>
              <span className={cn(
                'text-[10px] mt-0.5 transition-colors',
                isActive ? 'font-semibold text-[#D97706]' : 'font-medium text-[#9CA3AF]'
              )}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
