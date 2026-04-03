/**
 * Mock data for GitHub Pages demo (no backend).
 * 18 categories, 90+ partners with offers.
 */

const today = new Date().toISOString().split('T')[0]
const inThreeMonths = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
const inTwoMonths = new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
const ts = () => new Date().toISOString()

export const CATEGORIES = [
  'Продуктовые сети',
  'Товары для дома / DIY',
  'Одежда / обувь',
  'Косметика / уход',
  'Спорт / outdoor',
  'QSR / фастфуд',
  'Кофейни',
  'Casual / fine dining',
  'Доставка еды',
  'Электроника / техника',
  'Товары для детей',
  'Книги / хобби / подписки',
  'АЗС / топливо',
  'Отели / авиабилеты',
  'Кино / развлечения / фитнес',
  'Локальные сети / франшизы',
  'Сервисы',
  'Онлайн-сервисы / SaaS',
] as const

type OfferDef = [string, string, string, number, string, number]
// [partner, offerName, category, ratePercent, cashback_type, min_check]

const OFFER_DEFS: OfferDef[] = [
  // Продуктовые сети
  ['Пятёрочка', 'Кэшбэк 10% в Пятёрочке', 'Продуктовые сети', 10, 'percent', 500],
  ['Магнит', '300₽ за первую покупку в Магните', 'Продуктовые сети', 300, 'fixed', 1000],
  ['Лента', 'Кэшбэк 7% в Ленте', 'Продуктовые сети', 7, 'percent', 800],
  ['Перекрёсток', 'Кэшбэк 8% в Перекрёстке', 'Продуктовые сети', 8, 'percent', 600],
  ['ВкусВилл', 'Кэшбэк 12% во ВкусВилле', 'Продуктовые сети', 12, 'percent', 400],
  ['Дикси', 'Кэшбэк 5% в Дикси', 'Продуктовые сети', 5, 'percent', 300],

  // Товары для дома / DIY
  ['Леруа Мерлен', 'Кэшбэк 8% в Леруа Мерлен', 'Товары для дома / DIY', 8, 'percent', 2000],
  ['OBI', 'Кэшбэк 10% в OBI', 'Товары для дома / DIY', 10, 'percent', 1500],
  ['Петрович', 'Кэшбэк 6% в Петровиче', 'Товары для дома / DIY', 6, 'percent', 3000],
  ['Максидом', '500₽ за покупку от 5000₽', 'Товары для дома / DIY', 500, 'fixed', 5000],
  ['Castorama', 'Кэшбэк 7% в Castorama', 'Товары для дома / DIY', 7, 'percent', 2000],

  // Одежда / обувь
  ['Lime', 'Кэшбэк 15% в Lime', 'Одежда / обувь', 15, 'percent', 1500],
  ['Gloria Jeans', 'Кэшбэк 12% в Gloria Jeans', 'Одежда / обувь', 12, 'percent', 1000],
  ['Zarina', 'Кэшбэк 10% в Zarina', 'Одежда / обувь', 10, 'percent', 2000],
  ['befree', 'Кэшбэк 14% в befree', 'Одежда / обувь', 14, 'percent', 1200],
  ['SELA', '500₽ за покупку от 3000₽', 'Одежда / обувь', 500, 'fixed', 3000],
  ['Rendez-Vous', 'Кэшбэк 8% в Rendez-Vous', 'Одежда / обувь', 8, 'percent', 3000],

  // Косметика / уход
  ['Л\'Этуаль', 'Кэшбэк 12% в Л\'Этуаль', 'Косметика / уход', 12, 'percent', 1000],
  ['Золотое Яблоко', 'Кэшбэк 10% в Золотом Яблоке', 'Косметика / уход', 10, 'percent', 1500],
  ['Рив Гош', 'Кэшбэк 8% в Рив Гош', 'Косметика / уход', 8, 'percent', 800],
  ['Магнит Косметик', 'Кэшбэк 15% в Магнит Косметик', 'Косметика / уход', 15, 'percent', 300],
  ['Подружка', 'Кэшбэк 10% в Подружке', 'Косметика / уход', 10, 'percent', 500],

  // Спорт / outdoor
  ['Спортмастер', 'Кэшбэк 10% в Спортмастере', 'Спорт / outdoor', 10, 'percent', 2000],
  ['Декатлон', 'Кэшбэк 8% в Декатлоне', 'Спорт / outdoor', 8, 'percent', 1500],
  ['Триал-Спорт', 'Кэшбэк 12% в Триал-Спорт', 'Спорт / outdoor', 12, 'percent', 2000],
  ['Кант', '1000₽ за покупку от 10000₽', 'Спорт / outdoor', 1000, 'fixed', 10000],
  ['Adidas', 'Кэшбэк 7% в Adidas', 'Спорт / outdoor', 7, 'percent', 3000],

  // QSR / фастфуд
  ['Вкусно — и точка', 'Кэшбэк 20% во Вкусно — и точка', 'QSR / фастфуд', 20, 'percent', 200],
  ['Ростикс', 'Кэшбэк 15% в Ростикс', 'QSR / фастфуд', 15, 'percent', 250],
  ['KFC', 'Кэшбэк 15% в KFC', 'QSR / фастфуд', 15, 'percent', 300],
  ['Burger King', 'Кэшбэк 18% в Burger King', 'QSR / фастфуд', 18, 'percent', 200],
  ['Subway', 'Кэшбэк 12% в Subway', 'QSR / фастфуд', 12, 'percent', 300],
  ['Теремок', 'Кэшбэк 10% в Теремке', 'QSR / фастфуд', 10, 'percent', 250],

  // Кофейни
  ['Шоколадница', 'Кэшбэк 15% в Шоколаднице', 'Кофейни', 15, 'percent', 200],
  ['Surf Coffee', 'Кэшбэк 20% в Surf Coffee', 'Кофейни', 20, 'percent', 150],
  ['One Price Coffee', 'Кэшбэк 25% в One Price Coffee', 'Кофейни', 25, 'percent', 100],
  ['Кофемания', 'Кэшбэк 10% в Кофемании', 'Кофейни', 10, 'percent', 500],
  ['Даблби', 'Кэшбэк 15% в Даблби', 'Кофейни', 15, 'percent', 200],

  // Casual / fine dining
  ['Якитория', 'Кэшбэк 12% в Якитории', 'Casual / fine dining', 12, 'percent', 1000],
  ['Тануки', 'Кэшбэк 10% в Тануки', 'Casual / fine dining', 10, 'percent', 1200],
  ['IL Патио', 'Кэшбэк 15% в IL Патио', 'Casual / fine dining', 15, 'percent', 800],
  ['Чайхона №1', 'Кэшбэк 8% в Чайхоне №1', 'Casual / fine dining', 8, 'percent', 1500],
  ['Мясо&Рыба', 'Кэшбэк 10% в Мясо&Рыба', 'Casual / fine dining', 10, 'percent', 2000],

  // Доставка еды
  ['Яндекс Еда', 'Кэшбэк 20% на Яндекс Еда', 'Доставка еды', 20, 'percent', 500],
  ['Delivery Club', 'Кэшбэк 15% в Delivery Club', 'Доставка еды', 15, 'percent', 600],
  ['Самокат', 'Кэшбэк 10% в Самокате', 'Доставка еды', 10, 'percent', 300],
  ['Лавка', 'Кэшбэк 12% в Яндекс Лавке', 'Доставка еды', 12, 'percent', 400],
  ['СберМаркет', 'Кэшбэк 8% в СберМаркете', 'Доставка еды', 8, 'percent', 1000],

  // Электроника / техника
  ['М.Видео', 'Кэшбэк 5% в М.Видео', 'Электроника / техника', 5, 'percent', 5000],
  ['Эльдорадо', 'Кэшбэк 6% в Эльдорадо', 'Электроника / техника', 6, 'percent', 3000],
  ['DNS', 'Кэшбэк 4% в DNS', 'Электроника / техника', 4, 'percent', 5000],
  ['re:Store', 'Кэшбэк 3% в re:Store', 'Электроника / техника', 3, 'percent', 10000],
  ['Ситилинк', 'Кэшбэк 5% в Ситилинке', 'Электроника / техника', 5, 'percent', 3000],

  // Товары для детей
  ['Детский мир', 'Кэшбэк 10% в Детском мире', 'Товары для детей', 10, 'percent', 1000],
  ['Кораблик', 'Кэшбэк 8% в Кораблике', 'Товары для детей', 8, 'percent', 800],
  ['Дочки-Сыночки', 'Кэшбэк 12% в Дочки-Сыночки', 'Товары для детей', 12, 'percent', 1000],
  ['Mothercare', 'Кэшбэк 10% в Mothercare', 'Товары для детей', 10, 'percent', 2000],
  ['Toy.ru', '500₽ за покупку от 3000₽', 'Товары для детей', 500, 'fixed', 3000],

  // Книги / хобби / подписки
  ['Литрес', 'Кэшбэк 25% на Литрес', 'Книги / хобби / подписки', 25, 'percent', 200],
  ['Читай-город', 'Кэшбэк 10% в Читай-городе', 'Книги / хобби / подписки', 10, 'percent', 500],
  ['Hobby Games', 'Кэшбэк 15% в Hobby Games', 'Книги / хобби / подписки', 15, 'percent', 500],
  ['Леонардо', 'Кэшбэк 8% в Леонардо', 'Книги / хобби / подписки', 8, 'percent', 800],
  ['Яндекс Плюс', '200₽ за подписку', 'Книги / хобби / подписки', 200, 'fixed', 300],

  // АЗС / топливо
  ['Лукойл', 'Кэшбэк 5% на АЗС Лукойл', 'АЗС / топливо', 5, 'percent', 1000],
  ['Газпромнефть', 'Кэшбэк 5% на АЗС Газпромнефть', 'АЗС / топливо', 5, 'percent', 1000],
  ['Роснефть', 'Кэшбэк 4% на АЗС Роснефть', 'АЗС / топливо', 4, 'percent', 1000],
  ['Shell', 'Кэшбэк 6% на АЗС Shell', 'АЗС / топливо', 6, 'percent', 1500],
  ['Татнефть', 'Кэшбэк 4% на АЗС Татнефть', 'АЗС / топливо', 4, 'percent', 800],

  // Отели / авиабилеты
  ['Островок', 'Кэшбэк 8% на Островок', 'Отели / авиабилеты', 8, 'percent', 5000],
  ['Aviasales', 'Кэшбэк 3% на Aviasales', 'Отели / авиабилеты', 3, 'percent', 5000],
  ['Яндекс Путешествия', 'Кэшбэк 5% на Яндекс Путешествия', 'Отели / авиабилеты', 5, 'percent', 3000],
  ['Суточно.ру', 'Кэшбэк 7% на Суточно.ру', 'Отели / авиабилеты', 7, 'percent', 3000],
  ['Туту.ру', 'Кэшбэк 4% на Туту.ру', 'Отели / авиабилеты', 4, 'percent', 2000],

  // Кино / развлечения / фитнес
  ['Кинопоиск', 'Кэшбэк 30% на Кинопоиск', 'Кино / развлечения / фитнес', 30, 'percent', 300],
  ['World Class', 'Кэшбэк 10% в World Class', 'Кино / развлечения / фитнес', 10, 'percent', 5000],
  ['DDX Фитнес', 'Кэшбэк 15% в DDX Фитнес', 'Кино / развлечения / фитнес', 15, 'percent', 2000],
  ['Каро', 'Кэшбэк 20% в кинотеатрах КАРО', 'Кино / развлечения / фитнес', 20, 'percent', 300],
  ['Иви', 'Кэшбэк 25% на подписку Иви', 'Кино / развлечения / фитнес', 25, 'percent', 300],

  // Локальные сети / франшизы
  ['Fix Price', 'Кэшбэк 10% в Fix Price', 'Локальные сети / франшизы', 10, 'percent', 300],
  ['Красное & Белое', 'Кэшбэк 5% в Красное & Белое', 'Локальные сети / франшизы', 5, 'percent', 500],
  ['Бристоль', 'Кэшбэк 7% в Бристоле', 'Локальные сети / франшизы', 7, 'percent', 400],
  ['Светофор', 'Кэшбэк 5% в Светофоре', 'Локальные сети / франшизы', 5, 'percent', 500],
  ['Верный', 'Кэшбэк 6% в Верном', 'Локальные сети / франшизы', 6, 'percent', 400],

  // Сервисы (авто, ремонт, клининг)
  ['Яндекс Драйв', 'Кэшбэк 15% на Яндекс Драйв', 'Сервисы', 15, 'percent', 500],
  ['Uremont', 'Кэшбэк 10% на Uremont', 'Сервисы', 10, 'percent', 2000],
  ['Профи.ру', 'Кэшбэк 8% на Профи.ру', 'Сервисы', 8, 'percent', 1000],
  ['Клин Клин', 'Кэшбэк 12% на клининг', 'Сервисы', 12, 'percent', 2000],
  ['FitService', 'Кэшбэк 7% на FitService', 'Сервисы', 7, 'percent', 3000],

  // Онлайн-сервисы / SaaS B2C
  ['Яндекс Музыка', 'Кэшбэк 30% на Яндекс Музыку', 'Онлайн-сервисы / SaaS', 30, 'percent', 200],
  ['VK Музыка', 'Кэшбэк 25% на VK Музыку', 'Онлайн-сервисы / SaaS', 25, 'percent', 200],
  ['Skillbox', 'Кэшбэк 10% на Skillbox', 'Онлайн-сервисы / SaaS', 10, 'percent', 5000],
  ['GeekBrains', 'Кэшбэк 8% на GeekBrains', 'Онлайн-сервисы / SaaS', 8, 'percent', 5000],
  ['Нетология', 'Кэшбэк 12% на Нетологию', 'Онлайн-сервисы / SaaS', 12, 'percent', 3000],
  ['МТС Музыка', 'Кэшбэк 20% на МТС Музыку', 'Онлайн-сервисы / SaaS', 20, 'percent', 200],
]

function makeOffer(def: OfferDef, idx: number) {
  const [partner, name, category, rateVal, cbType, minCheck] = def
  const rate = cbType === 'percent' ? (rateVal / 100).toFixed(4) : rateVal.toFixed(4)
  const maxTx = cbType === 'percent' ? Math.max(500, Math.round(minCheck * rateVal / 100 * 3)) : rateVal
  const budget = cbType === 'percent' ? 500000 : 200000
  const spent = Math.round(budget * (0.05 + Math.random() * 0.4))
  return {
    id: `offer-${idx + 1}`,
    partner_id: `p-${partner.toLowerCase().replace(/[^a-zа-я0-9]/g, '-')}`,
    partner_name: partner,
    partner_logo: null,
    name,
    description: `Оплачивайте покупки в ${partner} через СБП и получайте ${cbType === 'percent' ? rateVal + '%' : rateVal + '₽'} кэшбэк на счёт Билайн.`,
    image_url: null,
    cashback_type: cbType,
    cashback_rate: rate,
    min_check: minCheck.toFixed(2),
    max_cashback_per_tx: maxTx.toFixed(2),
    max_cashback_per_client: (maxTx * 5).toFixed(2),
    budget: budget.toFixed(2),
    budget_spent: spent.toFixed(2),
    start_date: today,
    end_date: inThreeMonths,
    status: 'active' as const,
    segment: 'all',
    geo: null,
    created_at: ts(),
    terminals_count: 3 + Math.floor(Math.random() * 20),
    placements: [{ id: idx + 1, placement_type: 'catalog' as const, cpm_rate: null, budget: null, budget_spent: '0.00', impressions: 5000 + Math.floor(Math.random() * 50000), clicks: 500 + Math.floor(Math.random() * 5000), start_date: null, end_date: null }],
    category,
  }
}

export const DEMO_OFFERS = OFFER_DEFS.map((d, i) => makeOffer(d, i))

// Build unique partners from offers
const partnerMap = new Map<string, typeof DEMO_PARTNERS[0]>()
DEMO_OFFERS.forEach(o => {
  if (!partnerMap.has(o.partner_id)) {
    partnerMap.set(o.partner_id, {
      id: o.partner_id,
      name: o.partner_name,
      logo_url: null,
      contact_email: `partner@${o.partner_name.toLowerCase().replace(/[^a-zа-я0-9]/g, '')}.ru`,
      contact_phone: '+7 (495) ' + String(1000000 + Math.floor(Math.random() * 9000000)).replace(/(\d{3})(\d{2})(\d{2})/, '$1-$2-$3'),
      balance: (100000 + Math.floor(Math.random() * 900000)).toFixed(2),
      status: 'active',
      created_at: ts(),
      offers_count: 0,
    })
  }
  partnerMap.get(o.partner_id)!.offers_count++
})
export const DEMO_PARTNERS = Array.from(partnerMap.values())

export const DEMO_CASHBACK_HISTORY = [
  { date: new Date(Date.now() - 1 * 86400000).toISOString(), partner_name: 'Пятёрочка', purchase_amount: '1380.00', cashback_amount: '138.00', status: 'pending' },
  { date: new Date(Date.now() - 2 * 86400000).toISOString(), partner_name: 'Шоколадница', purchase_amount: '650.00', cashback_amount: '97.50', status: 'approved' },
  { date: new Date(Date.now() - 3 * 86400000).toISOString(), partner_name: 'Яндекс Еда', purchase_amount: '1890.00', cashback_amount: '378.00', status: 'approved' },
  { date: new Date(Date.now() - 5 * 86400000).toISOString(), partner_name: 'Лукойл', purchase_amount: '3200.00', cashback_amount: '160.00', status: 'paid' },
  { date: new Date(Date.now() - 7 * 86400000).toISOString(), partner_name: 'Спортмастер', purchase_amount: '4500.00', cashback_amount: '450.00', status: 'paid' },
  { date: new Date(Date.now() - 10 * 86400000).toISOString(), partner_name: 'Магнит', purchase_amount: '1200.00', cashback_amount: '300.00', status: 'paid' },
  { date: new Date(Date.now() - 14 * 86400000).toISOString(), partner_name: 'Lime', purchase_amount: '5600.00', cashback_amount: '840.00', status: 'paid' },
]

export const DEMO_BILLING_TRANSACTIONS = [
  { id: 1, type: 'topup', amount: '1000000.00', balance_after: '1000000.00', reference_id: null, created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 2, type: 'cashback', amount: '-89200.00', balance_after: '910800.00', reference_id: 'offer-1', created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
  { id: 3, type: 'commission', amount: '-32100.00', balance_after: '878700.00', reference_id: 'offer-1', created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
  { id: 4, type: 'cpm', amount: '-2100.00', balance_after: '876600.00', reference_id: 'offer-1', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
]

export const DEMO_DASHBOARD = {
  active_offers: DEMO_OFFERS.length,
  total_transactions_today: 4823,
  total_transactions_week: 31547,
  cashback_today: '187430.00',
  cashback_week: '1243560.00',
  partners_count: DEMO_PARTNERS.length,
  low_balance_partners: 2,
}

export const DEMO_OFFER_STATS = {
  offer_id: 'offer-1',
  impressions: 85000,
  clicks: 3500,
  ctr: 4.12,
  activations: 1240,
  purchases: 890,
  gmv: '3456000.00',
  cashback_total: '123400.00',
  budget_remaining: '376600.00',
}

export const DEMO_REVSHARE = {
  period_start: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
  period_end: today,
  total_gmv: '56780000.00',
  total_commission: '2044080.00',
  revshare_traffic_holder: '408816.00',
  revshare_nspk: '347493.60',
  revshare_beeline: '204408.00',
  net_platform: '1083362.40',
}

export const DEMO_PNL = DEMO_PARTNERS.slice(0, 10).map(p => ({
  partner_id: p.id,
  partner_name: p.name,
  gmv: (500000 + Math.floor(Math.random() * 5000000)).toFixed(2),
  commission: (18000 + Math.floor(Math.random() * 180000)).toFixed(2),
  cashback: (15000 + Math.floor(Math.random() * 150000)).toFixed(2),
  net: (9000 + Math.floor(Math.random() * 90000)).toFixed(2),
}))

// --- Auth helpers ---

function makeFakeJwt(role: string, partnerId?: string) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ sub: `user-${role}`, role, partner_id: partnerId, exp: Math.floor(Date.now() / 1000) + 86400 }))
  return `${header}.${payload}.fakesignature`
}

export const DEMO_USERS: Record<string, { password: string; role: string; partner_id?: string }> = {
  'admin@beeline.ru': { password: 'admin123', role: 'operator' },
  'partner@pyaterochka.ru': { password: 'partner123', role: 'partner_admin', partner_id: 'p-пятёрочка' },
  'partner@magnit.ru': { password: 'partner123', role: 'partner_admin', partner_id: 'p-магнит' },
}

// --- Mock API handler ---

export function mockApiCall(method: string, path: string, body?: unknown): unknown {
  // Auth
  if (method === 'POST' && path === '/auth/login') {
    const { email, password } = body as { email: string; password: string }
    const user = DEMO_USERS[email]
    if (user && user.password === password) {
      return { access_token: makeFakeJwt(user.role, user.partner_id), refresh_token: makeFakeJwt(user.role, user.partner_id), token_type: 'bearer' }
    }
    throw new Error('Invalid credentials')
  }
  if (method === 'POST' && path === '/auth/refresh') {
    return { access_token: makeFakeJwt('operator'), refresh_token: makeFakeJwt('operator') }
  }

  // Client API
  if (method === 'GET' && path.match(/^\/client\/[^/]+\/offers$/)) {
    return DEMO_OFFERS.filter(o => o.status === 'active').map(o => ({ ...o, status: 'new' }))
  }
  if (method === 'GET' && path.match(/^\/client\/[^/]+\/offers\/[^/]+$/)) {
    const offerId = path.split('/').pop()
    return DEMO_OFFERS.find(o => o.id === offerId) || DEMO_OFFERS[0]
  }
  if (method === 'POST' && path.match(/^\/client\/[^/]+\/activate\//)) {
    return { offer_id: path.split('/').pop(), activated_at: ts(), status: 'active' }
  }
  if (method === 'GET' && path.match(/^\/client\/[^/]+\/cashback$/)) return DEMO_CASHBACK_HISTORY
  if (method === 'GET' && path.match(/^\/client\/[^/]+\/cashback\/total$/)) return { total: '2363.50' }

  // Partner API
  if (method === 'GET' && path === '/offers') return DEMO_OFFERS.filter(o => o.partner_id === 'p-пятёрочка')
  if (method === 'POST' && path === '/offers') return { id: 'offer-new-' + Date.now(), ...body, status: 'draft', budget_spent: '0.00', created_at: ts() }
  if (method === 'GET' && path.match(/^\/offers\/[^/]+$/)) {
    const id = path.split('/').pop()
    return DEMO_OFFERS.find(o => o.id === id) || DEMO_OFFERS[0]
  }
  if (method === 'PUT' && path.match(/^\/offers\/[^/]+$/)) return { ...DEMO_OFFERS[0], ...body }
  if (method === 'PUT' && path.match(/^\/offers\/[^/]+\/status$/)) return { ...DEMO_OFFERS[0], ...body }
  if (method === 'POST' && path.match(/\/terminals$/)) return { uploaded: 5 }
  if (method === 'POST' && path.match(/\/image$/)) return { image_url: '/uploads/demo.jpg' }
  if (method === 'POST' && path.match(/\/placements$/)) return body
  if (method === 'GET' && path.match(/\/stats\/daily$/)) {
    return Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
      impressions: 5000 + Math.floor(Math.random() * 3000), clicks: 200 + Math.floor(Math.random() * 150),
      activations: 50 + Math.floor(Math.random() * 40), purchases: 30 + Math.floor(Math.random() * 30),
      gmv: (200000 + Math.floor(Math.random() * 100000)).toFixed(2), cashback: (8000 + Math.floor(Math.random() * 5000)).toFixed(2),
    }))
  }
  if (method === 'GET' && path.match(/\/stats$/)) return DEMO_OFFER_STATS

  // Billing
  if (method === 'GET' && path === '/billing/balance') return { partner_id: 'p-пятёрочка', balance: '876600.00' }
  if (method === 'GET' && path === '/billing/transactions') return DEMO_BILLING_TRANSACTIONS

  // Admin
  if (method === 'GET' && path === '/admin/dashboard') return DEMO_DASHBOARD
  if (method === 'GET' && path === '/admin/partners') return DEMO_PARTNERS
  if (method === 'POST' && path === '/admin/partners') return { id: 'partner-new', ...body, balance: '0.00', status: 'active', created_at: ts(), offers_count: 0 }
  if (method === 'PUT' && path.match(/\/admin\/partners\/[^/]+\/balance$/)) return { partner_id: path.split('/')[3], new_balance: '100000.00' }
  if (method === 'PUT' && path.match(/\/admin\/offers\/[^/]+\/moderate$/)) return { offer_id: path.split('/')[3], status: 'active', comment: null }
  if (method === 'POST' && path === '/admin/registry/upload') return { batch_id: 'batch-demo', total: 4823, matched: 3891, errors: 47 }
  if (method === 'GET' && path.match(/\/admin\/registry\//)) return { batch_id: 'batch-demo', filename: 'nspk_registry.csv', records_total: 4823, records_matched: 3891, records_errors: 47, records_antifraud: 112, status: 'completed' }
  if (method === 'GET' && path === '/admin/finance/revshare') return DEMO_REVSHARE
  if (method === 'GET' && path === '/admin/finance/pnl') return DEMO_PNL

  // Payouts
  if (method === 'POST' && path === '/payouts/generate') return { id: 'payout-demo', type: 'client', total_amount: '1243560.00', records_count: 3891, status: 'generated', created_at: ts() }

  return {}
}
