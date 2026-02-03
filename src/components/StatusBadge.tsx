import React from 'react';
import { Clock, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import type { TransactionStatus, OfferStatus } from '../types';

interface StatusBadgeProps {
  status: TransactionStatus | OfferStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const transactionConfig: Record<TransactionStatus, { label: string; color: string; icon: React.ReactNode; dotClass: string }> = {
  pending: {
    label: 'Ожидает',
    color: 'bg-warning-100 text-warning-700',
    icon: <Clock className="w-3.5 h-3.5" />,
    dotClass: 'status-pending',
  },
  confirmed: {
    label: 'Начислено',
    color: 'bg-success-100 text-success-700',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    dotClass: 'status-confirmed',
  },
  rejected: {
    label: 'Отклонено',
    color: 'bg-danger-100 text-danger-600',
    icon: <XCircle className="w-3.5 h-3.5" />,
    dotClass: 'status-rejected',
  },
  reversed: {
    label: 'Сторнировано',
    color: 'bg-gray-100 text-gray-600',
    icon: <RotateCcw className="w-3.5 h-3.5" />,
    dotClass: 'status-reversed',
  },
};

const offerConfig: Record<OfferStatus, { label: string; color: string }> = {
  available: { label: 'Доступно', color: 'bg-success-100 text-success-700' },
  activated: { label: 'Активно', color: 'bg-primary-100 text-primary-700' },
  unavailable: { label: 'Недоступно', color: 'bg-gray-100 text-gray-500' },
  expired: { label: 'Истекло', color: 'bg-gray-100 text-gray-500' },
};

export function StatusBadge({ status, showIcon = true, size = 'md' }: StatusBadgeProps) {
  const isTransaction = status in transactionConfig;

  if (isTransaction) {
    const config = transactionConfig[status as TransactionStatus];
    return (
      <span
        className={`
          inline-flex items-center gap-1.5 font-medium rounded-full
          ${config.color}
          ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'}
        `}
      >
        {showIcon && (
          <span className={`status-dot ${config.dotClass}`} />
        )}
        {config.label}
      </span>
    );
  }

  const config = offerConfig[status as OfferStatus];
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${config.color}
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'}
      `}
    >
      {config.label}
    </span>
  );
}
