import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Products from './components/sections/Products'
import Advantages from './components/sections/Advantages'
import HowToOrder from './components/sections/HowToOrder'
import Journal from './components/sections/Journal'
import Contacts from './components/sections/Contacts'

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Products />
        <Advantages />
        <HowToOrder />
        <Journal />
        <Contacts />
      </main>
      <Footer />
    </div>
  )
}

export default App
