import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import LoginPage from './auth/LoginPage'

// Client pages
import OfferCatalog from './client/pages/OfferCatalog'
import OfferDetail from './client/pages/OfferDetail'
import Activation from './client/pages/Activation'
import SpinWheel from './client/pages/SpinWheel'
import ThankYou from './client/pages/ThankYou'
import CashbackHistory from './client/pages/CashbackHistory'
import Article from './client/pages/Article'

// Partner pages
import PartnerLayout from './partner/layout/PartnerLayout'
import PartnerDashboard from './partner/pages/Dashboard'
import OfferList from './partner/pages/OfferList'
import OfferCreate from './partner/pages/OfferCreate'
import OfferStats from './partner/pages/OfferStats'
import Billing from './partner/pages/Billing'

// Admin pages
import AdminLayout from './admin/layout/AdminLayout'
import AdminDashboard from './admin/pages/Dashboard'
import Partners from './admin/pages/Partners'
import OfferModeration from './admin/pages/OfferModeration'
import RegistryUpload from './admin/pages/RegistryUpload'
import Finance from './admin/pages/Finance'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* Client web-view (no auth — identified by phone_hash in URL) */}
        <Route path="/client/:phoneHash" element={<OfferCatalog />} />
        <Route path="/client/:phoneHash/article/:articleId" element={<Article />} />
        <Route path="/client/:phoneHash/offer/:offerId" element={<OfferDetail />} />
        <Route path="/client/:phoneHash/activate/:offerId" element={<Activation />} />
        <Route path="/client/:phoneHash/spin/:offerId" element={<SpinWheel />} />
        <Route path="/client/:phoneHash/thanks" element={<ThankYou />} />
        <Route path="/client/:phoneHash/cashback" element={<CashbackHistory />} />

        {/* Partner cabinet */}
        <Route
          path="/partner"
          element={
            <ProtectedRoute roles={['partner_admin', 'partner_manager']}>
              <PartnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PartnerDashboard />} />
          <Route path="offers" element={<OfferList />} />
          <Route path="offers/new" element={<OfferCreate />} />
          <Route path="offers/:id/stats" element={<OfferStats />} />
          <Route path="billing" element={<Billing />} />
        </Route>

        {/* Admin panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['operator']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="partners" element={<Partners />} />
          <Route path="moderation" element={<OfferModeration />} />
          <Route path="registry" element={<RegistryUpload />} />
          <Route path="finance" element={<Finance />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
