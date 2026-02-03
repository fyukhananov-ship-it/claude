import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  AlertCircle,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { Header, Card, Button, StatusBadge } from '../components';
import { useApp } from '../context/AppContext';
import { formatDateTime, getDaysText } from '../data/mockData';
import type { TransactionStatus } from '../types';

const statusInfo: Record<TransactionStatus, {
  icon: React.ReactNode;
  title: string;
  color: string;
  bgColor: string;
}> = {
  pending: {
    icon: <Clock className="w-8 h-8" />,
    title: 'Ожидает подтверждения',
    color: 'text-warning-600',
    bgColor: 'bg-warning-100',
  },
  confirmed: {
    icon: <CheckCircle2 className="w-8 h-8" />,
    title: 'Начислено',
    color: 'text-success-600',
    bgColor: 'bg-success-100',
  },
  rejected: {
    icon: <XCircle className="w-8 h-8" />,
    title: 'Отклонено',
    color: 'text-danger-600',
    bgColor: 'bg-danger-100',
  },
  reversed: {
    icon: <RotateCcw className="w-8 h-8" />,
    title: 'Сторнировано',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
};

export function TransactionDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTransactionById } = useApp();

  const transaction = getTransactionById(id || '');

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Транзакция" showBack />
        <div className="p-4 text-center text-gray-500">Транзакция не найдена</div>
      </div>
    );
  }

  const info = statusInfo[transaction.status];

  const getExpectedDays = () => {
    if (!transaction.expectedConfirmation) return null;
    const now = new Date();
    const expected = new Date(transaction.expectedConfirmation);
    const diff = Math.ceil((expected.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const expectedDays = getExpectedDays();

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header title="Детали транзакции" showBack />

      <main className="px-4 py-4">
        {/* Status card */}
        <Card className="mb-4 text-center" padding="lg">
          <div className={`w-16 h-16 rounded-full ${info.bgColor} ${info.color} flex items-center justify-center mx-auto mb-4`}>
            {info.icon}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h2>
          <div className={`text-3xl font-bold mb-2 ${
            transaction.status === 'confirmed' ? 'text-success-600' :
            transaction.status === 'rejected' || transaction.status === 'reversed' ? 'text-gray-400' :
            'text-gray-900'
          }`}>
            {transaction.status === 'rejected' || transaction.status === 'reversed' ? '−' : '+'}
            {transaction.benefit}₽
          </div>

          {transaction.status === 'pending' && expectedDays !== null && (
            <p className="text-sm text-gray-500">
              Ожидаемое подтверждение: {getDaysText(expectedDays)}
            </p>
          )}
        </Card>

        {/* Partner info */}
        <Card className="mb-4" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
              {transaction.offer.partner.logo}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{transaction.offer.partner.name}</h3>
              <p className="text-sm text-gray-500">{transaction.offer.title}</p>
            </div>
          </div>
        </Card>

        {/* Details */}
        <Card className="mb-4" padding="md">
          <h3 className="font-semibold text-gray-900 mb-3">Детали</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Сумма покупки</span>
              <span className="font-medium text-gray-900">{transaction.amount}₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Выгода</span>
              <span className="font-medium text-gray-900">{transaction.benefit}₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Дата</span>
              <span className="font-medium text-gray-900">{formatDateTime(transaction.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Статус</span>
              <StatusBadge status={transaction.status} size="sm" />
            </div>
            {transaction.confirmedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Подтверждено</span>
                <span className="font-medium text-gray-900">{formatDateTime(transaction.confirmedAt)}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Rejection reason */}
        {(transaction.status === 'rejected' || transaction.status === 'reversed') && transaction.rejectionReason && (
          <Card className="mb-4 bg-danger-50 border border-danger-100" padding="md">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-danger-800 mb-1">Причина</h4>
                <p className="text-sm text-danger-700">{transaction.rejectionReason}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        {transaction.canDispute && (
          <Card className="mb-4" padding="md">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">Не согласны с решением?</h4>
                <p className="text-sm text-gray-500 mb-3">
                  Вы можете создать обращение, и мы разберёмся в ситуации
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<MessageSquare className="w-4 h-4" />}
                  onClick={() => navigate(`/support?transaction=${transaction.id}`)}
                >
                  Создать обращение
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* View offer */}
        <button
          onClick={() => navigate(`/offer/${transaction.offer.id}`)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-card tap-highlight-none"
        >
          <span className="text-gray-900 font-medium">Посмотреть оффер</span>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </button>
      </main>
    </div>
  );
}
