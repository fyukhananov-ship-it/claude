import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ExternalLink, Clock, MapPin } from 'lucide-react';
import { Header, Card, Chip, Button, EmptyState } from '../components';
import { useApp } from '../context/AppContext';
import { formatBenefit, formatPaymentMethod, getDaysText } from '../data/mockData';

export function ActiveOffersScreen() {
  const navigate = useNavigate();
  const { activatedOffers } = useApp();

  const getRemainingDays = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  if (activatedOffers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Активные" />
        <EmptyState
          icon={<Zap className="w-8 h-8" />}
          title="Нет активных офферов"
          description="Активируйте офферы на витрине, чтобы получать выгоду"
          action={{
            label: 'К витрине',
            onClick: () => navigate('/'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="Активные" />

      <main className="px-4 py-4">
        <p className="text-sm text-gray-500 mb-4">
          Совершите покупку по условиям оффера, чтобы получить выгоду
        </p>

        <div className="space-y-3">
          {activatedOffers.map((offer) => {
            const remainingDays = getRemainingDays(offer.expiresAt);
            const isExpiringSoon = remainingDays <= 3;

            return (
              <Card
                key={offer.id}
                onClick={() => navigate(`/offer/${offer.id}`)}
                padding="none"
                className="overflow-hidden"
              >
                {/* Urgency banner */}
                {isExpiringSoon && (
                  <div className="bg-warning-100 px-4 py-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-warning-600" />
                    <span className="text-sm font-medium text-warning-700">
                      Осталось {getDaysText(remainingDays)}
                    </span>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                      {offer.partner.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{offer.partner.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{offer.shortDescription}</p>
                    </div>
                    <span className="text-lg font-bold text-primary-600">
                      {formatBenefit(offer)}
                    </span>
                  </div>

                  {/* Quick info */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Chip size="sm" variant="primary">
                      {formatPaymentMethod(offer.conditions.paymentMethod)}
                    </Chip>
                    {offer.conditions.minPurchase && (
                      <Chip size="sm">от {offer.conditions.minPurchase}₽</Chip>
                    )}
                    {offer.usagesLeft !== undefined && (
                      <Chip size="sm">
                        {offer.usagesLeft} использ. осталось
                      </Chip>
                    )}
                    <Chip
                      size="sm"
                      icon={<MapPin className="w-3 h-3" />}
                    >
                      {offer.conditions.format === 'online'
                        ? 'Онлайн'
                        : offer.conditions.format === 'offline'
                        ? 'В магазине'
                        : 'Везде'}
                    </Chip>
                  </div>

                  {/* Quick action */}
                  {offer.deepLink && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      icon={<ExternalLink className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(offer.deepLink, '_blank');
                      }}
                    >
                      Перейти в магазин
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
