import { useParams, useNavigate } from 'react-router-dom'
import { getArticleBySlug } from '@/client/data/articles'
import { cn } from '@/lib/utils'

export default function Article() {
  const { phoneHash, articleId } = useParams<{ phoneHash: string; articleId: string }>()
  const navigate = useNavigate()
  const article = articleId ? getArticleBySlug(articleId) : undefined

  if (!article) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center">
        <p className="text-[#999]">Статья не найдена</p>
        <button onClick={() => navigate(-1)} className="text-[#FFD500] font-bold mt-3 text-[14px]">Назад</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-black/[0.04] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center press-scale">
          <svg className="w-5 h-5 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[15px] font-bold text-[#111] truncate">Полезное</span>
      </div>

      {/* Hero */}
      <div className="px-5 pt-5">
        <div className={cn('rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br', article.gradient)}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-8 w-36 h-36 rounded-full bg-black/5" />
          <div className="relative z-10">
            <span className="text-[40px]">{article.icon}</span>
            <h1 className="text-[24px] font-extrabold text-white leading-[1.15] tracking-[-0.03em] mt-3">
              {article.title}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-[12px] text-white/60 font-medium">{article.subtitle}</span>
              <div className="flex items-center gap-1 text-white/50">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[12px] font-medium">{article.readTime} мин</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 mt-6 mb-32">
        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
          {article.content.map((paragraph, i) => (
            <p key={i} className={cn('text-[14px] text-[#444] leading-[1.7]', i > 0 && 'mt-4')}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-black/[0.04] px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <button
          onClick={() => navigate(`/client/${phoneHash}`)}
          className="w-full py-4 rounded-2xl bg-[#FFD500] text-[#111] font-extrabold text-[15px] press-scale shadow-[0_4px_24px_rgba(255,213,0,0.35)]"
        >
          Смотреть офферы
        </button>
      </div>
    </div>
  )
}
