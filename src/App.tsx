import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProductProvider } from './store/ProductContext'
import { JournalProvider } from './store/JournalContext'
import LandingPage from './LandingPage'
import JournalPage from './pages/JournalPage'
import ArticlePage from './pages/ArticlePage'
import AdminApp from './admin/AdminApp'

function App() {
  return (
    <BrowserRouter>
      <ProductProvider>
        <JournalProvider>
          <Routes>
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/journal/:id" element={<ArticlePage />} />
            <Route path="/*" element={<LandingPage />} />
          </Routes>
        </JournalProvider>
      </ProductProvider>
    </BrowserRouter>
  )
}

export default App
