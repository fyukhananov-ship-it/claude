# Offers SDK

Modern offers SDK module for banking/telecom apps. Klarna/Revolut-inspired design.

## Features

- **Showcase Screen**: Browse offers with filters, search, and categories
- **Offer Details**: View offer conditions, steps, and activate
- **Active Offers**: Track activated offers with remaining time and usages
- **Wallet/History**: View transaction history with status tracking
- **Support**: Create support tickets for disputed transactions

## UX Principles

- **Value-first**: Benefit visible in 1 screen
- **1-2 taps**: From offer card to activation
- **No codes**: Just activate and pay
- **Trust by design**: Clear statuses, SLA, rejection reasons
- **Native feel**: Adapts to host app styling

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide Icons

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # App screens/pages
├── context/        # React context for state
├── data/           # Mock data
├── types/          # TypeScript types
└── utils/          # Utility functions
```

## Screens

1. **Showcase** (`/`) - Main offers grid with filters
2. **Offer Detail** (`/offer/:id`) - Full offer info and activation
3. **Active Offers** (`/active`) - List of activated offers
4. **Wallet** (`/wallet`) - Transaction history
5. **Transaction Detail** (`/transaction/:id`) - Transaction status
6. **Support** (`/support`) - Create support tickets
