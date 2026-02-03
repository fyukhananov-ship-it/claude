import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Zap, Wallet, HelpCircle } from 'lucide-react';
import { Badge } from './Badge';
import { useApp } from '../context/AppContext';

const navItems = [
  { path: '/', icon: Home, label: 'Витрина' },
  { path: '/active', icon: Zap, label: 'Активные' },
  { path: '/wallet', icon: Wallet, label: 'Кошелёк' },
  { path: '/support', icon: HelpCircle, label: 'Помощь' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activatedOffers, transactions } = useApp();

  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  return (
    <nav className="bottom-nav">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          const showBadge = path === '/active' && activatedOffers.length > 0;
          const showPendingBadge = path === '/wallet' && pendingCount > 0;

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`bottom-nav-item relative ${isActive ? 'active' : ''}`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1.5">
                    <Badge variant="primary">{activatedOffers.length}</Badge>
                  </span>
                )}
                {showPendingBadge && (
                  <span className="absolute -top-1 -right-1.5">
                    <Badge variant="warning">{pendingCount}</Badge>
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
