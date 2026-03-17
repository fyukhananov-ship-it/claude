import { useState, FormEvent } from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import SectionHeading from '../ui/SectionHeading'
import Button from '../ui/Button'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

const contactInfo = [
  { icon: MapPin, text: '117216, Москва, Северное Бутово, ул. Грина, д. 7, стр. 1' },
  { icon: Phone, text: '+7 (495) 123-45-67', href: 'tel:+74951234567' },
  { icon: Mail, text: 'info@lvkusa.ru', href: 'mailto:info@lvkusa.ru' },
  { icon: Clock, text: 'Пн–Пт: 8:00–18:00, Сб: 9:00–15:00' },
]

export default function Contacts() {
  const { ref, isVisible } = useScrollReveal()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  return (
    <section id="contacts" className="section-padding bg-white">
      <div ref={ref} className="max-w-[1200px] mx-auto">
        <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <SectionHeading eyebrow="Контакты" title="Свяжитесь с нами" />
        </div>

        <div
          className={`grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 lg:gap-16 transition-all duration-700 ease-out delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <div>
            <h3 className="font-serif font-semibold text-charcoal-900 text-[28px] mb-2">
              Оставить заявку
            </h3>
            <p className="font-sans text-charcoal-500 text-base mb-8">
              Оставьте контакты и мы свяжемся с вами в течение рабочего дня
            </p>

            {isSubmitted ? (
              <div className="bg-sage-100 rounded-2xl p-8 text-center">
                <h4 className="font-serif font-semibold text-charcoal-900 text-2xl mb-2">
                  Спасибо за заявку!
                </h4>
                <p className="font-sans text-charcoal-500">
                  Наш менеджер свяжется с вами в ближайшее время
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Ваше имя"
                  required
                  className="w-full bg-white border border-charcoal-100 rounded-xl px-4 py-3 font-sans text-charcoal-900 placeholder:text-charcoal-300 focus:outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all"
                />
                <input
                  type="text"
                  placeholder="Название заведения"
                  className="w-full bg-white border border-charcoal-100 rounded-xl px-4 py-3 font-sans text-charcoal-900 placeholder:text-charcoal-300 focus:outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all"
                />
                <input
                  type="tel"
                  placeholder="Телефон"
                  required
                  className="w-full bg-white border border-charcoal-100 rounded-xl px-4 py-3 font-sans text-charcoal-900 placeholder:text-charcoal-300 focus:outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-white border border-charcoal-100 rounded-xl px-4 py-3 font-sans text-charcoal-900 placeholder:text-charcoal-300 focus:outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all"
                />
                <textarea
                  placeholder="Комментарий"
                  rows={4}
                  className="w-full bg-white border border-charcoal-100 rounded-xl px-4 py-3 font-sans text-charcoal-900 placeholder:text-charcoal-300 focus:outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all resize-none"
                />
                <Button type="submit" size="lg" className="w-full">
                  Отправить заявку
                </Button>
                <p className="font-sans text-charcoal-300 text-[13px] text-center">
                  Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных
                </p>
              </form>
            )}
          </div>

          <div className="lg:pt-16">
            <div className="space-y-6">
              {contactInfo.map((item) => {
                const Icon = item.icon
                const content = (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-warm-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-5 h-5 text-warm-400" strokeWidth={1.5} />
                    </div>
                    <span className="font-sans text-charcoal-700 text-[15px] leading-relaxed">
                      {item.text}
                    </span>
                  </div>
                )
                return item.href ? (
                  <a key={item.text} href={item.href} className="block hover:opacity-80 transition-opacity">
                    {content}
                  </a>
                ) : (
                  <div key={item.text}>{content}</div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
