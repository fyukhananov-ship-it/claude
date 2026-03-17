import { useScrollReveal } from '../../hooks/useScrollReveal'
import SectionHeading from '../ui/SectionHeading'
import StepCard from '../ui/StepCard'
import { steps } from '../../data/steps'

export default function HowToOrder() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section className="section-padding bg-white">
      <div ref={ref} className="max-w-[1200px] mx-auto">
        <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <SectionHeading eyebrow="Сотрудничество" title="Как начать работать с нами" />
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-8 left-[12%] right-[12%] h-px border-t-2 border-dashed border-charcoal-100" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${200 + i * 100}ms` }}
              >
                <StepCard step={step} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
