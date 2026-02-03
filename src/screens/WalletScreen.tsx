import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp } from 'lucide-react';
import { Header, Chip, TransactionCard, EmptyState } from '../components';
import { useApp } from '../context/AppContext';
import type { TransactionStatus } from '../types';

type TabType = 'all' | TransactionStatus;

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'pending', label: 'Ожидает' },
  { key: 'confirmed', label: 'Начислено' },
  { key: 'rejected', label: 'Отклонено' },
  { key: 'reversed', label: 'Сторнировано' },
];

export function WalletScreen() {
  const navigate = useNavigate();
  const { transactions } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filteredTransactions = activeTab === 'all'
    ? transactions
    : transactions.filter(t => t.status === activeTab);

  const totalConfirmed = transactions
    .filter(t => t.status === 'confirmed')
    .reduce((sum, t) => sum + t.benefit, 0);

  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.benefit, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="Кошелёк выгод" />

      <main className="px-4 py-4">
        {/* Summary card */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-5 text-white mb-6">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Всего получено</span>
          </div>
          <div className="text-3xl font-bold mb-3">{totalConfirmed}₽</div>
          {pendingAmount > 0 && (
            <div className="bg-white/20 rounded-lg px-3 py-2 inline-block">
              <span className="text-sm">
                +{pendingAmount}₽ ожидает подтверждения
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 mb-4">
          {tabs.map(({ key, label }) => {
            const count = key === 'all'
              ? transactions.length
              : transactions.filter(t => t.status === key).length;

            if (count === 0 && key !== 'all') return null;

            return (
              <Chip
                key={key}
                onClick={() => setActiveTab(key)}
                active={activeTab === key}
              >
                {label} {count > 0 && `(${count})`}
              </Chip>
            );
          })}
        </div>

        {/* Transactions list */}
        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon={<Wallet className="w-8 h-8" />}
            title="Нет транзакций"
            description="Здесь появятся начисления по вашим офферам"
            action={{
              label: 'К витрине',
              onClick: () => navigate('/'),
            }}
          />
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onClick={() => navigate(`/transaction/${transaction.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
