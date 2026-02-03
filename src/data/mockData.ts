import type { Offer, ActivatedOffer, Transaction, Category, Partner } from '../types';

export const partners: Partner[] = [
  { id: 'p1', name: 'Яндекс Маркет', logo: '🛒', category: 'marketplace' },
  { id: 'p2', name: 'Ozon', logo: '📦', category: 'marketplace' },
  { id: 'p3', name: 'Wildberries', logo: '🛍️', category: 'marketplace' },
  { id: 'p4', name: 'Лента', logo: '🏪', category: 'grocery' },
  { id: 'p5', name: 'Пятёрочка', logo: '🍎', category: 'grocery' },
  { id: 'p6', name: 'Магнит', logo: '🧲', category: 'grocery' },
  { id: 'p7', name: 'М.Видео', logo: '📺', category: 'electronics' },
  { id: 'p8', name: 'DNS', logo: '💻', category: 'electronics' },
  { id: 'p9', name: 'Спортмастер', logo: '⚽', category: 'sports' },
  { id: 'p10', name: 'Zara', logo: '👗', category: 'fashion' },
  { id: 'p11', name: 'Аптека.ру', logo: '💊', category: 'health' },
  { id: 'p12', name: 'Кофемания', logo: '☕', category: 'restaurants' },
  { id: 'p13', name: 'Якитория', logo: '🍣', category: 'restaurants' },
  { id: 'p14', name: 'АЗС Лукойл', logo: '⛽', category: 'fuel' },
  { id: 'p15', name: 'Самокат', logo: '🛵', category: 'delivery' },
];

export const categories: Category[] = [
  { id: 'all', name: 'Все', icon: '✨', count: 24 },
  { id: 'marketplace', name: 'Маркетплейсы', icon: '🛒', count: 6 },
  { id: 'grocery', name: 'Продукты', icon: '🥬', count: 5 },
  { id: 'restaurants', name: 'Рестораны', icon: '🍽️', count: 4 },
  { id: 'electronics', name: 'Электроника', icon: '📱', count: 3 },
  { id: 'fashion', name: 'Одежда', icon: '👕', count: 2 },
  { id: 'fuel', name: 'АЗС', icon: '⛽', count: 2 },
  { id: 'health', name: 'Аптеки', icon: '💊', count: 2 },
];

export const offers: Offer[] = [
  {
    id: '1',
    partner: partners[0],
    title: '7% бонусами на Яндекс Маркете',
    benefit: { type: 'percent', value: 7, maxAmount: 500 },
    conditions: {
      paymentMethod: 'sbp',
      minPurchase: 1000,
      maxUsages: 3,
      format: 'online',
    },
    validity: {
      startDate: '2025-01-01',
      endDate: '2025-02-15',
      remainingDays: 12,
    },
    status: 'available',
    confirmationSLA: 5,
    shortDescription: 'Оплатите СБП — получите 7% бонусами',
    fullConditions: 'Акция действует при оплате через СБП на сумму от 1000₽. Максимальный размер бонусов — 500₽ за покупку. Бонусы начисляются в течение 5 рабочих дней после подтверждения оплаты. Количество использований ограничено — 3 покупки на одного пользователя.',
    steps: ['Активируйте оффер', 'Оплатите покупку через СБП', 'Получите бонусы в течение 5 дней'],
    deepLink: 'https://market.yandex.ru',
    tags: ['Топ', 'СБП'],
    featured: true,
    personalScore: 95,
  },
  {
    id: '2',
    partner: partners[1],
    title: '10% кэшбэк в Ozon',
    benefit: { type: 'cashback', value: 10, maxAmount: 1000 },
    conditions: {
      paymentMethod: 'card',
      minPurchase: 2000,
      maxUsages: 2,
      format: 'online',
    },
    validity: {
      startDate: '2025-01-10',
      endDate: '2025-02-10',
      remainingDays: 7,
    },
    status: 'available',
    confirmationSLA: 7,
    shortDescription: 'Оплатите картой от 2000₽ — 10% вернётся',
    fullConditions: 'Кэшбэк 10% при оплате банковской картой. Минимальная сумма покупки — 2000₽. Максимальный кэшбэк — 1000₽. Срок зачисления — до 7 рабочих дней.',
    steps: ['Активируйте оффер', 'Оплатите картой от 2000₽', 'Кэшбэк придёт в течение 7 дней'],
    deepLink: 'https://ozon.ru',
    tags: ['Кэшбэк', 'Скоро закончится'],
    featured: true,
    personalScore: 88,
  },
  {
    id: '3',
    partner: partners[4],
    title: '200₽ за покупку в Пятёрочке',
    benefit: { type: 'fixed', value: 200, currency: '₽' },
    conditions: {
      paymentMethod: 'sbp',
      minPurchase: 1500,
      maxUsages: 1,
      format: 'offline',
    },
    validity: {
      startDate: '2025-01-05',
      endDate: '2025-01-31',
      remainingDays: 28,
    },
    status: 'available',
    confirmationSLA: 3,
    shortDescription: 'Купите на 1500₽ через СБП — получите 200₽',
    fullConditions: 'Единоразовый бонус 200₽ при покупке от 1500₽ через СБП в любом магазине Пятёрочка.',
    steps: ['Активируйте оффер', 'Совершите покупку от 1500₽ в магазине', 'Оплатите через СБП'],
    tags: ['Рядом', 'СБП'],
    personalScore: 82,
    locations: [
      { id: 'l1', name: 'Пятёрочка', address: 'ул. Ленина, 15', distance: 0.3 },
      { id: 'l2', name: 'Пятёрочка', address: 'пр. Мира, 42', distance: 0.8 },
    ],
  },
  {
    id: '4',
    partner: partners[6],
    title: '5% на технику в М.Видео',
    benefit: { type: 'percent', value: 5, maxAmount: 3000 },
    conditions: {
      paymentMethod: 'any',
      minPurchase: 5000,
      format: 'both',
    },
    validity: {
      startDate: '2025-01-01',
      endDate: '2025-03-01',
      remainingDays: 56,
    },
    status: 'available',
    confirmationSLA: 10,
    shortDescription: 'Любой способ оплаты — 5% бонусами',
    fullConditions: '5% бонусами при покупке от 5000₽. Работает онлайн и в розничных магазинах. Любой способ оплаты.',
    steps: ['Активируйте оффер', 'Купите на сумму от 5000₽', 'Бонусы придут за 10 дней'],
    deepLink: 'https://mvideo.ru',
    tags: ['Электроника'],
    personalScore: 75,
  },
  {
    id: '5',
    partner: partners[11],
    title: '15% в Кофемании',
    benefit: { type: 'percent', value: 15 },
    conditions: {
      paymentMethod: 'sbp',
      minPurchase: 500,
      maxUsages: 5,
      format: 'offline',
    },
    validity: {
      startDate: '2025-01-01',
      endDate: '2025-02-28',
      remainingDays: 25,
    },
    status: 'available',
    confirmationSLA: 2,
    shortDescription: 'Оплатите СБП — скидка 15% сразу',
    fullConditions: 'Скидка 15% применяется автоматически при оплате через СБП. Минимальный чек 500₽.',
    steps: ['Активируйте оффер', 'Закажите в Кофемании', 'Оплатите через СБП'],
    tags: ['Рестораны', 'СБП'],
    personalScore: 70,
    locations: [
      { id: 'l3', name: 'Кофемания', address: 'ТЦ Метрополис, 3 этаж', distance: 1.2 },
    ],
  },
  {
    id: '6',
    partner: partners[13],
    title: '3₽/литр на АЗС Лукойл',
    benefit: { type: 'fixed', value: 3, currency: '₽/л' },
    conditions: {
      paymentMethod: 'sbp',
      minPurchase: 1000,
      maxUsages: 10,
      format: 'offline',
    },
    validity: {
      startDate: '2025-01-01',
      endDate: '2025-04-01',
      remainingDays: 87,
    },
    status: 'available',
    confirmationSLA: 1,
    shortDescription: 'СБП на заправке — экономия 3₽ на литре',
    fullConditions: 'Скидка 3₽ за литр при оплате через СБП. Минимальная заправка на 1000₽. До 10 заправок.',
    steps: ['Активируйте оффер', 'Заправьтесь на 1000₽+', 'Оплатите СБП — скидка применится'],
    tags: ['АЗС', 'СБП', 'Рядом'],
    personalScore: 65,
  },
  {
    id: '7',
    partner: partners[2],
    title: '8% кэшбэк Wildberries',
    benefit: { type: 'cashback', value: 8, maxAmount: 800 },
    conditions: {
      paymentMethod: 'sbp',
      minPurchase: 3000,
      maxUsages: 2,
      format: 'online',
    },
    validity: {
      startDate: '2025-01-15',
      endDate: '2025-02-05',
      remainingDays: 2,
    },
    status: 'available',
    confirmationSLA: 14,
    shortDescription: 'СБП от 3000₽ — 8% кэшбэк',
    fullConditions: 'Кэшбэк 8% при оплате через СБП. Минимальный заказ 3000₽. Максимальный кэшбэк 800₽ за заказ.',
    steps: ['Активируйте', 'Оформите заказ от 3000₽', 'Оплатите СБП'],
    deepLink: 'https://wildberries.ru',
    tags: ['Маркетплейс', 'СБП', 'Скоро закончится'],
    personalScore: 90,
  },
  {
    id: '8',
    partner: partners[14],
    title: 'Бесплатная доставка Самокат',
    benefit: { type: 'fixed', value: 0, currency: 'Бесплатно' },
    conditions: {
      paymentMethod: 'any',
      minPurchase: 800,
      maxUsages: 3,
      format: 'online',
    },
    validity: {
      startDate: '2025-01-01',
      endDate: '2025-02-28',
      remainingDays: 25,
    },
    status: 'available',
    confirmationSLA: 0,
    shortDescription: '3 бесплатные доставки при заказе от 800₽',
    fullConditions: 'Бесплатная доставка применяется автоматически. Минимальный заказ 800₽. 3 использования.',
    steps: ['Активируйте', 'Закажите от 800₽', 'Доставка будет бесплатной'],
    deepLink: 'https://samokat.ru',
    tags: ['Доставка', 'Продукты'],
    personalScore: 85,
  },
];

export const activatedOffers: ActivatedOffer[] = [
  {
    ...offers[0],
    status: 'activated',
    activatedAt: '2025-01-20T10:30:00Z',
    expiresAt: '2025-02-15T23:59:59Z',
    usagesLeft: 2,
  },
  {
    ...offers[5],
    status: 'activated',
    activatedAt: '2025-01-18T15:00:00Z',
    expiresAt: '2025-04-01T23:59:59Z',
    usagesLeft: 8,
  },
];

export const transactions: Transaction[] = [
  {
    id: 't1',
    offerId: '1',
    offer: offers[0],
    amount: 2500,
    benefit: 175,
    status: 'pending',
    createdAt: '2025-01-25T14:30:00Z',
    expectedConfirmation: '2025-01-30T14:30:00Z',
    canDispute: false,
  },
  {
    id: 't2',
    offerId: '1',
    offer: offers[0],
    amount: 4200,
    benefit: 294,
    status: 'confirmed',
    createdAt: '2025-01-22T11:15:00Z',
    confirmedAt: '2025-01-24T09:00:00Z',
    canDispute: false,
  },
  {
    id: 't3',
    offerId: '3',
    offer: offers[2],
    amount: 1800,
    benefit: 200,
    status: 'rejected',
    createdAt: '2025-01-20T16:45:00Z',
    rejectionReason: 'Оплата произведена не через СБП. Для получения бонуса необходимо оплатить покупку через Систему быстрых платежей.',
    canDispute: true,
  },
  {
    id: 't4',
    offerId: '5',
    offer: offers[4],
    amount: 850,
    benefit: 127,
    status: 'reversed',
    createdAt: '2025-01-15T13:20:00Z',
    confirmedAt: '2025-01-17T10:00:00Z',
    rejectionReason: 'Возврат товара. Бонусы были сторнированы.',
    canDispute: false,
  },
  {
    id: 't5',
    offerId: '6',
    offer: offers[5],
    amount: 2100,
    benefit: 63,
    status: 'confirmed',
    createdAt: '2025-01-19T08:00:00Z',
    confirmedAt: '2025-01-20T08:00:00Z',
    canDispute: false,
  },
];

export function formatBenefit(offer: Offer): string {
  const { benefit } = offer;
  switch (benefit.type) {
    case 'percent':
      return `${benefit.value}%`;
    case 'cashback':
      return `${benefit.value}% кэшбэк`;
    case 'fixed':
      return benefit.currency === 'Бесплатно'
        ? 'Бесплатно'
        : `${benefit.value}${benefit.currency || '₽'}`;
    default:
      return `${benefit.value}`;
  }
}

export function formatPaymentMethod(method: string): string {
  switch (method) {
    case 'sbp': return 'СБП';
    case 'card': return 'Картой';
    case 'any': return 'Любой способ';
    default: return method;
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysText(days: number): string {
  if (days === 0) return 'Сегодня';
  if (days === 1) return '1 день';
  if (days < 5) return `${days} дня`;
  return `${days} дней`;
}
