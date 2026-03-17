import { useScrollReveal } from '../../hooks/useScrollReveal'
import SectionHeading from '../ui/SectionHeading'
import AdvantageCard from '../ui/AdvantageCard'
import { advantages } from '../../data/advantages'

export default function Advantages() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section id="advantages" className="bg-cream section-padding">
      <div ref={ref} className="max-w-[1200px] mx-auto">
        <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <SectionHeading eyebrow="Почему мы" title="Преимущества работы с нами" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {advantages.map((advantage, i) => (
            <div
              key={advantage.title}
              className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              <AdvantageCard advantage={advantage} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
