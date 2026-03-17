import type { JournalArticle } from '../../data/journal'
import { ArrowRight } from 'lucide-react'

const headerGradients: Record<string, string> = {
  sage: 'from-warm-50 to-sage-100',
  warm: 'from-cream to-warm-100',
  neutral: 'from-sage-100 to-warm-50',
}

const badgeColors: Record<string, string> = {
  sage: 'bg-sage-100 text-sage-500',
  warm: 'bg-warm-100 text-warm-600',
  neutral: 'bg-charcoal-100 text-charcoal-700',
}

interface JournalCardProps {
  article: JournalArticle
  delay?: number
}

export default function JournalCard({ article, delay = 0 }: JournalCardProps) {
  return (
    <div
      className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`h-28 bg-gradient-to-br ${headerGradients[article.categoryColor]}`} />
      <div className="p-5 -mt-4 relative">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-sans font-medium mb-3 ${badgeColors[article.categoryColor]}`}>
          {article.category}
        </span>
        <h3 className="font-serif font-semibold text-charcoal-900 text-xl leading-tight mb-2 line-clamp-2">
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
    </div>
  )
}
