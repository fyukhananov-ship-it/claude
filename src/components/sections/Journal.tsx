import { useScrollReveal } from '../../hooks/useScrollReveal'
import SectionHeading from '../ui/SectionHeading'
import JournalCard from '../ui/JournalCard'
import { articles } from '../../data/journal'
import { ArrowRight } from 'lucide-react'

export default function Journal() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section id="journal" className="bg-cream section-padding">
      <div ref={ref} className="max-w-[1200px] mx-auto">
        <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <SectionHeading eyebrow="Журнал" title="Полезное для рестораторов" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {articles.map((article, i) => (
            <div
              key={article.id}
              className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              <JournalCard article={article} />
            </div>
          ))}
        </div>

        <div
          className={`text-center mt-10 transition-all duration-700 ease-out delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 font-sans font-medium text-warm-500 text-base hover:gap-3 transition-all duration-200"
          >
            Все публикации <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  )
}
