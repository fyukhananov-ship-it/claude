import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { articles } from '../data/journal'
import { ArrowRight, ArrowLeft } from 'lucide-react'

const badgeColors: Record<string, string> = {
  sage: 'bg-sage-100 text-sage-500',
  warm: 'bg-warm-100 text-warm-600',
  neutral: 'bg-charcoal-100 text-charcoal-700',
}

const headerGradients: Record<string, string> = {
  sage: 'from-warm-50 to-sage-100',
  warm: 'from-cream to-warm-100',
  neutral: 'from-sage-100 to-warm-50',
}

export default function JournalPage() {
  const featured = articles[0]
  const rest = articles.slice(1)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-[72px]">
        {/* Hero section */}
        <section className="bg-cream py-16 lg:py-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-sans text-sm text-charcoal-500 hover:text-charcoal-900 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> На главную
            </Link>

            <div className="max-w-2xl">
              <p className="font-sans text-warm-500 text-sm font-semibold tracking-wide uppercase mb-3">
                Журнал
              </p>
              <h1 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight mb-4">
                Полезное для рестораторов
              </h1>
              <p className="font-sans text-charcoal-500 text-lg leading-relaxed">
                Статьи о десертном меню, трендах HoReCa и практические советы по работе с кондитерской продукцией
              </p>
            </div>
          </div>
        </section>

        {/* Featured article */}
        <section className="max-w-[1200px] mx-auto px-6 py-12 lg:py-16">
          <Link
            to={`/journal/${featured.id}`}
            className="block group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className={`h-64 lg:h-80 rounded-2xl bg-gradient-to-br ${headerGradients[featured.categoryColor]} flex items-center justify-center`}>
                <span className="font-serif text-6xl text-charcoal-200 opacity-30">01</span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-sans font-medium ${badgeColors[featured.categoryColor]}`}>
                    {featured.category}
                  </span>
                  <span className="font-sans text-charcoal-300 text-sm">{featured.date}</span>
                  <span className="font-sans text-charcoal-300 text-sm">{featured.readTime}</span>
                </div>
                <h2 className="font-serif text-2xl lg:text-3xl font-bold text-charcoal-900 leading-tight mb-4 group-hover:text-warm-600 transition-colors">
                  {featured.title}
                </h2>
                <p className="font-sans text-charcoal-500 text-base leading-relaxed mb-6">
                  {featured.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 font-sans font-medium text-warm-500 text-base group-hover:gap-3 transition-all duration-200">
                  Читать статью <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* Divider */}
        <div className="max-w-[1200px] mx-auto px-6">
          <hr className="border-charcoal-100" />
        </div>

        {/* All articles grid */}
        <section className="max-w-[1200px] mx-auto px-6 py-12 lg:py-16">
          <h2 className="font-serif text-2xl font-bold text-charcoal-900 mb-8">
            Все статьи
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {rest.map((article, i) => (
              <Link
                key={article.id}
                to={`/journal/${article.id}`}
                className="bg-white rounded-2xl border border-charcoal-100 hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
              >
                <div className={`h-32 bg-gradient-to-br ${headerGradients[article.categoryColor]} flex items-center justify-center`}>
                  <span className="font-serif text-4xl text-charcoal-200 opacity-20">
                    {String(i + 2).padStart(2, '0')}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-sans font-medium ${badgeColors[article.categoryColor]}`}>
                      {article.category}
                    </span>
                    <span className="font-sans text-charcoal-300 text-xs">{article.readTime}</span>
                  </div>
                  <h3 className="font-serif font-semibold text-charcoal-900 text-lg leading-tight mb-2 line-clamp-2 group-hover:text-warm-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="font-sans text-charcoal-500 text-sm leading-relaxed line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-charcoal-300 text-[13px]">{article.date}</span>
                    <span className="inline-flex items-center gap-1 font-sans font-medium text-warm-500 text-sm group-hover:gap-2 transition-all duration-200">
                      Читать <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
