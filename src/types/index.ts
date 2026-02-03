export type PaymentMethod = 'sbp' | 'card' | 'any';
export type OfferFormat = 'online' | 'offline' | 'both';
export type OfferStatus = 'available' | 'activated' | 'unavailable' | 'expired';
export type TransactionStatus = 'pending' | 'confirmed' | 'rejected' | 'reversed';

export interface Partner {
  id: string;
  name: string;
  logo: string;
  category: string;
}

export interface Offer {
  id: string;
  partner: Partner;
  title: string;
  benefit: {
    type: 'percent' | 'fixed' | 'cashback';
    value: number;
    maxAmount?: number;
    currency?: string;
  };
  conditions: {
    paymentMethod: PaymentMethod;
    minPurchase?: number;
    maxUsages?: number;
    format: OfferFormat;
  };
  validity: {
    startDate: string;
    endDate: string;
    remainingDays: number;
  };
  status: OfferStatus;
  confirmationSLA: number; // days
  shortDescription: string;
  fullConditions: string;
  steps: string[];
  deepLink?: string;
  locations?: Location[];
  tags: string[];
  featured?: boolean;
  personalScore?: number;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  distance?: number;
}

export interface ActivatedOffer extends Offer {
  activatedAt: string;
  expiresAt: string;
  usagesLeft?: number;
}

export interface Transaction {
  id: string;
  offerId: string;
  offer: Offer;
  amount: number;
  benefit: number;
  status: TransactionStatus;
  createdAt: string;
  confirmedAt?: string;
  expectedConfirmation?: string;
  rejectionReason?: string;
  canDispute: boolean;
}

export interface SupportTicket {
  id: string;
  offerId?: string;
  transactionId?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  expectedResponse?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface FilterState {
  paymentMethod: PaymentMethod | 'all';
  format: OfferFormat | 'all';
  onlyAvailable: boolean;
  validityPeriod: 'any' | '7days' | '30days';
  category?: string;
}

export interface AppState {
  offers: Offer[];
  activatedOffers: ActivatedOffer[];
  transactions: Transaction[];
  tickets: SupportTicket[];
  filters: FilterState;
  searchQuery: string;
  isLoading: boolean;
}
