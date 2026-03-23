import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import AdminApp from './admin/AdminApp'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
