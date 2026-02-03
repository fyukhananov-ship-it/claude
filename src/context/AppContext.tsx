import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Offer, ActivatedOffer, Transaction, FilterState, SupportTicket } from '../types';
import { offers as mockOffers, activatedOffers as mockActivated, transactions as mockTransactions } from '../data/mockData';

interface AppContextType {
  offers: Offer[];
  activatedOffers: ActivatedOffer[];
  transactions: Transaction[];
  tickets: SupportTicket[];
  filters: FilterState;
  searchQuery: string;
  isLoading: boolean;

  setFilters: (filters: FilterState) => void;
  setSearchQuery: (query: string) => void;
  activateOffer: (offerId: string) => Promise<void>;
  createTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  getOfferById: (id: string) => Offer | undefined;
  getActivatedOfferById: (id: string) => ActivatedOffer | undefined;
  getTransactionById: (id: string) => Transaction | undefined;
  filteredOffers: Offer[];
}

const defaultFilters: FilterState = {
  paymentMethod: 'all',
  format: 'all',
  onlyAvailable: false,
  validityPeriod: 'any',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [offers] = useState<Offer[]>(mockOffers);
  const [activatedOffers, setActivatedOffers] = useState<ActivatedOffer[]>(mockActivated);
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading] = useState(false);

  const activateOffer = useCallback(async (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) throw new Error('Offer not found');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const activated: ActivatedOffer = {
      ...offer,
      status: 'activated',
      activatedAt: new Date().toISOString(),
      expiresAt: offer.validity.endDate,
      usagesLeft: offer.conditions.maxUsages,
    };

    setActivatedOffers(prev => [...prev, activated]);
  }, [offers]);

  const createTicket = useCallback(async (ticketData: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const ticket: SupportTicket = {
      ...ticketData,
      id: `ticket-${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expectedResponse: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    setTickets(prev => [...prev, ticket]);
    return ticket.id;
  }, []);

  const getOfferById = useCallback((id: string) => {
    return offers.find(o => o.id === id);
  }, [offers]);

  const getActivatedOfferById = useCallback((id: string) => {
    return activatedOffers.find(o => o.id === id);
  }, [activatedOffers]);

  const getTransactionById = useCallback((id: string) => {
    return transactions.find(t => t.id === id);
  }, [transactions]);

  const filteredOffers = React.useMemo(() => {
    return offers.filter(offer => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          offer.title.toLowerCase().includes(query) ||
          offer.partner.name.toLowerCase().includes(query) ||
          offer.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Payment method filter
      if (filters.paymentMethod !== 'all' &&
          offer.conditions.paymentMethod !== filters.paymentMethod &&
          offer.conditions.paymentMethod !== 'any') {
        return false;
      }

      // Format filter
      if (filters.format !== 'all' &&
          offer.conditions.format !== filters.format &&
          offer.conditions.format !== 'both') {
        return false;
      }

      // Availability filter
      if (filters.onlyAvailable && offer.status !== 'available') {
        return false;
      }

      // Validity period filter
      if (filters.validityPeriod === '7days' && offer.validity.remainingDays > 7) {
        return false;
      }
      if (filters.validityPeriod === '30days' && offer.validity.remainingDays > 30) {
        return false;
      }

      // Category filter
      if (filters.category && offer.partner.category !== filters.category) {
        return false;
      }

      return true;
    }).sort((a, b) => (b.personalScore || 0) - (a.personalScore || 0));
  }, [offers, filters, searchQuery]);

  const value: AppContextType = {
    offers,
    activatedOffers,
    transactions,
    tickets,
    filters,
    searchQuery,
    isLoading,
    setFilters,
    setSearchQuery,
    activateOffer,
    createTicket,
    getOfferById,
    getActivatedOfferById,
    getTransactionById,
    filteredOffers,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
