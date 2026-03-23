import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProductProvider } from './store/ProductContext'
import LandingPage from './LandingPage'

function App() {
  return (
    <BrowserRouter>
      <ProductProvider>
        <Routes>
          <Route path="/*" element={<LandingPage />} />
        </Routes>
      </ProductProvider>
    </BrowserRouter>
  )
}

export default App
