/**
 * Mock data for GitHub Pages demo (no backend).
 * When USE_MOCKS is true, API calls return this data instead of fetching from server.
 */

const today = new Date().toISOString().split('T')[0]
const inThreeMonths = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const inTwoMonths = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

export const DEMO_OFFERS = [
  {
    id: 'offer-1',
    partner_id: 'partner-1',
    partner_name: 'Пятёрочка',
    partner_logo: null,
    name: 'Кэшбэк 10% в Пятёрочке',
    description: 'Оплачивайте покупки в Пятёрочке через СБП и получайте 10% кэшбэк на счёт Билайн. Акция действует во всех магазинах сети.',
    image_url: null,
    cashback_type: 'percent',
    cashback_rate: '0.1000',
    min_check: '500.00',
    max_cashback_per_tx: '1000.00',
    max_cashback_per_client: '5000.00',
    budget: '500000.00',
    budget_spent: '123400.00',
    start_date: today,
    end_date: inThreeMonths,
    status: 'active',
    segment: 'all',
    geo: null,
    created_at: new Date().toISOString(),
    terminals_count: 5,
    placements: [
      { id: 1, placement_type: 'catalog', cpm_rate: null, budget: null, budget_spent: '0.00', impressions: 15000, clicks: 2100, start_date: null, end_date: null },
      { id: 2, placement_type: 'push', cpm_rate: '50.00', budget: '10000.00', budget_spent: '3500.00', impressions: 70000, clicks: 1400, start_date: null, end_date: null },
    ],
    category: 'Продукты',
  },
  {
    id: 'offer-2',
    partner_id: 'partner-2',
    partner_name: 'Магнит',
    partner_logo: null,
    name: '300₽ за первую покупку в Магните',
    description: 'Совершите первую покупку в Магните на сумму от 1000₽ через СБП и получите 300₽ кэшбэк.',
    image_url: null,
    cashback_type: 'fixed',
    cashback_rate: '300.0000',
    min_check: '1000.00',
    max_cashback_per_tx: '300.00',
    max_cashback_per_client: '300.00',
    budget: '100000.00',
    budget_spent: '15600.00',
    start_date: today,
    end_date: inTwoMonths,
    status: 'active',
    segment: 'new',
    geo: null,
    created_at: new Date().toISOString(),
    terminals_count: 3,
    placements: [
      { id: 3, placement_type: 'catalog', cpm_rate: null, budget: null, budget_spent: '0.00', impressions: 8000, clicks: 1200, start_date: null, end_date: null },
    ],
    category: 'Продукты',
  },
  {
    id: 'offer-3',
    partner_id: 'partner-1',
    partner_name: 'Пятёрочка',
    name: 'Летняя акция: до 15% кэшбэк',
    description: 'Специальное летнее предложение! Получите повышенный кэшбэк 15% на все покупки в Пятёрочке.',
    image_url: null,
    cashback_type: 'percent',
    cashback_rate: '0.1500',
    min_check: '300.00',
    max_cashback_per_tx: '500.00',
    max_cashback_per_client: '3000.00',
    budget: '200000.00',
    budget_spent: '0.00',
    start_date: inTwoMonths,
    end_date: inThreeMonths,
    status: 'draft',
    segment: 'all',
    geo: null,
    created_at: new Date().toISOString(),
    terminals_count: 0,
    placements: [],
    category: 'Продукты',
  },
  {
    id: 'offer-4',
    partner_id: 'partner-3',
    partner_name: 'Яндекс Еда',
    partner_logo: null,
    name: 'Кэшбэк 20% на доставку',
    description: 'Закажите доставку еды через Яндекс Еда и оплатите через СБП — получите 20% кэшбэк на счёт Билайн.',
    image_url: null,
    cashback_type: 'percent',
    cashback_rate: '0.2000',
    min_check: '800.00',
    max_cashback_per_tx: '500.00',
    max_cashback_per_client: '2000.00',
    budget: '300000.00',
    budget_spent: '67800.00',
    start_date: today,
    end_date: inThreeMonths,
    status: 'active',
    segment: 'all',
    geo: null,
    created_at: new Date().toISOString(),
    terminals_count: 12,
    placements: [
      { id: 4, placement_type: 'catalog', cpm_rate: null, budget: null, budget_spent: '0.00', impressions: 22000, clicks: 4400, start_date: null, end_date: null },
      { id: 5, placement_type: 'stories', cpm_rate: '80.00', budget: '20000.00', budget_spent: '12000.00', impressions: 150000, clicks: 6000, start_date: null, end_date: null },
    ],
    category: 'Рестораны',
  },
]

export const DEMO_PARTNERS = [
  { id: 'partner-1', name: 'Пятёрочка', logo_url: null, contact_email: 'partner@pyaterochka.ru', contact_phone: '+7 (495) 123-45-67', balance: '876600.00', status: 'active', created_at: new Date().toISOString(), offers_count: 2 },
  { id: 'partner-2', name: 'Магнит', logo_url: null, contact_email: 'partner@magnit.ru', contact_phone: '+7 (495) 987-65-43', balance: '484400.00', status: 'active', created_at: new Date().toISOString(), offers_count: 1 },
  { id: 'partner-3', name: 'Яндекс Еда', logo_url: null, contact_email: 'partner@yandex-eda.ru', contact_phone: '+7 (495) 555-12-34', balance: '232200.00', status: 'active', created_at: new Date().toISOString(), offers_count: 1 },
]

export const DEMO_CASHBACK_HISTORY = [
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), partner_name: 'Пятёрочка', purchase_amount: '2340.00', cashback_amount: '234.00', status: 'approved' },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), partner_name: 'Яндекс Еда', purchase_amount: '1890.00', cashback_amount: '378.00', status: 'approved' },
  { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), partner_name: 'Пятёрочка', purchase_amount: '4500.00', cashback_amount: '450.00', status: 'paid' },
  { date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), partner_name: 'Магнит', purchase_amount: '1200.00', cashback_amount: '300.00', status: 'paid' },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), partner_name: 'Пятёрочка', purchase_amount: '1380.00', cashback_amount: '138.00', status: 'pending' },
]

export const DEMO_BILLING_TRANSACTIONS = [
  { id: 1, type: 'topup', amount: '1000000.00', balance_after: '1000000.00', reference_id: null, created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, type: 'cashback', amount: '-89200.00', balance_after: '910800.00', reference_id: 'offer-1', created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 3, type: 'commission', amount: '-32100.00', balance_after: '878700.00', reference_id: 'offer-1', created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 4, type: 'cpm', amount: '-2100.00', balance_after: '876600.00', reference_id: 'offer-1', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
]

export const DEMO_DASHBOARD = {
  active_offers: 3,
  total_transactions_today: 1247,
  total_transactions_week: 8934,
  cashback_today: '45230.00',
  cashback_week: '312450.00',
  partners_count: 3,
  low_balance_partners: 0,
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
  period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  period_end: today,
  total_gmv: '5678000.00',
  total_commission: '204408.00',
  revshare_traffic_holder: '40881.60',
  revshare_nspk: '34749.36',
  revshare_beeline: '20440.80',
  net_platform: '108336.24',
}

export const DEMO_PNL = [
  { partner_id: 'partner-1', partner_name: 'Пятёрочка', gmv: '3456000.00', commission: '124416.00', cashback: '123400.00', net: '62208.00' },
  { partner_id: 'partner-2', partner_name: 'Магнит', gmv: '892000.00', commission: '32112.00', cashback: '15600.00', net: '16056.00' },
  { partner_id: 'partner-3', partner_name: 'Яндекс Еда', gmv: '1330000.00', commission: '47880.00', cashback: '67800.00', net: '23940.00' },
]

// Fake JWT token for demo (contains role info)
function makeFakeJwt(role: string, partnerId?: string) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({
    sub: `user-${role}`,
    role,
    partner_id: partnerId,
    exp: Math.floor(Date.now() / 1000) + 86400,
  }))
  return `${header}.${payload}.fakesignature`
}

export const DEMO_USERS: Record<string, { password: string; role: string; partner_id?: string }> = {
  'admin@beeline.ru': { password: 'admin123', role: 'operator' },
  'partner@pyaterochka.ru': { password: 'partner123', role: 'partner_admin', partner_id: 'partner-1' },
  'partner@magnit.ru': { password: 'partner123', role: 'partner_admin', partner_id: 'partner-2' },
}

/**
 * Mock API handler. Matches path patterns and returns demo data.
 */
export function mockApiCall(method: string, path: string, body?: unknown): unknown {
  // Auth
  if (method === 'POST' && path === '/auth/login') {
    const { email, password } = body as { email: string; password: string }
    const user = DEMO_USERS[email]
    if (user && user.password === password) {
      return {
        access_token: makeFakeJwt(user.role, user.partner_id),
        refresh_token: makeFakeJwt(user.role, user.partner_id),
        token_type: 'bearer',
      }
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
    return { offer_id: path.split('/').pop(), activated_at: new Date().toISOString(), status: 'active' }
  }
  if (method === 'GET' && path.match(/^\/client\/[^/]+\/cashback$/)) {
    return DEMO_CASHBACK_HISTORY
  }
  if (method === 'GET' && path.match(/^\/client\/[^/]+\/cashback\/total$/)) {
    return { total: '1500.00' }
  }

  // Partner API — Offers
  if (method === 'GET' && path === '/offers') {
    return DEMO_OFFERS.filter(o => o.partner_id === 'partner-1')
  }
  if (method === 'POST' && path === '/offers') {
    return { id: 'offer-new-' + Date.now(), ...body, status: 'draft', budget_spent: '0.00', created_at: new Date().toISOString() }
  }
  if (method === 'GET' && path.match(/^\/offers\/[^/]+$/)) {
    const id = path.split('/').pop()
    return DEMO_OFFERS.find(o => o.id === id) || DEMO_OFFERS[0]
  }
  if (method === 'PUT' && path.match(/^\/offers\/[^/]+$/)) {
    return { ...DEMO_OFFERS[0], ...body }
  }
  if (method === 'PUT' && path.match(/^\/offers\/[^/]+\/status$/)) {
    return { ...DEMO_OFFERS[0], ...body }
  }
  if (method === 'POST' && path.match(/\/terminals$/)) {
    return { uploaded: 5 }
  }
  if (method === 'POST' && path.match(/\/image$/)) {
    return { image_url: '/uploads/demo.jpg' }
  }
  if (method === 'POST' && path.match(/\/placements$/)) {
    return body
  }
  if (method === 'GET' && path.match(/\/stats\/daily$/)) {
    return Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      impressions: 5000 + Math.floor(Math.random() * 3000),
      clicks: 200 + Math.floor(Math.random() * 150),
      activations: 50 + Math.floor(Math.random() * 40),
      purchases: 30 + Math.floor(Math.random() * 30),
      gmv: (200000 + Math.floor(Math.random() * 100000)).toFixed(2),
      cashback: (8000 + Math.floor(Math.random() * 5000)).toFixed(2),
    }))
  }
  if (method === 'GET' && path.match(/\/stats$/)) {
    return DEMO_OFFER_STATS
  }

  // Billing
  if (method === 'GET' && path === '/billing/balance') {
    return { partner_id: 'partner-1', balance: '876600.00' }
  }
  if (method === 'GET' && path === '/billing/transactions') {
    return DEMO_BILLING_TRANSACTIONS
  }

  // Admin
  if (method === 'GET' && path === '/admin/dashboard') return DEMO_DASHBOARD
  if (method === 'GET' && path === '/admin/partners') return DEMO_PARTNERS
  if (method === 'POST' && path === '/admin/partners') {
    return { id: 'partner-new', ...body, balance: '0.00', status: 'active', created_at: new Date().toISOString(), offers_count: 0 }
  }
  if (method === 'PUT' && path.match(/\/admin\/partners\/[^/]+\/balance$/)) {
    return { partner_id: path.split('/')[3], new_balance: '100000.00' }
  }
  if (method === 'PUT' && path.match(/\/admin\/offers\/[^/]+\/moderate$/)) {
    return { offer_id: path.split('/')[3], status: 'active', comment: null }
  }
  if (method === 'POST' && path === '/admin/registry/upload') {
    return { batch_id: 'batch-demo', total: 1247, matched: 890, errors: 12 }
  }
  if (method === 'GET' && path.match(/\/admin\/registry\//)) {
    return { batch_id: 'batch-demo', filename: 'nspk_registry.csv', records_total: 1247, records_matched: 890, records_errors: 12, records_antifraud: 23, status: 'completed' }
  }
  if (method === 'GET' && path === '/admin/finance/revshare') return DEMO_REVSHARE
  if (method === 'GET' && path === '/admin/finance/pnl') return DEMO_PNL

  // Payouts
  if (method === 'POST' && path === '/payouts/generate') {
    return { id: 'payout-demo', type: 'client', total_amount: '1500.00', records_count: 42, status: 'generated', created_at: new Date().toISOString() }
  }

  // Default
  return {}
}
