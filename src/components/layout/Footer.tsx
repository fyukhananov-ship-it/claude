import logoImg from '/logo.png'

const navLinks = [
  { label: 'О компании', href: '#about' },
  { label: 'Продукция', href: '#products' },
  { label: 'Преимущества', href: '#advantages' },
  { label: 'Журнал', href: '#journal' },
  { label: 'Контакты', href: '#contacts' },
]

const productLinks = [
  'Порционные торты',
  'Пластовые торты',
  'Печенье',
  'Кексы и маффины',
  'Мини-пирожные',
]

export default function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="bg-charcoal-900 text-charcoal-300">
      <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="flex items-center"
            >
              <img src={logoImg} alt="Линия Вкуса" className="h-12 w-auto brightness-0 invert" />
            </a>
            <p className="mt-3 text-sm leading-relaxed">
              Кондитерские изделия и выпечка для отелей, ресторанов и кейтеринга
            </p>
          </div>

          <div>
            <h4 className="font-sans font-semibold text-white text-[13px] uppercase tracking-[0.1em] mb-4">
              Навигация
            </h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollTo(link.href) }}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-semibold text-white text-[13px] uppercase tracking-[0.1em] mb-4">
              Продукция
            </h4>
            <ul className="space-y-2">
              {productLinks.map((name) => (
                <li key={name}>
                  <span className="text-sm">{name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-semibold text-white text-[13px] uppercase tracking-[0.1em] mb-4">
              Контакты
            </h4>
            <ul className="space-y-2 text-sm">
              <li>117216, Москва, Северное Бутово, ул. Грина, д. 7, стр. 1</li>
              <li>
                <a href="tel:+74951234567" className="hover:text-white transition-colors">
                  +7 (495) 123-45-67
                </a>
              </li>
              <li>
                <a href="mailto:info@lvkusa.ru" className="hover:text-white transition-colors">
                  info@lvkusa.ru
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-charcoal-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-charcoal-500 text-[13px]">
            &copy; 2026 ООО &laquo;Линия Вкуса&raquo;. Все права защищены.
          </p>
          <a href="#" className="text-charcoal-500 text-[13px] hover:text-charcoal-300 transition-colors">
            Политика конфиденциальности
          </a>
        </div>
      </div>
    </footer>
  )
}
