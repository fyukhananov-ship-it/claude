import { useParams, Link, Navigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useJournal } from '../store/JournalContext'
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'

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

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>()
  const { articles } = useJournal()
  const article = articles.find((a) => a.id === id)

  if (!article) {
    return <Navigate to="/journal" replace />
  }

  const otherArticles = articles.filter((a) => a.id !== id).slice(0, 3)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-[72px]">
        {/* Article header */}
        <section className={`bg-gradient-to-br ${headerGradients[article.categoryColor]} py-16 lg:py-20`}>
          <div className="max-w-[760px] mx-auto px-6">
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 font-sans text-sm text-charcoal-500 hover:text-charcoal-900 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Все статьи
            </Link>

            <div className="flex items-center gap-3 mb-5">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-sans font-medium ${badgeColors[article.categoryColor]}`}>
                {article.category}
              </span>
              <span className="font-sans text-charcoal-400 text-sm">{article.date}</span>
              <span className="inline-flex items-center gap-1 font-sans text-charcoal-400 text-sm">
                <Clock className="w-3.5 h-3.5" /> {article.readTime}
              </span>
            </div>

            <h1 className="font-serif text-3xl lg:text-4xl font-bold text-charcoal-900 leading-tight">
              {article.title}
            </h1>
          </div>
        </section>

        {/* Article body */}
        <section className="max-w-[760px] mx-auto px-6 py-12 lg:py-16">
          <div className="space-y-6">
            {article.content.map((paragraph, i) => (
              <p
                key={i}
                className={`font-sans text-charcoal-700 text-base lg:text-lg leading-relaxed ${
                  i === 0 ? 'text-lg lg:text-xl text-charcoal-900 font-medium' : ''
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 rounded-2xl bg-cream border border-warm-100">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">
              Нужна кондитерская продукция для вашего бизнеса?
            </h3>
            <p className="font-sans text-charcoal-500 text-base mb-4">
              Мы производим порционные торты, печенье, кексы и пирожные для ресторанов и отелей. Доставка по Москве собственным транспортом.
            </p>
            <Link
              to="/#contacts"
              className="inline-flex items-center gap-2 font-sans font-semibold text-warm-600 hover:text-warm-700 transition-colors"
            >
              Связаться с нами <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Related articles */}
        {otherArticles.length > 0 && (
          <section className="bg-cream py-12 lg:py-16">
            <div className="max-w-[1200px] mx-auto px-6">
              <h2 className="font-serif text-2xl font-bold text-charcoal-900 mb-8">
                Читайте также
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                {otherArticles.map((related) => (
                  <Link
                    key={related.id}
                    to={`/journal/${related.id}`}
                    className="bg-white rounded-2xl border border-charcoal-100 hover:shadow-card-hover transition-all duration-300 overflow-hidden group p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-sans font-medium ${badgeColors[related.categoryColor]}`}>
                        {related.category}
                      </span>
                      <span className="font-sans text-charcoal-300 text-xs">{related.readTime}</span>
                    </div>
                    <h3 className="font-serif font-semibold text-charcoal-900 text-lg leading-tight mb-2 line-clamp-2 group-hover:text-warm-600 transition-colors">
                      {related.title}
                    </h3>
                    <p className="font-sans text-charcoal-500 text-sm leading-relaxed line-clamp-2">
                      {related.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
