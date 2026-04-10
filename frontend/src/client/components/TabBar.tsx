import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'

type TabId = 'offers' | 'cashback' | 'profile'

const tabs: { id: TabId; label: string; path: string; icon: React.ReactNode }[] = [
  {
    id: 'offers',
    label: 'Офферы',
    path: '',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
  },
  {
    id: 'cashback',
    label: 'Кэшбэк',
    path: '/cashback',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Профиль',
    path: '/profile',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export default function TabBar({ active }: { active: TabId }) {
  const navigate = useNavigate()
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const loc = useLocation()

  return (
    <div className="fixed bottom-0 left-0 right-0 glass px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2.5 z-30">
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
              className="flex flex-col items-center py-1 px-4 relative group"
            >
              <span className={cn('transition-colors', isActive ? 'text-[#0A0A0C]' : 'text-[#9CA3AF]')}>{tab.icon}</span>
              <span className={cn('text-[10px] mt-1 transition-colors', isActive ? 'font-bold text-[#0A0A0C]' : 'font-medium text-[#9CA3AF]')}>
                {tab.label}
              </span>
              {isActive && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-[#FFDC00] rounded-full" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
