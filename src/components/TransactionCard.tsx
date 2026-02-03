import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import type { Transaction } from '../types';
import { formatDateTime } from '../data/mockData';

interface TransactionCardProps {
  transaction: Transaction;
  onClick: () => void;
}

export function TransactionCard({ transaction, onClick }: TransactionCardProps) {
  return (
    <Card onClick={onClick} className="flex items-center gap-3" padding="md">
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
        {transaction.offer.partner.logo}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-medium text-gray-900 truncate">
            {transaction.offer.partner.name}
          </span>
          <span className={`font-semibold ${
            transaction.status === 'confirmed'
              ? 'text-success-600'
              : transaction.status === 'rejected' || transaction.status === 'reversed'
              ? 'text-gray-400'
              : 'text-gray-900'
          }`}>
            {transaction.status === 'rejected' || transaction.status === 'reversed'
              ? `−${transaction.benefit}₽`
              : `+${transaction.benefit}₽`
            }
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gray-500">
            {formatDateTime(transaction.createdAt)} • {transaction.amount}₽
          </span>
          <StatusBadge status={transaction.status} size="sm" />
        </div>
      </div>

      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
    </Card>
  );
}
