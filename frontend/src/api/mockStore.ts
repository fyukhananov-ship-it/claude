/**
 * Reactive in-memory store for mock mode.
 * Shared between admin and client — changes in admin reflect in client.
 */
import { DEMO_OFFERS, DEMO_PARTNERS, DEMO_CASHBACK_HISTORY, DEMO_BILLING_TRANSACTIONS } from './mockData'

export interface StoreOffer {
  id: string; partner_id: string; partner_name: string; partner_logo: string | null
  name: string; description: string; image_url: string | null
  cashback_type: string; cashback_rate: string; min_check: string
  max_cashback_per_tx: string; max_cashback_per_client: string
  budget: string; budget_spent: string; start_date: string; end_date: string
  status: string; segment: string; geo: null; created_at: string
  terminals_count: number; placements: Array<{ id: number; placement_type: string; cpm_rate: string | null; budget: string | null; budget_spent: string; impressions: number; clicks: number; start_date: string | null; end_date: string | null }>
  category: string
}

export interface StorePartner {
  id: string; name: string; logo_url: string | null; contact_email: string
  contact_phone: string; balance: string; status: string; created_at: string; offers_count: number
}

class MockStore {
  offers: StoreOffer[]
  partners: StorePartner[]
  private listeners: Set<() => void> = new Set()

  constructor() {
    this.offers = [...DEMO_OFFERS] as StoreOffer[]
    this.partners = [...DEMO_PARTNERS] as StorePartner[]
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }

  private notify() { this.listeners.forEach(fn => fn()) }

  // --- Offer operations ---

  getActiveOffers() {
    return this.offers.filter(o => o.status === 'active')
  }

  getOffersByPartner(partnerId: string) {
    return this.offers.filter(o => o.partner_id === partnerId)
  }

  getOffersByStatus(status: string) {
    return status === 'all' ? this.offers : this.offers.filter(o => o.status === status)
  }

  getOffer(id: string) {
    return this.offers.find(o => o.id === id)
  }

  addOffer(data: Partial<StoreOffer>): StoreOffer {
    const offer: StoreOffer = {
      id: `offer-${Date.now()}`,
      partner_id: data.partner_id || '',
      partner_name: data.partner_name || this.partners.find(p => p.id === data.partner_id)?.name || '',
      partner_logo: null,
      name: data.name || '',
      description: data.description || '',
      image_url: null,
      cashback_type: data.cashback_type || 'percent',
      cashback_rate: data.cashback_rate || '0.05',
      min_check: data.min_check || '500.00',
      max_cashback_per_tx: data.max_cashback_per_tx || '1000.00',
      max_cashback_per_client: data.max_cashback_per_client || '5000.00',
      budget: data.budget || '100000.00',
      budget_spent: '0.00',
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      end_date: data.end_date || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      status: 'draft',
      segment: data.segment || 'all',
      geo: null,
      created_at: new Date().toISOString(),
      terminals_count: 0,
      placements: [],
      category: data.category || '',
    }
    this.offers.unshift(offer)
    this.updatePartnerOfferCount(offer.partner_id)
    this.notify()
    return offer
  }

  moderateOffer(id: string, action: 'approve' | 'reject') {
    const offer = this.offers.find(o => o.id === id)
    if (!offer) return null
    offer.status = action === 'approve' ? 'active' : 'draft'
    this.notify()
    return offer
  }

  updateOfferStatus(id: string, status: string) {
    const offer = this.offers.find(o => o.id === id)
    if (!offer) return null
    offer.status = status
    this.notify()
    return offer
  }

  // --- Partner operations ---

  getPartners() { return this.partners }

  getPartner(id: string) { return this.partners.find(p => p.id === id) }

  addPartner(data: { name: string; contact_email: string; contact_phone?: string }): StorePartner {
    const partner: StorePartner = {
      id: `partner-${Date.now()}`,
      name: data.name,
      logo_url: null,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone || '',
      balance: '0.00',
      status: 'active',
      created_at: new Date().toISOString(),
      offers_count: 0,
    }
    this.partners.unshift(partner)
    this.notify()
    return partner
  }

  topUpBalance(partnerId: string, amount: number) {
    const p = this.partners.find(p => p.id === partnerId)
    if (!p) return null
    p.balance = (parseFloat(p.balance) + amount).toFixed(2)
    this.notify()
    return p
  }

  private updatePartnerOfferCount(partnerId: string) {
    const p = this.partners.find(p => p.id === partnerId)
    if (p) p.offers_count = this.offers.filter(o => o.partner_id === partnerId).length
  }
}

export const store = new MockStore()
