import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  Clock,
  CreditCard,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Header, Button, Card, Chip } from '../components';
import { useApp } from '../context/AppContext';
import { formatBenefit, formatPaymentMethod, getDaysText } from '../data/mockData';

export function OfferDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getOfferById, getActivatedOfferById, activateOffer } = useApp();

  const [showConditions, setShowConditions] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const justActivated = searchParams.get('activated') === 'true';
  const activatedOffer = getActivatedOfferById(id || '');
  const offer = activatedOffer || getOfferById(id || '');

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Оффер" showBack />
        <div className="p-4 text-center text-gray-500">Оффер не найден</div>
      </div>
    );
  }

  const isActivated = !!activatedOffer;

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await activateOffer(offer.id);
      navigate(`/offer/${offer.id}?activated=true`, { replace: true });
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header title={offer.partner.name} showBack />

      <main className="px-4 py-4">
        {/* Success state */}
        {justActivated && (
          <Card className="mb-4 bg-gradient-to-r from-success-50 to-success-100 border border-success-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-success-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-success-800 mb-1">
                  Готово! Оффер активирован
                </h3>
                <p className="text-sm text-success-700">
                  Оплатите {formatPaymentMethod(offer.conditions.paymentMethod).toLowerCase()} до{' '}
                  {new Date(offer.validity.endDate).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Partner & Benefit card */}
        <Card className="mb-4" padding="lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-4xl shadow-sm">
              {offer.partner.logo}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{offer.partner.name}</h2>
              <p className="text-sm text-gray-500">{offer.title}</p>
            </div>
          </div>

          {/* Benefit highlight */}
          <div className="bg-gradient-to-r from-primary-50 via-primary-100 to-accent-50 rounded-2xl p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium text-primary-700">Ваша выгода</span>
            </div>
            <div className="text-4xl font-bold text-primary-600 mb-1">
              {formatBenefit(offer)}
            </div>
            {offer.benefit.maxAmount && (
              <p className="text-sm text-gray-600">до {offer.benefit.maxAmount}₽ за покупку</p>
            )}
          </div>
        </Card>

        {/* How to get */}
        <Card className="mb-4" padding="lg">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-500" />
            Как получить
          </h3>
          <div className="space-y-4">
            {offer.steps.map((step, index) => (
              <div key={index} className="flex gap-3">
                <div
                  className={`
                    w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                    text-sm font-bold
                    ${isActivated && index === 0
                      ? 'bg-success-500 text-white'
                      : 'bg-primary-100 text-primary-700'
                    }
                  `}
                >
                  {isActivated && index === 0 ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <p className={`text-gray-700 pt-0.5 ${isActivated && index === 0 ? 'line-through text-gray-400' : ''}`}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Key conditions */}
        <Card className="mb-4" padding="lg">
          <h3 className="font-semibold text-gray-900 mb-3">Условия</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <Chip icon={<CreditCard className="w-3.5 h-3.5" />}>
              {formatPaymentMethod(offer.conditions.paymentMethod)}
            </Chip>
            {offer.conditions.minPurchase && (
              <Chip>от {offer.conditions.minPurchase}₽</Chip>
            )}
            {offer.conditions.maxUsages && (
              <Chip>до {offer.conditions.maxUsages} раз</Chip>
            )}
            <Chip icon={<Clock className="w-3.5 h-3.5" />}>
              {getDaysText(offer.validity.remainingDays)}
            </Chip>
            <Chip icon={<MapPin className="w-3.5 h-3.5" />}>
              {offer.conditions.format === 'online'
                ? 'Онлайн'
                : offer.conditions.format === 'offline'
                ? 'В магазине'
                : 'Онлайн и офлайн'}
            </Chip>
          </div>

          {/* SLA info */}
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                Срок начисления: <span className="font-medium text-gray-900">до {offer.confirmationSLA} дней</span>
              </span>
            </div>
          </div>

          {/* Full conditions expandable */}
          <button
            onClick={() => setShowConditions(!showConditions)}
            className="flex items-center gap-1 text-sm text-primary-600 font-medium tap-highlight-none"
          >
            Подробные условия
            {showConditions ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showConditions && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed">
                {offer.fullConditions}
              </p>
            </div>
          )}
        </Card>

        {/* Locations (if offline) */}
        {offer.locations && offer.locations.length > 0 && (
          <Card className="mb-4" padding="lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              Где работает
            </h3>
            <div className="space-y-3">
              {offer.locations.map((location) => (
                <div key={location.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{location.name}</p>
                    <p className="text-sm text-gray-500">{location.address}</p>
                  </div>
                  {location.distance && (
                    <span className="text-sm text-gray-400">{location.distance} км</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe">
        {isActivated ? (
          <div className="flex gap-3">
            {offer.deepLink && (
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                icon={<ExternalLink className="w-5 h-5" />}
                onClick={() => window.open(offer.deepLink, '_blank')}
              >
                Перейти в магазин
              </Button>
            )}
            <Button
              variant="secondary"
              size="lg"
              className={offer.deepLink ? '' : 'flex-1'}
              onClick={() => navigate('/active')}
            >
              К активным
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={isActivating}
            onClick={handleActivate}
          >
            Активировать
          </Button>
        )}
      </div>
    </div>
  );
}
