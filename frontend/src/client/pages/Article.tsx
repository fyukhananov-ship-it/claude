import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getArticleBySlug, ARTICLES } from '@/client/data/articles'
import { useReadArticles } from '@/client/lib/hooks'
import { useToast } from '@/client/components/Toast'
import { cn } from '@/lib/utils'

export default function Article() {
  const { phoneHash, articleId } = useParams<{ phoneHash: string; articleId: string }>()
  const navigate = useNavigate()
  const article = articleId ? getArticleBySlug(articleId) : undefined
  const { markRead } = useReadArticles()
  const toast = useToast()

  useEffect(() => {
    if (article) markRead(article.slug)
  }, [article, markRead])

  const handleShare = async () => {
    if (!article) return
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: article.title, text: article.subtitle, url }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); toast.show('Ссылка скопирована', 'success') } catch {}
    }
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] flex flex-col items-center justify-center">
        <p className="text-[14px] text-[#999] font-medium">Статья не найдена</p>
        <button onClick={() => navigate(-1)} className="text-[#FFD500] font-bold mt-3 text-[14px]">Назад</button>
      </div>
    )
  }

  const related = ARTICLES.filter(a => a.slug !== article.slug).slice(0, 2)

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-black/[0.04] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center press-scale">
          <svg className="w-5 h-5 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[15px] font-bold text-[#111] truncate flex-1">Полезное</span>
        <button onClick={handleShare} className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center press-scale" aria-label="Поделиться">
          <svg className="w-5 h-5 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
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
              <span className="text-[13px] text-white/70 font-medium">{article.subtitle}</span>
              <div className="flex items-center gap-1 text-white/60">
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
      <div className="px-5 mt-6">
        <div className="bg-white rounded-2xl shadow-card p-5">
          {article.content.map((paragraph, i) => (
            <p key={i} className={cn('text-[14px] text-[#444] leading-[1.7]', i > 0 && 'mt-4')}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="px-5 mt-8 mb-32">
          <h3 className="text-[16px] font-extrabold text-[#111] mb-3 tracking-[-0.02em]">Читайте также</h3>
          <div className="space-y-3">
            {related.map(r => (
              <button
                key={r.id}
                onClick={() => { navigate(`/client/${phoneHash}/article/${r.slug}`); window.scrollTo(0, 0) }}
                className="w-full bg-white rounded-2xl shadow-card p-4 flex gap-3 items-center press-scale text-left"
              >
                <div className={cn('w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0', r.gradient)}>
                  <span className="text-[24px]">{r.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#111] leading-tight line-clamp-2">{r.title}</p>
                  <p className="text-[12px] text-[#999] mt-1 font-medium">{r.readTime} мин чтения</p>
                </div>
                <svg className="w-4 h-4 text-[#ccc] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

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
