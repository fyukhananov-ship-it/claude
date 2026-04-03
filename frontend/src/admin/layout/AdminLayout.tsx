import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/auth/AuthContext'

const navItems = [
  { to: '/admin', label: 'Дашборд', icon: '📊', end: true },
  { to: '/admin/partners', label: 'Партнёры', icon: '🤝' },
  { to: '/admin/moderation', label: 'Модерация', icon: '✅' },
  { to: '/admin/registry', label: 'Реестры', icon: '📁' },
  { to: '/admin/finance', label: 'Финансы', icon: '💰' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-beeline-black text-white flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-beeline-yellow flex items-center justify-center">
              <span className="text-beeline-black font-bold text-sm">CL</span>
            </div>
            <div>
              <h1 className="font-bold text-sm">CLO Admin</h1>
              <p className="text-xs text-gray-400">Админ-панель</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-beeline-yellow text-beeline-black'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4 border-t border-white/10 pt-4">
          <div className="px-3 mb-3">
            <p className="text-sm font-medium text-white truncate">{user?.email || 'Администратор'}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors w-full"
          >
            <span className="text-base">🚪</span>
            Выйти
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
