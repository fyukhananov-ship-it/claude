import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HelpCircle,
  MessageSquare,
  ChevronRight,
  Send,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Header, Card, Button, EmptyState } from '../components';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../data/mockData';

type ViewMode = 'main' | 'form' | 'success';

export function SupportScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { transactions, activatedOffers, createTicket, tickets } = useApp();

  const preselectedTransactionId = searchParams.get('transaction');
  const preselectedTransaction = preselectedTransactionId
    ? transactions.find(t => t.id === preselectedTransactionId)
    : null;

  const [viewMode, setViewMode] = useState<ViewMode>(preselectedTransaction ? 'form' : 'main');
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(
    preselectedTransaction?.offerId || null
  );
  const [formData, setFormData] = useState({
    date: preselectedTransaction ? new Date(preselectedTransaction.createdAt).toISOString().split('T')[0] : '',
    amount: preselectedTransaction?.amount.toString() || '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  const allOffers = [
    ...activatedOffers,
    ...transactions.map(t => t.offer).filter((o, i, arr) =>
      arr.findIndex(x => x.id === o.id) === i
    ),
  ];

  const handleSubmit = async () => {
    if (!selectedOfferId || !formData.date || !formData.amount) return;

    setIsSubmitting(true);
    try {
      const ticketId = await createTicket({
        offerId: selectedOfferId,
        transactionId: preselectedTransactionId || undefined,
        subject: 'Не начислена выгода',
        description: formData.description || `Покупка на сумму ${formData.amount}₽ от ${formData.date}`,
      });
      setCreatedTicketId(ticketId);
      setViewMode('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (viewMode === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <Header title="Обращение создано" showBack />
        <main className="px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-success-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Обращение отправлено</h2>
            <p className="text-gray-500 mb-6">
              Номер обращения: #{createdTicketId?.slice(-6)}
            </p>
            <Card className="text-left mb-6" padding="md">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-5 h-5 text-primary-500" />
                <div>
                  <span className="text-gray-500">Ожидаемый ответ: </span>
                  <span className="font-medium text-gray-900">в течение 24 часов</span>
                </div>
              </div>
            </Card>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/wallet')}
            >
              Вернуться в кошелёк
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (viewMode === 'form') {
    const selectedOffer = allOffers.find(o => o.id === selectedOfferId);

    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <Header title="Создать обращение" showBack />
        <main className="px-4 py-4">
          <p className="text-sm text-gray-500 mb-4">
            Заполните данные о покупке, и мы разберёмся, почему выгода не была начислена
          </p>

          {/* Selected offer */}
          {selectedOffer && (
            <Card className="mb-4" padding="md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                  {selectedOffer.partner.logo}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{selectedOffer.partner.name}</p>
                  <p className="text-sm text-gray-500">{selectedOffer.title}</p>
                </div>
                <button
                  onClick={() => setSelectedOfferId(null)}
                  className="text-sm text-primary-600"
                >
                  Изменить
                </button>
              </div>
            </Card>
          )}

          {/* Offer selection */}
          {!selectedOfferId && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Выберите оффер
              </label>
              <div className="space-y-2">
                {allOffers.slice(0, 5).map((offer) => (
                  <button
                    key={offer.id}
                    onClick={() => setSelectedOfferId(offer.id)}
                    className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 tap-highlight-none hover:border-primary-300 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                      {offer.partner.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{offer.partner.name}</p>
                      <p className="text-sm text-gray-500 truncate">{offer.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedOfferId && (
            <>
              {/* Date input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата покупки
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input"
                />
              </div>

              {/* Amount input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сумма покупки
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    className="input pr-8"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">₽</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дополнительная информация (необязательно)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Опишите проблему..."
                  rows={3}
                  className="input resize-none"
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                loading={isSubmitting}
                disabled={!formData.date || !formData.amount}
                icon={<Send className="w-5 h-5" />}
                onClick={handleSubmit}
              >
                Отправить обращение
              </Button>
            </>
          )}
        </main>
      </div>
    );
  }

  // Main view
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="Помощь" />

      <main className="px-4 py-4">
        {/* Quick action */}
        <Card
          onClick={() => setViewMode('form')}
          className="mb-6"
          padding="md"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Не начислилось?</h3>
              <p className="text-sm text-gray-500">Создать обращение по оферу</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>

        {/* Active tickets */}
        {tickets.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Ваши обращения</h2>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <Card key={ticket.id} padding="md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{ticket.subject}</p>
                      <p className="text-sm text-gray-500">#{ticket.id.slice(-6)} • {formatDateTime(ticket.createdAt)}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-warning-100 text-warning-700">
                      В работе
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Частые вопросы</h2>
          <div className="space-y-2">
            {[
              'Когда начислится выгода?',
              'Почему оффер отклонён?',
              'Как активировать оффер?',
              'Что такое СБП?',
            ].map((question) => (
              <button
                key={question}
                className="w-full flex items-center justify-between p-4 bg-white rounded-xl tap-highlight-none hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-gray-900">{question}</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
