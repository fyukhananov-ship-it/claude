import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ARTICLES } from '@/client/data/articles'
import { useReadArticles } from '@/client/lib/hooks'
import { api } from '@/api/client'

interface ApiArticle {
  id: string; title: string; subtitle: string; image_url: string | null; read_time: number
}

export default function ArticlesWidget({ phoneHash }: { phoneHash: string }) {
  const navigate = useNavigate()
  const { isRead } = useReadArticles()
  const [apiArticles, setApiArticles] = useState<ApiArticle[] | null>(null)

  useEffect(() => {
    api.get<ApiArticle[]>('/client/articles')
      .then(d => { if (Array.isArray(d) && d.length > 0) setApiArticles(d) })
      .catch(() => {})
  }, [])

  // Use API articles if available, otherwise fall back to static
  const articles = apiArticles
    ? apiArticles.map(a => ({
        id: a.id,
        slug: a.id,
        title: a.title,
        subtitle: a.subtitle,
        readTime: a.read_time,
        image_url: a.image_url,
      }))
    : ARTICLES.map(a => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        subtitle: a.subtitle,
        readTime: a.readTime,
        image_url: null as string | null,
      }))

  if (articles.length === 0) return null

  return (
    <div className="mb-6">
      <div className="px-5 flex items-baseline justify-between mb-3">
        <h2 className="text-[17px] font-bold text-[#0A0A0C] tracking-[-0.02em]">Полезное</h2>
      </div>
      <div className="pl-5 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 pr-5">
          {articles.map(article => {
            const read = isRead(article.slug)
            return (
              <button
                key={article.id}
                onClick={() => navigate(`/client/${phoneHash}/article/${article.slug}`)}
                className="flex-shrink-0 w-[200px] rounded-[18px] overflow-hidden press-scale text-left bg-white shadow-card"
              >
                <div className="h-[100px] relative bg-[#F5F6F8]">
                  {article.image_url ? (
                    <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F0F0F0] to-[#E5E7EB]">
                      <span className="text-[32px] opacity-50">📖</span>
                    </div>
                  )}
                  {read && (
                    <div className="absolute top-2.5 right-2.5 bg-white/90 rounded-full w-5 h-5 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 inline-flex items-center bg-white/90 rounded-full px-2 py-0.5">
                    <span className="text-[10px] text-[#6B7280] font-semibold">{article.readTime} мин</span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[13px] font-bold text-[#0A0A0C] leading-tight line-clamp-2">{article.title}</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-1 truncate">{article.subtitle}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
