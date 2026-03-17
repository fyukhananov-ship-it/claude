import { useScrollReveal } from '../../hooks/useScrollReveal'
import SectionHeading from '../ui/SectionHeading'

const stats = [
  { value: '10+', label: 'лет на рынке' },
  { value: '200+', label: 'наименований продукции' },
  { value: '50+', label: 'постоянных партнёров' },
]

export default function About() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section id="about" className="bg-cream section-padding">
      <div
        ref={ref}
        className={`max-w-[1200px] mx-auto transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-center">
          <div>
            <SectionHeading eyebrow="О компании" title="Линия Вкуса" centered={false} />
            <div className="space-y-4 font-sans text-charcoal-700 text-base leading-relaxed">
              <p>
                Компания «Линия Вкуса» производит широкий ассортимент кондитерских изделий
                для сегмента HoReCa — отелей, ресторанов и кафе Москвы. Мы готовим по
                оригинальным рецептурам несколько десятков наименований десертов и выпечки.
              </p>
              <p>
                Для заведений общественного питания закупка готовой кондитерской продукции
                значительно выгоднее содержания собственного производства: не нужно приобретать
                дорогостоящее оборудование, ингредиенты, нести потери от списания остатков.
              </p>
              <p>
                Мы обеспечиваем доставку собственным рефрижераторным транспортом в утренние
                часы, чтобы к открытию вашего заведения свежие десерты уже были на витрине.
              </p>
            </div>
          </div>

          <div className="bg-warm-100/50 rounded-3xl p-8 lg:p-10">
            <div className="space-y-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="font-serif font-bold text-warm-500 text-5xl mb-1">
                    {stat.value}
                  </div>
                  <div className="font-sans text-charcoal-500 text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
