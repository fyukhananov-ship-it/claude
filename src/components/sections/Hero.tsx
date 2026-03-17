import { motion } from 'framer-motion'
import { MapPin, Phone, Globe } from 'lucide-react'
import Button from '../ui/Button'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

export default function Hero() {
  const scrollTo = (selector: string) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.section
      className="relative flex w-full flex-col overflow-hidden bg-white text-charcoal-900 md:flex-row min-h-screen mt-[72px]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Left Side: Content */}
      <div className="flex w-full flex-col justify-between p-8 pt-12 md:w-1/2 md:p-12 lg:w-3/5 lg:p-16">
        {/* Top Section */}
        <div>
          <motion.header className="mb-10" variants={itemVariants}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-0.5 bg-warm-300" />
              <span className="font-sans font-medium text-warm-500 text-[13px] uppercase tracking-[0.1em]">
                Кондитерские изделия для HoReCa
              </span>
            </div>
          </motion.header>

          <motion.main variants={containerVariants}>
            <motion.h1
              className="font-serif font-semibold text-charcoal-900 text-[36px] md:text-[44px] lg:text-[56px] leading-[1.1] tracking-[-0.02em]"
              variants={itemVariants}
            >
              Свежая кондитерская{' '}
              <br />
              <span className="text-warm-500">продукция для вашего бизнеса</span>
            </motion.h1>

            <motion.div className="my-6 h-1 w-20 bg-warm-500 rounded-full" variants={itemVariants} />

            <motion.p
              className="mb-8 max-w-md font-sans text-charcoal-500 text-base lg:text-lg leading-relaxed"
              variants={itemVariants}
            >
              Порционные торты, пирожные, выпечка и десерты с доставкой собственным
              рефрижераторным транспортом по Москве. Выгоднее, чем собственное производство.
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row gap-4" variants={itemVariants}>
              <Button size="lg" onClick={() => scrollTo('#products')}>
                Смотреть каталог
              </Button>
              <Button variant="outline" size="lg" onClick={() => scrollTo('#contacts')}>
                Связаться с нами
              </Button>
            </motion.div>
          </motion.main>
        </div>

        {/* Bottom Section: Contact Info */}
        <motion.footer className="mt-12 w-full" variants={itemVariants}>
          <div className="grid grid-cols-1 gap-4 text-xs text-charcoal-500 sm:grid-cols-3">
            <div className="flex items-center">
              <Globe className="h-4 w-4 text-warm-400 mr-2 shrink-0" />
              <span className="font-sans">lvkusa.ru</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-warm-400 mr-2 shrink-0" />
              <span className="font-sans">+7 (495) 123-45-67</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-warm-400 mr-2 shrink-0" />
              <span className="font-sans">Москва, ул. Грина, д. 7</span>
            </div>
          </div>
        </motion.footer>
      </div>

      {/* Right Side: Image with Clip Path Animation */}
      <motion.div
        className="w-full min-h-[300px] bg-cover bg-center md:w-1/2 md:min-h-full lg:w-2/5"
        style={{
          backgroundImage: 'url(/claude/hero-bg.jpg)',
        }}
        initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
        animate={{ clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)' }}
        transition={{ duration: 1.2, ease: 'circOut' }}
      />
    </motion.section>
  )
}
