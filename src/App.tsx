import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { BottomNav } from './components';
import {
  ShowcaseScreen,
  OfferDetailScreen,
  ActiveOffersScreen,
  WalletScreen,
  TransactionDetailScreen,
  SupportScreen,
} from './screens';

function App() {
  const location = useLocation();

  // Hide bottom nav on detail screens
  const hideBottomNav = location.pathname.includes('/offer/') ||
                        location.pathname.includes('/transaction/');

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<ShowcaseScreen />} />
        <Route path="/offer/:id" element={<OfferDetailScreen />} />
        <Route path="/active" element={<ActiveOffersScreen />} />
        <Route path="/wallet" element={<WalletScreen />} />
        <Route path="/transaction/:id" element={<TransactionDetailScreen />} />
        <Route path="/support" element={<SupportScreen />} />
      </Routes>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}

export default App;
