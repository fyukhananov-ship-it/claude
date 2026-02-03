import React from 'react';
import { Clock, CreditCard, MapPin, Zap } from 'lucide-react';
import { Card } from './Card';
import { Chip } from './Chip';
import { Button } from './Button';
import type { Offer, ActivatedOffer } from '../types';
import { formatBenefit, formatPaymentMethod, getDaysText } from '../data/mockData';

interface OfferCardProps {
  offer: Offer | ActivatedOffer;
  onClick: () => void;
  onActivate?: () => void;
  compact?: boolean;
  isActivated?: boolean;
}

export function OfferCard({
  offer,
  onClick,
  onActivate,
  compact = false,
  isActivated = false,
}: OfferCardProps) {
  const activatedOffer = isActivated ? (offer as ActivatedOffer) : null;

  const handleActivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onActivate?.();
  };

  if (compact) {
    return (
      <Card onClick={onClick} className="flex items-center gap-3" padding="sm">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
          {offer.partner.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary-600">
              {formatBenefit(offer)}
            </span>
            <span className="text-sm text-gray-500 truncate">
              {offer.partner.name}
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate">{offer.shortDescription}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card onClick={onClick} padding="none" className="overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-3xl flex-shrink-0 shadow-sm">
            {offer.partner.logo}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 leading-tight mb-0.5">
              {offer.partner.name}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-1">{offer.title}</p>
          </div>
          {offer.featured && (
            <Chip variant="primary" size="sm" icon={<Zap className="w-3 h-3" />}>
              Топ
            </Chip>
          )}
        </div>

        {/* Benefit */}
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-3 mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary-600">
              {formatBenefit(offer)}
            </span>
            <span className="text-sm text-gray-600">
              {offer.benefit.maxAmount && `до ${offer.benefit.maxAmount}₽`}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1">{offer.shortDescription}</p>
        </div>

        {/* Conditions chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Chip size="sm" icon={<CreditCard className="w-3 h-3" />}>
            {formatPaymentMethod(offer.conditions.paymentMethod)}
          </Chip>
          {offer.conditions.minPurchase && (
            <Chip size="sm">от {offer.conditions.minPurchase}₽</Chip>
          )}
          {offer.conditions.format !== 'both' && (
            <Chip size="sm" icon={<MapPin className="w-3 h-3" />}>
              {offer.conditions.format === 'online' ? 'Онлайн' : 'В магазине'}
            </Chip>
          )}
          <Chip
            size="sm"
            variant={offer.validity.remainingDays <= 7 ? 'warning' : 'default'}
            icon={<Clock className="w-3 h-3" />}
          >
            {getDaysText(offer.validity.remainingDays)}
          </Chip>
        </div>

        {/* CTA */}
        {isActivated ? (
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-500">Осталось: </span>
              <span className="font-medium text-gray-900">
                {activatedOffer?.usagesLeft ?? '∞'} использ.
              </span>
            </div>
            <Button size="sm" variant="success" disabled>
              Активно
            </Button>
          </div>
        ) : offer.status === 'available' ? (
          <Button onClick={handleActivate} size="md" className="w-full">
            Активировать
          </Button>
        ) : (
          <Button size="md" variant="secondary" disabled className="w-full">
            Недоступно
          </Button>
        )}
      </div>
    </Card>
  );
}
